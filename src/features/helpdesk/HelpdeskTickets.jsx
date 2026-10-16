import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterBar } from '../../components/common/FilterBar';
import { Button } from '../../components/common/Button';
import { ExportButton } from '../../components/common/ExportButton';
import { ticketService } from '../../services/ticket.service';

export const HelpdeskTickets = ({ filterPreset = 'all' }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchTickets();
  }, [filterPreset]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let res;
      if (filterPreset === 'my') {
        res = await ticketService.getMyTickets();
      } else if (filterPreset === 'unassigned') {
        res = await ticketService.getUnassignedTickets();
      } else if (filterPreset === 'escalated') {
        res = await ticketService.getEscalatedTickets();
      } else {
        res = await ticketService.getTickets();
      }
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.citizenName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      render: (t) => (
        <Link to={`/helpdesk/tickets/${t.id}`} style={{ fontWeight: 600, color: 'var(--brand)' }}>
          {t.id}
        </Link>
      )
    },
    {
      header: 'Beneficiary',
      accessor: 'citizenName',
      render: (t) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t.citizenName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.serviceNo || 'ARMY Veteran'}</div>
        </div>
      )
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
      )
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (t) => <StatusBadge status={t.priority} />
    },
    {
      header: 'Escalation Tier',
      accessor: 'escalationLevel',
      render: (t) => (
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: t.escalationLevel?.includes('Level 4') ? '#b91c1c' : '#334155' }}>
          {t.escalationLevel || 'Level 1'}
        </span>
      )
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo',
      render: (t) => (
        <span style={{ fontSize: '0.8rem' }}>
          {t.assignedTo || <span style={{ color: '#d97706', fontStyle: 'italic' }}>Unassigned</span>}
        </span>
      )
    },
    {
      header: 'SLA Status',
      accessor: 'slaStatus',
      render: (t) => (
        <span style={{
          fontSize: '0.75rem',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 600,
          background: t.slaStatus === 'Breached' ? '#fee2e2' : '#f0fdf4',
          color: t.slaStatus === 'Breached' ? '#b91c1c' : '#15803d'
        }}>
          {t.slaStatus || 'Within SLA'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (t) => <StatusBadge status={t.status} />
    },
    {
      header: 'Action',
      accessor: 'actions',
      render: (t) => (
        <Link to={`/helpdesk/tickets/${t.id}`}>
          <Button variant="outline" size="sm">Triage</Button>
        </Link>
      )
    }
  ];

  const pageTitle = filterPreset === 'my'
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
          { label: 'Tickets' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ExportButton data={filteredTickets} filename="Helpdesk_Tickets_Export" />
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
                { value: 'CLOSED', label: 'Closed' }
              ]
            },
            {
              name: 'priority',
              label: 'Priority',
              value: priorityFilter,
              onChange: (e) => setPriorityFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Priorities' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' }
              ]
            }
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
