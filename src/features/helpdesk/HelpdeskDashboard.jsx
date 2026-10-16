import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Users,
  PhoneCall,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { ticketService } from '../../services/ticket.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function HelpdeskDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, tList] = await Promise.all([
          ticketService.getMetrics(),
          ticketService.getTickets()
        ]);
        setMetrics(m);
        setTickets(tList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const ticketColumns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      render: (r) => <span className="font-semibold text-brand">{r.id}</span>
    },
    { header: 'Complainant', accessor: 'userName', render: (r) => <div><span className="font-semibold block">{r.userName}</span><span className="micro muted">{r.serviceNumber || r.userRole}</span></div> },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (r) => (
        <span className={`badge-pill ${r.priority === 'P1' ? 'badge-danger' : 'badge-primary'} badge-sm`}>
          {r.priority}
        </span>
      )
    },
    {
      header: 'Escalation Level',
      accessor: 'escalationLevel',
      render: (r) => (
        <span className={`badge-pill ${r.escalationLevel >= 3 ? 'badge-danger' : 'badge-primary'} badge-sm`}>
          Level {r.escalationLevel}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (r) => (
        <Link to={`/helpdesk/tickets/${r.id}`} className="btn sm out">
          Respond
        </Link>
      )
    }
  ];

  return (
    <div className="helpdesk-dashboard-page">
      <PageHeader
        title="CSD AFD National Service Desk Operations"
        subtitle={`Agent Console: ${user?.name} (${user?.tier || 'L1/L2 Support'}) · Multi-Tier SLA & Escalation Management`}
        actions={
          <div className="row gap-1">
            <Link to="/helpdesk/unassigned" className="btn btn-primary">
              Take Next Unassigned Ticket
            </Link>
          </div>
        }
      />

      {/* 8 Core Metrics from RFP */}
      <div className="kpi-grid mb-3">
        <StatCard
          title="Open Tickets"
          value={metrics?.openTickets || 24}
          subtext="Active in Queue"
          icon={MessageSquare}
          variant="primary"
          onClick={() => navigate('/helpdesk/tickets')}
        />
        <StatCard
          title="Pending Tickets"
          value={metrics?.pendingTickets || 12}
          subtext="Awaiting User Info"
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/helpdesk/tickets')}
        />
        <StatCard
          title="Escalated Tickets (L2-L4)"
          value={metrics?.escalatedTickets || 5}
          subtext="Higher Tier Attention"
          icon={ShieldAlert}
          variant="danger"
          onClick={() => navigate('/helpdesk/escalated')}
        />
        <StatCard
          title="SLA Breaches"
          value={metrics?.slaBreaches || 2}
          subtext="Critical Priority P1"
          icon={AlertTriangle}
          variant="danger"
          onClick={() => navigate('/helpdesk/escalated')}
        />
        <StatCard
          title="Resolved Today"
          value={metrics?.resolvedToday || 38}
          subtext="Same-Day Clearances"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/helpdesk/tickets')}
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${metrics?.averageResolutionHours || 4.2} hrs`}
          subtext="Target SLA < 24 hrs"
          icon={Clock}
          variant="default"
          onClick={() => navigate('/helpdesk/reports')}
        />
        <StatCard
          title="Customer Satisfaction"
          value={`${metrics?.customerSatisfactionScore || 94.6}%`}
          subtext="CSAT Feedback Rating"
          icon={Award}
          variant="success"
          onClick={() => navigate('/helpdesk/feedback')}
        />
        <StatCard
          title="Inbound Calls Today"
          value={metrics?.callRecordsToday || 142}
          subtext="Toll-Free Helpline"
          icon={PhoneCall}
          variant="default"
          onClick={() => navigate('/helpdesk/call-records')}
        />
      </div>

      {/* Quick Queues */}
      <div className="grid-2-col gap-2 mb-3">
        <Card
          title="Critical & Breached SLA Tickets"
          subtitle="Tickets requiring immediate agent reply or CSD-HO intervention"
          actions={
            <Link to="/helpdesk/escalated" className="link small font-semibold">
              View Escalated Queue
            </Link>
          }
        >
          <div className="critical-tickets-list flex-col gap-2">
            {tickets.filter((t) => t.escalationLevel > 1).map((t) => (
              <div key={t.id} className="panel p-3 border-left-danger bg-red-soft between align-center">
                <div>
                  <div className="row align-center gap-1 mb-1">
                    <span className="font-semibold text-danger small">{t.id}</span>
                    <span className="badge-pill badge-danger badge-sm">Level {t.escalationLevel}</span>
                    <span className="micro muted">● {t.category}</span>
                  </div>
                  <h4 className="font-semibold small mb-1">{t.subject}</h4>
                  <p className="micro muted mb-0">Complainant: {t.userName}</p>
                </div>
                <Link to={`/helpdesk/tickets/${t.id}`} className="btn sm">
                  Respond
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Service Desk Shortcuts"
          subtitle="Quick access to knowledge base and operational tools"
        >
          <div className="shortcuts-grid flex-col gap-2">
            <Link to="/helpdesk/knowledge-base" className="panel p-3 between align-center bg-bg hover-lift">
              <div className="row align-center gap-1">
                <BookOpen size={20} className="text-brand" />
                <div>
                  <h4 className="font-semibold small mb-0">Search Knowledge Base</h4>
                  <span className="micro muted">Browse official policy and SOP articles</span>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/helpdesk/unassigned" className="panel p-3 between align-center bg-bg hover-lift">
              <div className="row align-center gap-1">
                <Users size={20} className="text-brand" />
                <div>
                  <h4 className="font-semibold small mb-0">Unassigned Incoming Queue</h4>
                  <span className="micro muted">Pick tickets awaiting first response</span>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/helpdesk/call-records" className="panel p-3 between align-center bg-bg hover-lift">
              <div className="row align-center gap-1">
                <PhoneCall size={20} className="text-brand" />
                <div>
                  <h4 className="font-semibold small mb-0">Inbound Call Logs</h4>
                  <span className="micro muted">Review recordings and telephony dispositions</span>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>

      {/* Live Ticket Stream */}
      <Card
        title="Live Helpdesk Tickets Queue"
        subtitle="Recent queries logged across Beneficiary, Dealer, and Depot channels"
        actions={
          <Link to="/helpdesk/tickets" className="link small font-semibold">
            All Tickets View
          </Link>
        }
      >
        <DataTable
          columns={ticketColumns}
          data={tickets}
          loading={loading}
        />
      </Card>
    </div>
  );
}
