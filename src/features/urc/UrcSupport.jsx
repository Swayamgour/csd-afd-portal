import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { ticketService } from '../../services/ticket.service.js';

export default function UrcSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await ticketService.getTickets();
      setTickets(data);
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Ticket ID', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Complainant', accessor: 'userName' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Review',
      accessor: 'id',
      render: (r) => (
        <Link to={`/helpdesk/tickets/${r.id}`} className="btn sm out">
          Review
        </Link>
      )
    }
  ];

  return (
    <div className="urc-support-page">
      <PageHeader
        title="URC Support Desk"
        subtitle="Assistance and queries concerning unit canteen verification and beneficiary records"
      />
      <Card>
        <DataTable columns={columns} data={tickets} loading={loading} />
      </Card>
    </div>
  );
}
