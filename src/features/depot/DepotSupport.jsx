import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetTicketsQuery } from '../helpdesk/ticketApi.js';

export default function DepotSupport() {
  const { data: ticketsData, isLoading: loading, isFetching, refetch } = useGetTicketsQuery();

  const tickets = Array.isArray(ticketsData)
    ? ticketsData
    : Array.isArray(ticketsData?.items)
    ? ticketsData.items
    : [];

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'ticketNo',
      render: (r) => <span className="font-semibold text-brand">{r.ticketNo || r._id}</span>,
    },
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (r) => <span className="font-semibold">{r.subject}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
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
    <div className="depot-support-page">
      <PageHeader
        title="Depot Operational Helpdesk & Inquiries"
        subtitle="Manage dealership inquiries and beneficiary supply order delay tickets"
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
