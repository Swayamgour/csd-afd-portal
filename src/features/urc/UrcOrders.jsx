import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetOrdersQuery } from '../demand/demandApi.js';

export default function UrcOrders() {
  const { data: ordersData, isLoading: loading, isFetching, refetch } = useGetOrdersQuery();

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData)
    ? ordersData
    : [];

  const columns = [
    {
      header: 'Order Ref',
      accessor: 'orderNo',
      render: (r) => <span className="font-semibold text-brand">{r.orderNo || r._id}</span>,
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiaryId',
      render: (r) => r.beneficiaryId?.fullName || 'Applicant',
    },
    {
      header: 'Item / Vehicle',
      accessor: 'items',
      render: (r) => r.items?.[0]?.name || r.productName || 'AFD Product',
    },
    {
      header: 'Dealer Showroom',
      accessor: 'dealerId',
      render: (r) => r.dealerId?.name || r.dealer || 'Authorized Dealership',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="urc-orders-page">
      <PageHeader
        title="Unit Supply Orders Tracking"
        subtitle="Track delivery execution for personnel under this unit canteen"
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
