import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Eye, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetOrdersQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export function BeneficiaryOrders() {
  const { data: ordersData, isLoading: loading, isError, error, refetch } = useGetOrdersQuery();

  const orders = ordersData?.items || [];

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (row) => (
        <span className="font-semibold text-brand font-mono">
          {row.orderNo || row._id?.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Demand Ref',
      accessor: 'demandId',
      render: (row) => (
        <span className="font-mono text-slate-700">
          {row.demandId?.demandNo || row.demandId || 'Direct'}
        </span>
      ),
    },
    {
      header: 'Order Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="font-bold text-slate-900">
          ₹ {(row.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Chassis / VIN',
      accessor: 'chassisNumber',
      render: (row) => (
        <span className="font-mono small">{row.chassisNumber || 'In Allocation'}</span>
      ),
    },
    {
      header: 'Order Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <Link to={`/beneficiary/orders/${row._id || row.id}`} className="btn sm out">
          <Eye size={14} />
          <span>Track Order</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="beneficiary-orders-page">
      <PageHeader
        title="My Supply Orders"
        subtitle="View certified CSD Supply Orders issued to authorized dealerships and track vehicle allocation"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh list">
            <RefreshCw size={14} />
          </Button>
        }
      />

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <span>{getErrorMessage(error, 'Failed to fetch supply orders.')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyTitle="No Supply Orders Issued Yet"
          emptyText="Supply Orders are automatically generated once Depot verifies your demand and payment is reconciled."
        />
      </Card>
    </div>
  );
}

export default BeneficiaryOrders;
