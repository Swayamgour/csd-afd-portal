import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetTicketsQuery } from '../helpdesk/ticketApi.js';

export default function DealerSupport() {
  const { data: ticketsData, isLoading: loading, isFetching, refetch } = useGetTicketsQuery();

  const tickets = Array.isArray(ticketsData)
    ? ticketsData
    : Array.isArray(ticketsData?.items)
    ? ticketsData.items
    : [];

  const columns = [
    {
      header: 'Ticket Ref',
      accessor: 'ticketNo',
      render: (r) => <span className="font-semibold text-brand">{r.ticketNo || r._id}</span>,
    },
    { header: 'Subject', accessor: 'subject', render: (r) => <span className="font-semibold">{r.subject}</span> },
    { header: 'Category', accessor: 'category' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Review',
      accessor: '_id',
      render: (r) => (
        <Link to={`/helpdesk/tickets/${r._id || r.id}`} className="btn sm out">
          Inspect
        </Link>
      ),
    },
  ];

  return (
    <div className="dealer-support-page">
      <PageHeader
        title="Dealership Inquiries & Grievances"
        subtitle="Manage customer delivery clarification requests and Depot notices"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />
      <Card>
        <DataTable columns={columns} data={tickets} loading={loading} />
      </Card>
    </div>
  );
}
