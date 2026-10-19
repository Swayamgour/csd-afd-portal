import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye, Filter, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export function BeneficiaryDemands() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: demandsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDemandsQuery({
    status: statusFilter !== 'All' ? statusFilter : undefined,
    q: searchTerm || undefined,
  });

  const demands = demandsData?.items || [];

  const columns = [
    {
      header: 'Demand No',
      accessor: 'demandNo',
      render: (row) => (
        <span className="font-semibold text-brand font-mono">
          {row.demandNo || row._id?.slice(-8).toUpperCase() || 'DEM-PENDING'}
        </span>
      ),
    },
    {
      header: 'Vehicle / Item',
      accessor: 'productId',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900 block">
            {row.productId?.name || row.productName || 'AFD Item'}
          </span>
          {row.selectedColor && (
            <span className="text-xs text-slate-500">Color: {row.selectedColor}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Total Price',
      accessor: 'totalPrice',
      render: (row) => (
        <span className="font-bold text-slate-900">
          ₹ {(row.totalPrice || row.netPayable || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Depot / Dealer',
      accessor: 'depotId',
      render: (row) => (
        <span className="text-xs text-slate-600 block">
          {row.depotId?.name || 'Assigned Depot'}
        </span>
      ),
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
        <Link to={`/beneficiary/demands/${row._id || row.id}`} className="btn sm out">
          <Eye size={14} />
          <span>Details</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="beneficiary-demands-page">
      <PageHeader
        title="My AFD Demands"
        subtitle="Track submitted vehicle demands, depot sanctions, treasury payments, and supply order releases."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh list">
              <RefreshCw size={14} />
            </Button>
            <Link to="/products" className="btn btn-primary font-bold">
              <PlusCircle size={16} />
              <span>New Demand</span>
            </Link>
          </div>
        }
      />

      <FilterBar
        hasActiveFilters={statusFilter !== 'All' || !!searchTerm}
        onReset={() => {
          setStatusFilter('All');
          setSearchTerm('');
        }}
      >
        <div className="row gap-2 flex-wrap flex-1">
          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search by demand no or vehicle name..."
              className="fld fld-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <select
              className="fld fld-sm w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAID">Paid / Processing</option>
              <option value="SUPPLY_ORDER_ISSUED">Supply Order Issued</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </FilterBar>

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <span>{getErrorMessage(error, 'Failed to fetch demands list.')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <Card title="Demands Register" subtitle="Real-time status tracking against Depot database">
        <DataTable
          columns={columns}
          data={demands}
          loading={isLoading}
          emptyTitle="No demands created yet"
          emptyText="Browse our catalogue to select a vehicle or appliance and initiate your demand."
        />
      </Card>
    </div>
  );
}

export default BeneficiaryDemands;
