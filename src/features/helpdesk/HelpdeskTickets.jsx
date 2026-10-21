import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterBar } from '../../components/common/FilterBar';
import { Button } from '../../components/common/Button';
import { useGetTicketsQuery } from './ticketApi';

export const HelpdeskTickets = ({ filterPreset = 'all' }) => {
  const queryParams = {};
  if (filterPreset === 'escalated') queryParams.status = 'ESCALATED';

  const { data: ticketsData, isLoading: loading, isFetching, refetch } = useGetTicketsQuery(queryParams);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const tickets = Array.isArray(ticketsData)
    ? ticketsData
    : Array.isArray(ticketsData?.items)
    ? ticketsData.items
    : [];

  const filteredTickets = tickets.filter((t) => {
    const id = t.ticketNo || t._id || '';
    const subj = t.subject || '';
    const citizen = t.requester?.name || t.userName || '';
    const matchesSearch =
      !search ||
      id.toLowerCase().includes(search.toLowerCase()) ||
      subj.toLowerCase().includes(search.toLowerCase()) ||
      citizen.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.severity === priorityFilter || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'ticketNo',
      render: (t) => (
        <Link to={`/helpdesk/tickets/${t._id || t.id}`} style={{ fontWeight: 600, color: 'var(--brand)' }}>
          {t.ticketNo || t._id}
        </Link>
      ),
    },
    {
      header: 'Beneficiary',
      accessor: 'requester',
      render: (t) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t.requester?.name || t.userName || 'Beneficiary'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.requester?.mobile || t.serviceNumber || 'Applicant'}</div>
        </div>
      ),
    },
    {
      header: 'Subject & Category',
      accessor: 'subject',
      render: (t) => (
        <div>
          <div style={{ fontWeight: 500 }}>{t.subject}</div>
          <span className="badge" style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569' }}>
            {t.category}
          </span>
        </div>
      ),
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (t) => (
        <span className={`badge-pill ${t.severity === 'HIGH' || t.severity === 'CRITICAL' ? 'badge-danger' : 'badge-primary'} badge-sm`}>
          {t.severity || 'NORMAL'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (t) => (
        <Link to={`/helpdesk/tickets/${t._id || t.id}`}>
          <Button variant="outline" size="sm">Triage</Button>
        </Link>
      ),
    },
  ];

  const pageTitle =
    filterPreset === 'my'
      ? 'My Assigned Incidents'
      : filterPreset === 'unassigned'
      ? 'Unassigned Ticket Intake'
      : filterPreset === 'escalated'
      ? 'Escalated Incidents (L2-L4)'
      : 'Helpdesk Master Incident Queue';

  return (
    <div className="helpdesk-tickets-page">
      <PageHeader
        title={pageTitle}
        subtitle="Citizen grievance redressal, SLA tracking, and escalation management"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Tickets' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Link to="/helpdesk/knowledge-base">
              <Button variant="secondary" size="sm">Knowledge Base</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by Ticket ID, citizen, subject..."
          filters={[
            {
              name: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Statuses' },
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'ESCALATED', label: 'Escalated' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' },
              ],
            },
            {
              name: 'priority',
              label: 'Priority',
              value: priorityFilter,
              onChange: (e) => setPriorityFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Priorities' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ],
            },
          ]}
        />

        <DataTable
          columns={columns}
          data={filteredTickets}
          loading={loading}
          emptyMessage="No incident tickets matching the selected criteria."
        />
      </Card>
    </div>
  );
};

export default HelpdeskTickets;
