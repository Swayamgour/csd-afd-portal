import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useGetOrdersReportQuery } from '../admin/adminApi.js';

export default function OemReports() {
  const { data: ordersData, isLoading: loading, isFetching, refetch } = useGetOrdersReportQuery();

  const orders = Array.isArray(ordersData)
    ? ordersData
    : Array.isArray(ordersData?.items)
    ? ordersData.items
    : [];

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (r) => <span className="font-semibold text-brand">{r.orderNo || r._id}</span>,
    },
    {
      header: 'Vehicle Model',
      accessor: 'items',
      render: (r) => r.items?.[0]?.name || r.productName || 'AFD Lineup Product',
    },
    {
      header: 'Dealership Showroom',
      accessor: 'dealerId',
      render: (r) => r.dealerId?.name || r.dealer || 'Dealer',
    },
    {
      header: 'Allocated Chassis VIN',
      accessor: 'delivery',
      render: (r) => r.delivery?.trackingNo || 'Pending Allocation',
    },
    {
      header: 'Total Value',
      accessor: 'amount',
      render: (r) => `₹ ${(r.amount || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="oem-reports-page">
      <PageHeader
        title="OEM Fulfilment & Turnaround Performance"
        subtitle="Quarterly analysis of factory-to-dealer transit and vehicle delivery times"
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
