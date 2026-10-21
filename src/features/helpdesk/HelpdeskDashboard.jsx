import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Award,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetTicketsQuery, useGetHelpdeskMisQuery } from './ticketApi.js';

export default function HelpdeskDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: ticketsData,
    isLoading: loadingTickets,
    isFetching: fetchingTickets,
    refetch: refetchTickets,
  } = useGetTicketsQuery();

  const {
    data: misData,
    isLoading: loadingMis,
    isFetching: fetchingMis,
    refetch: refetchMis,
  } = useGetHelpdeskMisQuery();

  const loading = loadingTickets || loadingMis;
  const isFetching = fetchingTickets || fetchingMis;

  const tickets = Array.isArray(ticketsData)
    ? ticketsData
    : Array.isArray(ticketsData?.items)
    ? ticketsData.items
    : [];

  const handleRefresh = async () => {
    await Promise.all([refetchTickets(), refetchMis()]);
  };

  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;
  const resolvedCount = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const escalatedCount = tickets.filter((t) => t.status === 'ESCALATED' || (Array.isArray(t.escalations) && t.escalations.length > 0)).length;

  const ticketColumns = [
    {
      header: 'Ticket ID',
      accessor: 'ticketNo',
      render: (r) => <span className="font-semibold text-brand">{r.ticketNo || r._id}</span>,
    },
    {
      header: 'Complainant',
      accessor: 'requester',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.requester?.name || r.userName || 'Beneficiary'}</span>
          <span className="micro muted">{r.requester?.mobile || r.serviceNumber || ''}</span>
        </div>
      ),
    },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (r) => (
        <span className={`badge-pill ${r.severity === 'HIGH' || r.severity === 'CRITICAL' ? 'badge-danger' : 'badge-primary'} badge-sm`}>
          {r.severity || 'NORMAL'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (r) => (
        <Link to={`/helpdesk/tickets/${r._id || r.id}`} className="btn sm out">
          Respond
        </Link>
      ),
    },
  ];

  return (
    <div className="helpdesk-dashboard-page">
      <PageHeader
        title="CSD AFD National Service Desk Operations"
        subtitle={`Agent Console: ${user?.name || 'Helpdesk Nodal Officer'} · Multi-Tier SLA & Escalation Management`}
        actions={
          <div className="row gap-1">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Link to="/helpdesk/tickets" className="btn btn-primary">
              All Tickets Queue
            </Link>
          </div>
        }
      />

      <div className="kpi-grid mb-3">
        <StatCard
          title="Open Tickets"
          value={openTicketsCount}
          subtext="Active in Queue"
          icon={MessageSquare}
          variant="primary"
          onClick={() => navigate('/helpdesk/tickets')}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtext="Being investigated"
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/helpdesk/tickets')}
        />
        <StatCard
          title="Resolved Tickets"
          value={misData?.resolvedTickets ?? resolvedCount}
          subtext="Closed within SLA"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/helpdesk/tickets')}
        />
        <StatCard
          title="SLA Compliance"
          value={`${misData?.slaCompliancePct ?? 96}%`}
          subtext="Turnaround on target"
          icon={Award}
          variant="primary"
          onClick={() => navigate('/helpdesk/reports')}
        />
      </div>

      <Card
        title="Active Grievances & Service Inquiries"
        subtitle="Live queue of registered inquiries awaiting staff action"
        actions={
          <Link to="/helpdesk/tickets" className="link small font-semibold">
            All Tickets
          </Link>
        }
      >
        <DataTable columns={ticketColumns} data={tickets} loading={loading} />
      </Card>
    </div>
  );
}
