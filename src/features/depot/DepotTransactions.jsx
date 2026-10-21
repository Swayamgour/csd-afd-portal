import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useGetPaymentsQuery } from '../payment/paymentApi.js';

export default function DepotTransactions() {
  const { data: paymentsData, isLoading: loading, isFetching, refetch } = useGetPaymentsQuery();

  const payments = Array.isArray(paymentsData?.items)
    ? paymentsData.items
    : Array.isArray(paymentsData)
    ? paymentsData
    : [];

  const columns = [
    {
      header: 'Payment No.',
      accessor: 'paymentNo',
      render: (r) => <span className="font-semibold text-brand">{r.paymentNo || r._id}</span>,
    },
    {
      header: 'Demand ID',
      accessor: 'demandId',
      render: (r) => (typeof r.demandId === 'object' ? r.demandId?.demandNo || r.demandId?._id : r.demandId),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (r) => <span className="font-bold">₹ {(r.amount || 0).toLocaleString('en-IN')}</span>,
    },
    { header: 'Channel / Method', accessor: 'method', render: (r) => r.method || 'Online Gateway' },
    {
      header: 'Bank Gateway Ref',
      accessor: 'gatewayPaymentId',
      render: (r) => <span className="font-mono small">{r.gatewayPaymentId || r.transactionRef || '-'}</span>,
    },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="depot-transactions-page">
      <PageHeader
        title="Regional Depot Treasury Transactions"
        subtitle="Receipts reconciled through SBI Cyber Treasury for regional demands"
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
        <DataTable columns={columns} data={payments} loading={loading} />
      </Card>
    </div>
  );
}
