import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { ticketService } from '../../services/ticket.service.js';

export default function OemSupport() {
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
    <div className="oem-support-page">
      <PageHeader
        title="OEM Technical & Supply Support Desk"
        subtitle="Manage queries regarding homologation files, chassis allocation sync, and portal API integrations"
      />
      <Card>
        <DataTable columns={columns} data={tickets} loading={loading} />
      </Card>
    </div>
  );
}
