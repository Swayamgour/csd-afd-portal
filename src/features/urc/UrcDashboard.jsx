import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Truck,
  Clock,
  Package,
  Layers,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetOrdersQuery, useGetDemandsQuery } from '../demand/demandApi.js';

export default function UrcDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: ordersData,
    isLoading: loadingOrders,
    isFetching: fetchingOrders,
    refetch: refetchOrders,
  } = useGetOrdersQuery();

  const {
    data: demandsData,
    isLoading: loadingDemands,
    refetch: refetchDemands,
  } = useGetDemandsQuery();

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData)
    ? ordersData
    : [];

  const demands = Array.isArray(demandsData?.items)
    ? demandsData.items
    : Array.isArray(demandsData)
    ? demandsData
    : [];

  const loading = loadingOrders || loadingDemands;

  // 5 Scoped Cards: Received Orders, Processing, Ready, Completed, Pending
  const receivedOrdersCount = orders.length;
  const processingCount = orders.filter((o) => ['PROCESSING', 'ALLOCATED'].includes(o.status)).length;
  const readyCount = orders.filter((o) => ['READY_FOR_DELIVERY', 'IN_TRANSIT'].includes(o.status)).length;
  const completedCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const pendingCount = orders.filter((o) => ['PLACED', 'PENDING'].includes(o.status)).length;

  const orderColumns = [
    {
      header: 'Order Number',
      accessor: 'orderNo',
      render: (r) => (
        <span className="portal-text-brand font-semibold">
          {r.orderNo || r._id?.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Demand Number',
      accessor: 'demandId',
      render: (r) => (
        <span className="portal-text-slate font-semibold">
          {r.demandId?.demandNo || r.demandId || '—'}
        </span>
      ),
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiary',
      render: (r) => (
        <div>
          <span className="portal-profile-name font-semibold">
            {r.beneficiaryId?.name || 'Authorized Beneficiary'}
          </span>
          <span className="portal-subtext-muted fs-xs">
            {r.beneficiaryId?.serviceNumber || ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Product',
      accessor: 'product',
      render: (r) => (
        <div className="truncate-max-w-160">
          {r.productId?.name || 'AFD Vehicle/Item'}
        </div>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (r) => r.quantity || 1,
    },
    {
      header: 'Dealer',
      accessor: 'dealer',
      render: (r) => r.dealerId?.name || 'Authorized Dealership',
    },
    {
      header: 'Depot',
      accessor: 'depot',
      render: (r) => r.depotId?.name || 'Regional Depot',
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (r) => `₹ ${Number(r.totalAmount || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent'),
    },
  ];

  return (
    <div className="urc-dashboard-page pb-3xl">
      <PageHeader
        title={`Unit Run Canteen (URC) Operations · ${user?.urc || 'Delhi Cantt Station URC'}`}
        subtitle={`Officer-in-Charge: ${user?.name || 'URC Official'} · Local Station Delivery & Handover Desk`}
        actions={
          <div className="portal-flex-align-center-gap-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchOrders();
                refetchDemands();
              }}
              disabled={fetchingOrders}
            >
              <RefreshCw
                size={14}
                className={`mr-xs ${fetchingOrders ? 'spin' : ''}`}
              />
              {fetchingOrders ? 'Syncing...' : 'Sync Orders'}
            </Button>
            <Link to="/urc/orders">
              <Button variant="primary" size="sm">
                View All Orders ({receivedOrdersCount})
              </Button>
            </Link>
          </div>
        }
      />

      {/* 5 SCOPED URC SUMMARY CARDS */}
      <div className="csd-stats-grid">
        <StatCard
          title="Received Orders"
          value={String(receivedOrdersCount)}
          subtext="Assigned to this URC"
          icon={Truck}
          variant="primary"
          onClick={() => navigate('/urc/orders')}
        />
        <StatCard
          title="Processing"
          value={String(processingCount)}
          subtext="Under Dealer Allocation"
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/urc/orders')}
        />
        <StatCard
          title="Ready for Handover"
          value={String(readyCount)}
          subtext="At Dealership Showroom"
          icon={Package}
          variant="success"
          onClick={() => navigate('/urc/orders')}
        />
        <StatCard
          title="Completed Orders"
          value={String(completedCount)}
          subtext="Delivered to Beneficiary"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/urc/orders')}
        />
        <StatCard
          title="Pending Allocation"
          value={String(pendingCount)}
          subtext="Awaiting Dealer Action"
          icon={FileText}
          variant="default"
          onClick={() => navigate('/urc/orders')}
        />
      </div>

      {/* URC ORDER TABLE */}
      <Card
        title="Station Order Processing Queue"
        subtitle="Operational supply orders routed through your designated CSD Depot"
        actions={
          <Link to="/urc/orders" className="portal-link-brand font-semibold">
            Full Order Registry →
          </Link>
        }
      >
        <DataTable
          columns={orderColumns}
          data={orders}
          loading={loading}
          emptyText="No active supply orders assigned to your URC station."
        />
      </Card>
    </div>
  );
}
