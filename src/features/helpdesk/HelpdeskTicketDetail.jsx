import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Timeline } from '../../components/common/Timeline';
import { LoadingState } from '../../components/common/States';
import { Can } from '../../permissions/Can';
import { useAuth } from '../../context/AuthContext';
import {
  useGetTicketByIdQuery,
  useAddTicketMessageMutation,
  useAssignTicketMutation,
  useUpdateTicketStatusMutation,
  useGetKbArticlesQuery,
} from './ticketApi';

export const HelpdeskTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: ticket, isLoading: loading, refetch } = useGetTicketByIdQuery(id);
  const [addTicketMessage, { isLoading: isSendingReply }] = useAddTicketMessageMutation();
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
  const [updateTicketStatus, { isLoading: isUpdatingStatus }] = useUpdateTicketStatusMutation();

  const { data: kbArticles } = useGetKbArticlesQuery(
    ticket?.category ? { category: ticket.category } : undefined,
    { skip: !ticket?.category }
  );

  const suggestedKb = Array.isArray(kbArticles) ? kbArticles.slice(0, 3) : [];

  // Modals & Action States
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const [assignAgent, setAssignAgent] = useState('');
  const [escalateLevel, setEscalateLevel] = useState('Level 2 - Technical Team');
  const [escalateReason, setEscalateReason] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleSendReply = async () => {
    if (!replyText.trim() || !ticket) return;
    try {
      await addTicketMessage({
        id: ticket._id || ticket.id,
        body: replyText,
        isInternal: false,
      }).unwrap();
      setReplyText('');
      setActionSuccess('Reply dispatched to citizen email and notification tray.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error sending reply');
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim() || !ticket) return;
    try {
      await addTicketMessage({
        id: ticket._id || ticket.id,
        body: internalNote,
        isInternal: true,
      }).unwrap();
      setInternalNote('');
      setActionSuccess('Confidential note pinned to audit history.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error adding note');
    }
  };

  const handleAssign = async () => {
    if (!assignAgent || !ticket) return;
    try {
      await assignTicket({
        id: ticket._id || ticket.id,
        assignedTo: assignAgent,
      }).unwrap();
      setShowAssignModal(false);
      setActionSuccess(`Ticket successfully assigned to ${assignAgent}.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error assigning ticket');
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason || !ticket) return;
    try {
      await updateTicketStatus({
        id: ticket._id || ticket.id,
        status: 'ESCALATED',
        note: `Escalated to ${escalateLevel}: ${escalateReason}`,
      }).unwrap();
      setShowEscalateModal(false);
      setActionSuccess(`Ticket escalated to ${escalateLevel}. SLA alert triggered.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error escalating ticket');
    }
  };

  const handleResolve = async () => {
    if (!resolutionSummary || !ticket) return;
    try {
      await updateTicketStatus({
        id: ticket._id || ticket.id,
        status: 'RESOLVED',
        note: resolutionSummary,
      }).unwrap();
      setShowResolveModal(false);
      setActionSuccess('Ticket marked RESOLVED. Closing confirmation sent to citizen.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error resolving ticket');
    }
  };

  if (loading) return <LoadingState text="Loading ticket dossier, audit timeline, and escalation matrix..." />;
  if (!ticket) return <div className="alert alert-danger">Ticket reference not found.</div>;

  const ticketId = ticket.ticketNo || ticket._id || ticket.id;
  const complainantName = ticket.requester?.name || ticket.userName || 'Beneficiary';

  // Format messages as timeline
  const timelineItems = Array.isArray(ticket.messages)
    ? ticket.messages.map((m) => ({
        title: m.isInternal ? 'Internal Staff Note' : 'Response Message',
        desc: m.body,
        by: m.author?.name || 'Staff Officer',
        time: m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN') : '',
        type: m.isInternal ? 'internal_note' : 'reply',
      }))
    : [];

  return (
    <div className="helpdesk-ticket-detail-view">
      <PageHeader
        title={`Incident Ticket: ${ticketId}`}
        subtitle={`Reported by ${complainantName}`}
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Tickets', href: '/helpdesk/tickets' },
          { label: ticketId },
        ]}
        actions={
          <div className="portal-flex-align-center-gap-sm">
            <StatusBadge status={ticket.status} />
            <Link to="/helpdesk/tickets">
              <Button variant="outline" size="sm">Back to Queue</Button>
            </Link>
          </div>
        }
      />

      {actionSuccess && (
        <div className="alert alert-success alert-dismissible-flex">
          <span>✓ {actionSuccess}</span>
          <button className="portal-btn-dismiss" onClick={() => setActionSuccess('')}>✕</button>
        </div>
      )}

      {/* 3-COLUMN HELPDESK WORKSPACE */}
      <div className="helpdesk-ticket-grid-3">
        
        {/* COLUMN 1: LEFT - TICKET & CITIZEN INFORMATION */}
        <div className="portal-flex-col-gap-md">
          <Card title="Ticket Information">
            <div className="portal-flex-col-gap-sm-text">
              <div>
                <span className="helpdesk-label-muted">TICKET ID</span>
                <strong>{ticketId}</strong>
              </div>
              <div>
                <span className="helpdesk-label-muted">CATEGORY</span>
                <span className="badge badge-subtle-slate">{ticket.category || 'General'}</span>
              </div>
              <div>
                <span className="helpdesk-label-muted">SEVERITY</span>
                <span className="badge badge-subtle-danger">{ticket.severity || 'NORMAL'}</span>
              </div>
              <div>
                <span className="helpdesk-label-muted">INTAKE SOURCE</span>
                <span>{ticket.source || 'PORTAL'}</span>
              </div>
              <div>
                <span className="helpdesk-label-muted">CREATED DATE & TIME</span>
                <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN') : '-'}</span>
              </div>
              <div>
                <span className="helpdesk-label-muted">SLA RESOLUTION DUE</span>
                <strong className="helpdesk-val-danger">
                  {ticket.sla?.resolutionDue ? new Date(ticket.sla.resolutionDue).toLocaleString('en-IN') : 'Standard SLA Active'}
                </strong>
              </div>
            </div>
          </Card>

          <Card title="Beneficiary Dossier">
            <div className="portal-flex-col-gap-sm-text">
              <div>
                <span className="helpdesk-label-muted">CITIZEN / VETERAN</span>
                <strong>{complainantName}</strong>
              </div>
              <div>
                <span className="helpdesk-label-muted">MOBILE NUMBER</span>
                <span>{ticket.requester?.mobile || '+91 Verified Mobile'}</span>
              </div>
              <div>
                <span className="helpdesk-label-muted">EMAIL</span>
                <span>{ticket.requester?.email || 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 2: CENTER - CONVERSATION & TIMELINE */}
        <div className="portal-flex-col-gap-md">
          <Card title="Citizen Query & Description">
            <div className="helpdesk-query-card">
              <h4 className="helpdesk-query-title">{ticket.subject}</h4>
              <p className="helpdesk-query-desc">{ticket.description}</p>
            </div>
          </Card>

          {/* Conversation / Audit Timeline */}
          <Card title="Activity & Communication Timeline">
            {timelineItems.length === 0 ? (
              <p className="muted small">No replies or notes logged yet.</p>
            ) : (
              <Timeline items={timelineItems} />
            )}
          </Card>

          {/* Citizen Reply Box */}
          <Card title="Respond to Beneficiary">
            <div className="portal-flex-col-gap-sm">
              <textarea
                rows={4}
                className="form-control"
                placeholder="Compose official resolution update or clarification to citizen..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="portal-flex-between-center">
                <span className="portal-subtext-muted">
                  This message will be dispatched via SMS & Email notification to beneficiary.
                </span>
                <Button size="sm" onClick={handleSendReply} loading={isSendingReply} disabled={!replyText.trim()}>
                  Send Citizen Response
                </Button>
              </div>
            </div>
          </Card>

          {/* Internal Staff Confidential Note */}
          <Card title="Internal Confidential Note (Restricted to Officials)">
            <div className="portal-flex-col-gap-sm">
              <textarea
                rows={2}
                className="form-control"
                placeholder="Log internal finding, payment trace UTR, or escalation reason (hidden from citizen)..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
              <div className="portal-flex-end">
                <Button variant="secondary" size="sm" onClick={handleAddInternalNote} disabled={!internalNote.trim()}>
                  Pin Confidential Note
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 3: RIGHT - 4-LEVEL ESCALATION, SLA, ACTIONS, KB SUGGESTIONS */}
        <div className="portal-flex-col-gap-md">
          
          {/* Action Hub */}
          <Card title="Ticket Governance Actions">
            <div className="portal-flex-col-gap-xs">
              <Button variant="outline" size="sm" fullWidth onClick={() => setShowAssignModal(true)}>
                Assign / Reassign Officer
              </Button>
              <Button variant="secondary" size="sm" fullWidth onClick={() => setShowEscalateModal(true)}>
                Escalate Incident Tier
              </Button>
              <Button variant="primary" size="sm" fullWidth onClick={() => setShowResolveModal(true)}>
                Resolve & Close Ticket
              </Button>
            </div>
          </Card>

          {/* Suggested Knowledge Base SOPs */}
          <Card title="Suggested Knowledge Base SOPs">
            {suggestedKb.length === 0 ? (
              <p className="muted small">No articles tagged for this category.</p>
            ) : (
              <div className="portal-flex-col-gap-sm">
                {suggestedKb.map((art) => (
                  <div key={art._id || art.id} className="helpdesk-kb-item">
                    <Link to={`/helpdesk/knowledge-base/${art._id || art.id}`} className="helpdesk-kb-link">
                      {art.title}
                    </Link>
                    <p className="helpdesk-kb-snippet">
                      {art.content ? art.content.slice(0, 80) + '...' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* MODALS */}
      {showAssignModal && (
        <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Ticket to Officer">
          <Input
            label="Officer Username or Name"
            placeholder="e.g. nodal_delhi"
            value={assignAgent}
            onChange={(e) => setAssignAgent(e.target.value)}
          />
          <div className="director-modal-actions">
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button loading={isAssigning} onClick={handleAssign}>Assign</Button>
          </div>
        </Modal>
      )}

      {showEscalateModal && (
        <Modal isOpen={showEscalateModal} onClose={() => setShowEscalateModal(false)} title="Escalate Incident Tier">
          <Select
            label="Escalate Target Level"
            value={escalateLevel}
            onChange={(e) => setEscalateLevel(e.target.value)}
            options={[
              { value: 'Level 2 - Technical Team', label: 'Level 2: Technical Gateway Team' },
              { value: 'Level 3 - Specialist Officer', label: 'Level 3: Quartermaster Specialist' },
              { value: 'Level 4 - CSD HQ Escalation', label: 'Level 4: CSD Head Office Directorate' },
            ]}
          />
          <div className="form-field">
            <label className="form-label">Reason for Escalation</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Explain why this requires senior intervention..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
            />
          </div>
          <div className="director-modal-actions">
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>Cancel</Button>
            <Button loading={isUpdatingStatus} onClick={handleEscalate}>Confirm Escalation</Button>
          </div>
        </Modal>
      )}

      {showResolveModal && (
        <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title="Mark Incident as Resolved">
          <div className="form-field">
            <label className="form-label">Resolution Summary to Citizen</label>
            <textarea
              rows={4}
              className="form-control"
              placeholder="State the resolution steps taken and advice to beneficiary..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
            />
          </div>
          <div className="director-modal-actions">
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>Cancel</Button>
            <Button loading={isUpdatingStatus} onClick={handleResolve}>Submit Resolution</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HelpdeskTicketDetail;
