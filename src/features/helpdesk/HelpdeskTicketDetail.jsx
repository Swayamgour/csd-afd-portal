import React, { useState, useEffect } from 'react';
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
import { ticketService } from '../../services/ticket.service';
import { kbService } from '../../services/kb.service';

export const HelpdeskTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestedKb, setSuggestedKb] = useState([]);

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

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTicketById(id || 'HD-2024-8801');
      const data = res.data || res;
      setTicket(data);
      if (data?.category) {
        const kbRes = await kbService.searchArticles(data.category);
        setSuggestedKb((kbRes.data || []).slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await ticketService.addTimelineEvent(ticket.id, {
      title: 'Agent Response Sent',
      desc: replyText,
      by: user?.name || 'Helpdesk Agent',
      type: 'reply'
    });
    setReplyText('');
    setActionSuccess('Reply dispatched to citizen email and notification tray.');
    fetchTicket();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) return;
    await ticketService.addTimelineEvent(ticket.id, {
      title: 'Internal Confidential Note Added',
      desc: internalNote,
      by: user?.name || 'Helpdesk Agent',
      type: 'internal_note'
    });
    setInternalNote('');
    setActionSuccess('Confidential note pinned to audit history.');
    fetchTicket();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleAssign = async () => {
    if (!assignAgent) return;
    await ticketService.assignTicket(ticket.id, assignAgent);
    setShowAssignModal(false);
    setActionSuccess(`Ticket successfully assigned to ${assignAgent}.`);
    fetchTicket();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleEscalate = async () => {
    if (!escalateReason) return;
    await ticketService.escalateTicket(ticket.id, escalateLevel, escalateReason);
    setShowEscalateModal(false);
    setActionSuccess(`Ticket escalated to ${escalateLevel}. SLA alert triggered.`);
    fetchTicket();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleResolve = async () => {
    if (!resolutionSummary) return;
    await ticketService.resolveTicket(ticket.id, resolutionSummary);
    setShowResolveModal(false);
    setActionSuccess('Ticket marked RESOLVED. Closing confirmation sent to citizen.');
    fetchTicket();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  if (loading) return <LoadingState text="Loading ticket dossier, audit timeline, and escalation matrix..." />;
  if (!ticket) return <div className="alert alert-danger">Ticket reference not found.</div>;

  // Escalation Matrix Levels
  const escalationLevels = [
    { level: 1, title: 'Level 1: Helpdesk Agent', desc: 'Frontline citizen triage, entitlement checks, initial response.' },
    { level: 2, title: 'Level 2: Technical Team', desc: 'Gateway timeouts, challan reconciliation, portal sync errors.' },
    { level: 3, title: 'Level 3: Specialist / Dev', desc: 'Core ledger correction, database locks, OEM API failures.' },
    { level: 4, title: 'Level 4: CSD HQ Escalation', desc: 'Departmental review, Quartermaster sanction override.' }
  ];

  const currentLevelNum = ticket.escalationLevel?.includes('Level 4')
    ? 4
    : ticket.escalationLevel?.includes('Level 3')
    ? 3
    : ticket.escalationLevel?.includes('Level 2')
    ? 2
    : 1;

  return (
    <div className="helpdesk-ticket-detail-view">
      <PageHeader
        title={`Incident Ticket: ${ticket.id}`}
        subtitle={`Reported by ${ticket.citizenName} • Service No: ${ticket.serviceNo || 'N/A'}`}
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Tickets', href: '/helpdesk/tickets' },
          { label: ticket.id }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <StatusBadge status={ticket.status} />
            <StatusBadge status={ticket.priority} />
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
                <strong>{ticket.id}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CATEGORY</span>
                <span className="badge" style={{ background: '#f1f5f9', color: '#1e293b' }}>{ticket.category}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SUB-CATEGORY</span>
                <span>{ticket.subCategory || 'General Inconvenience'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SEVERITY / PRIORITY</span>
                <StatusBadge status={ticket.priority} />
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>INTAKE SOURCE</span>
                <span>{ticket.source || 'Beneficiary Web Portal'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CREATED DATE & TIME</span>
                <span>{ticket.createdAt}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SLA DEADLINE</span>
                <strong style={{ color: '#b91c1c' }}>{ticket.slaDeadline || '24 Hours (Active)'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>ASSIGNED OFFICER</span>
                <span>{ticket.assignedTo || 'Unassigned'}</span>
              </div>
            </div>
          </Card>

          <Card title="Beneficiary Dossier">
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CITIZEN / VETERAN</span>
                <strong>{ticket.citizenName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SERVICE IDENTIFIER</span>
                <span>{ticket.serviceNo || 'ARMY-1994827-X'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>ATTACHED DEPOT</span>
                <span>{ticket.depot || 'Delhi Cantt Base Depot'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PHONE / MOBILE</span>
                <span>+91 98765 43210 (Verified)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>LINKED DEMAND</span>
                {ticket.demandId ? (
                  <Link to={`/csd/demands`} style={{ color: 'var(--brand)', textDecoration: 'underline' }}>
                    {ticket.demandId}
                  </Link>
                ) : 'None Linked'}
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
            <Timeline items={ticket.timeline || []} />
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
                <Button size="sm" onClick={handleSendReply} disabled={!replyText.trim()}>
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
              <Can permission="tickets.assign">
                <Button variant="outline" size="sm" fullWidth onClick={() => setShowAssignModal(true)}>
                  Assign / Reassign Officer
                </Button>
              </Can>
              <Can permission="tickets.escalate">
                <Button variant="secondary" size="sm" fullWidth onClick={() => setShowEscalateModal(true)}>
                  Escalate Incident (L1 → L4)
                </Button>
              </Can>
              <Can permission="tickets.resolve">
                <Button variant="primary" size="sm" fullWidth onClick={() => setShowResolveModal(true)}>
                  Mark as Resolved
                </Button>
              </Can>
            </div>
          </Card>

          {/* 4-LEVEL ESCALATION VISUALIZATION */}
          <Card title="4-Level Escalation Matrix">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {escalationLevels.map((lvl) => {
                const isActive = currentLevelNum === lvl.level;
                const isPassed = currentLevelNum > lvl.level;
                return (
                  <div
                    key={lvl.level}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '6px',
                      border: isActive ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                      background: isActive ? '#fef2f2' : isPassed ? '#f8fafc' : '#ffffff',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: isActive ? '#991b1b' : '#1e293b' }}>
                        {lvl.title}
                      </strong>
                      {isActive && <span className="badge" style={{ background: '#b91c1c', color: '#fff', fontSize: '0.65rem' }}>ACTIVE</span>}
                      {isPassed && <span style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓ Passed</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{lvl.desc}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* SUGGESTED KNOWLEDGE BASE ARTICLES */}
          <Card title="Suggested Knowledge Articles">
            {suggestedKb.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No automated KB matches for this category.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {suggestedKb.map((art) => (
                  <div key={art.id} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <Link to={`/helpdesk/knowledge-base/${art.id}`} style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brand)' }}>
                      {art.title}
                    </Link>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Category: {art.category} • {art.helpfulCount || 18} helpful votes
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>

      {/* ASSIGN MODAL */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Incident Ticket">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Select Certified Support Officer"
            value={assignAgent}
            onChange={(e) => setAssignAgent(e.target.value)}
            options={[
              { value: '', label: '-- Select Officer --' },
              { value: 'Officer Vikram Singh (L1 Delhi Cantt)', label: 'Officer Vikram Singh (L1 Delhi Cantt)' },
              { value: 'Officer Priya Sharma (L2 Payments)', label: 'Officer Priya Sharma (L2 Payments)' },
              { value: 'Tech Team (Gateway & SBI ePay)', label: 'Tech Team (Gateway & SBI ePay)' },
              { value: 'CSD HQ Directorate Desk', label: 'CSD HQ Directorate Desk' }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignAgent}>Confirm Assignment</Button>
          </div>
        </div>
      </Modal>

      {/* ESCALATE MODAL */}
      <Modal isOpen={showEscalateModal} onClose={() => setShowEscalateModal(false)} title="Formal Escalation of Incident">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Target Escalation Tier"
            value={escalateLevel}
            onChange={(e) => setEscalateLevel(e.target.value)}
            options={[
              { value: 'Level 2 - Technical Team', label: 'Level 2 - Technical Team (ePay/Server/DB Sync)' },
              { value: 'Level 3 - Specialist / Development', label: 'Level 3 - Specialist / Core AFD Ledger' },
              { value: 'Level 4 - CSD Escalation', label: 'Level 4 - CSD HQ Executive Escalation' }
            ]}
          />
          <Input
            label="Mandatory Escalation Justification"
            placeholder="Reason for breach / technical inability to resolve at current tier"
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>Cancel</Button>
            <Button variant="secondary" onClick={handleEscalate} disabled={!escalateReason}>Authorize Escalation</Button>
          </div>
        </div>
      </Modal>

      {/* RESOLVE MODAL */}
      <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title="Complete & Resolve Ticket">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Resolution Summary"
            placeholder="Detail steps taken, refund UTR, or demand clearance advice"
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleResolve} disabled={!resolutionSummary}>Mark Resolved</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default HelpdeskTicketDetail;
