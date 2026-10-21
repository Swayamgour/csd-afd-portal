import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetOrdersQuery } from '../demand/demandApi.js';

export default function DepotOrders() {
  const { data: ordersData, isLoading: loading, isFetching, refetch } = useGetOrdersQuery();

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData)
    ? ordersData
    : [];

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (row) => <span className="font-semibold text-brand">{row.orderNo || row._id}</span>,
    },
    {
      header: 'Applicant',
      accessor: 'beneficiaryId',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.beneficiaryId?.fullName || 'Applicant'}</span>
          <span className="micro muted">{row.beneficiaryId?.serviceNumber || ''}</span>
        </div>
      ),
    },
    {
      header: 'Vehicle / Product',
      accessor: 'items',
      render: (row) => row.items?.[0]?.name || row.productName || 'AFD Product',
    },
    {
      header: 'Dealership',
      accessor: 'dealerId',
      render: (row) => row.dealerId?.name || row.dealer || 'Authorized Dealership',
    },
    {
      header: 'Chassis / VIN',
      accessor: 'delivery',
      render: (row) => (
        <span className="font-mono small">
          {row.delivery?.trackingNo || row.chassisNumber || 'In Allocation'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Supply Order PDF',
      accessor: '_id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => alert(`Certified Depot Supply Order: ${row.orderNo || row._id}`)}
        >
          <Download size={13} />
          <span>Download</span>
        </button>
      ),
    },
  ];

  return (
    <div className="depot-orders-page">
      <PageHeader
        title="Regional Depot Supply Orders"
        subtitle="Monitor vehicle dispatches, showroom delivery status, and chassis allocation records"
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
        <DataTable columns={columns} data={orders} loading={loading} />
      </Card>
    </div>
  );
}
