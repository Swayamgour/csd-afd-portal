import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import { ticketService } from '../../services/ticket.service.js';

export default function CsdSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getTickets({
        status: statusFilter,
        search: searchTerm
      });
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, searchTerm]);

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Complainant', accessor: 'userName', render: (row) => <div><span className="font-semibold block">{row.userName}</span><span className="micro muted">{row.serviceNumber || row.userRole}</span></div> },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Level',
      accessor: 'escalationLevel',
      render: (row) => (
        <span className={`badge-pill ${row.escalationLevel === 4 ? 'badge-danger' : 'badge-primary'} badge-sm`}>
          Level {row.escalationLevel}
        </span>
      )
    },
    {
      header: 'SLA Status',
      accessor: 'slaStatus',
      render: (row) => <StatusBadge status={row.slaStatus} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <Link to={`/helpdesk/tickets/${row.id}`} className="btn sm out">
          Review Case
        </Link>
      )
    }
  ];

  return (
    <div className="csd-support-page">
      <PageHeader
        title="Helpdesk & Grievance Directorate Oversight"
        subtitle="Supervise multi-tier service desk operations, SLA compliance, and investigate escalated dealer disputes"
      />

      <FilterBar
        hasActiveFilters={statusFilter !== 'All' || !!searchTerm}
        onReset={() => {
          setStatusFilter('All');
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Tickets</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Ticket ID, Complainant, or Keyword..."
            size="sm"
          />
        </div>

        <div className="w-48">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Open', label: 'Open' },
              { value: 'In_Progress', label: 'In Progress' },
              { value: 'Escalated', label: 'Escalated' },
              { value: 'Resolved', label: 'Resolved' }
            ]}
          />
        </div>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
        />
      </Card>
    </div>
  );
}
