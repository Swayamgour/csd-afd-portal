import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { ticketService } from '../../services/ticket.service.js';

export default function DealerSupport() {
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
    { header: 'Ticket Ref', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Customer', accessor: 'userName' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Category', accessor: 'category' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Review',
      accessor: 'id',
      render: (r) => (
        <Link to={`/helpdesk/tickets/${r.id}`} className="btn sm out">
          Inspect
        </Link>
      )
    }
  ];

  return (
    <div className="dealer-support-page">
      <PageHeader
        title="Dealership Inquiries & Grievances"
        subtitle="Manage customer delivery clarification requests and Depot notices"
      />
      <Card>
        <DataTable columns={columns} data={tickets} loading={loading} />
      </Card>
    </div>
  );
}
