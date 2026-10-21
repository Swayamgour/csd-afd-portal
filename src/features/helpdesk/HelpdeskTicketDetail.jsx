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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <StatusBadge status={ticket.status} />
            <Link to="/helpdesk/tickets">
              <Button variant="outline" size="sm">Back to Queue</Button>
            </Link>
          </div>
        }
      />

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>✓ {actionSuccess}</span>
          <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setActionSuccess('')}>✕</button>
        </div>
      )}

      {/* 3-COLUMN HELPDESK WORKSPACE */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* COLUMN 1: LEFT - TICKET & CITIZEN INFORMATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Ticket Information">
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>TICKET ID</span>
                <strong>{ticketId}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CATEGORY</span>
                <span className="badge" style={{ background: '#f1f5f9', color: '#1e293b' }}>{ticket.category || 'General'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SEVERITY</span>
                <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>{ticket.severity || 'NORMAL'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>INTAKE SOURCE</span>
                <span>{ticket.source || 'PORTAL'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CREATED DATE & TIME</span>
                <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN') : '-'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SLA RESOLUTION DUE</span>
                <strong style={{ color: '#b91c1c' }}>
                  {ticket.sla?.resolutionDue ? new Date(ticket.sla.resolutionDue).toLocaleString('en-IN') : 'Standard SLA Active'}
                </strong>
              </div>
            </div>
          </Card>

          <Card title="Beneficiary Dossier">
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CITIZEN / VETERAN</span>
                <strong>{complainantName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>MOBILE NUMBER</span>
                <span>{ticket.requester?.mobile || '+91 Verified Mobile'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>EMAIL</span>
                <span>{ticket.requester?.email || 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 2: CENTER - CONVERSATION & TIMELINE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Citizen Query & Description">
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid var(--navy)', marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{ticket.subject}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>{ticket.description}</p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                rows={4}
                className="form-control"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                placeholder="Compose official resolution update or clarification to citizen..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                rows={2}
                className="form-control"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fed7aa', background: '#fffbeb', fontSize: '0.85rem' }}
                placeholder="Log internal finding, payment trace UTR, or escalation reason (hidden from citizen)..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="secondary" size="sm" onClick={handleAddInternalNote} disabled={!internalNote.trim()}>
                  Pin Confidential Note
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 3: RIGHT - 4-LEVEL ESCALATION, SLA, ACTIONS, KB SUGGESTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Action Hub */}
          <Card title="Ticket Governance Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {suggestedKb.map((art) => (
                  <div key={art._id || art.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    <Link to={`/helpdesk/knowledge-base/${art._id || art.id}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)' }}>
                      {art.title}
                    </Link>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reason for Escalation</label>
            <textarea
              rows={3}
              className="form-control"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              placeholder="Explain why this requires senior intervention..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>Cancel</Button>
            <Button loading={isUpdatingStatus} onClick={handleEscalate}>Confirm Escalation</Button>
          </div>
        </Modal>
      )}

      {showResolveModal && (
        <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title="Mark Incident as Resolved">
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Resolution Summary to Citizen</label>
            <textarea
              rows={4}
              className="form-control"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              placeholder="State the resolution steps taken and advice to beneficiary..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>Cancel</Button>
            <Button loading={isUpdatingStatus} onClick={handleResolve}>Submit Resolution</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HelpdeskTicketDetail;
