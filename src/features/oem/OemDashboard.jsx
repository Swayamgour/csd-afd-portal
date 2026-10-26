import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  RefreshCw,
  Store,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState, ErrorState } from '../../components/common/States.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetOemDashboardQuery } from './oemApi.js';

export default function OemDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetOemDashboardQuery();

  if (isLoading) {
    return (
      <div className="oem-dashboard-page">
        <PageHeader
          title="OEM Institutional Directorate"
          subtitle="Loading manufacturer production, dealer allocations, and order pipelines..."
        />
        <LoadingState message="Fetching real-time OEM dashboard metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="oem-dashboard-page">
        <PageHeader
          title="OEM Institutional Directorate"
          subtitle="Connection to manufacturer repository failed"
        />
        <ErrorState
          title="Unable to load OEM Dashboard"
          message={error?.data?.message || 'Failed to authenticate or fetch OEM data.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const d = dashboardData || {};
  const recentOrders = Array.isArray(d.recentOrders) ? d.recentOrders : [];
  const topProducts = Array.isArray(d.topProducts) ? d.topProducts : [];
  const topDealers = Array.isArray(d.topDealers) ? d.topDealers : [];
  const stateWise = Array.isArray(d.stateWiseDemand) ? d.stateWiseDemand : [];

  const orderColumns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (r) => (
        <span className="font-semibold text-brand font-mono">{r.orderNo || r._id}</span>
      ),
    },
    {
      header: 'Dealership Showroom',
      accessor: 'dealerId',
      render: (r) => (
        <div>
          <div className="font-medium">{r.dealerId?.name || '—'}</div>
          <div className="muted small">{r.dealerId?.city ? `${r.dealerId.city}, ${r.dealerId.state || ''}` : ''}</div>
        </div>
      ),
    },
    {
      header: 'CSD Depot',
      accessor: 'depotId',
      render: (r) => r.depotId?.name || r.depotId?.code || '—',
    },
    {
      header: 'Chassis / VIN',
      accessor: 'delivery',
      render: (r) => (
        <span className="font-mono small">
          {r.delivery?.chassisNo || r.delivery?.trackingNo || (
            <span className="text-warning">Allocation Pending</span>
          )}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (r) => formatCurrency(r.amount || 0),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/oem/orders`)}
        >
          Manage Order
        </Button>
      ),
    },
  ];

  return (
    <div className="oem-dashboard-page">
      <PageHeader
        title={`OEM Institutional Directorate · ${user?.company || user?.name || 'Manufacturer Portal'}`}
        subtitle={`Nodal Officer: ${user?.name} · Institutional Defence Quota & Factory Fulfillment Management`}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={refetch}
          >
            Sync Metrics
          </Button>
        }
      />

      {/* Main KPI Row */}
      <div className="kpi-grid mb-3">
        <StatCard
          title="Empaneled Models"
          value={`${d.activeProducts ?? 0} Active`}
          subtext={`Total Lineup: ${d.products ?? 0} Models`}
          icon={Package}
          variant="primary"
          onClick={() => navigate('/oem/products')}
        />
        <StatCard
          title="Authorized Dealerships"
          value={`${d.activeDealers ?? 0} Active`}
          subtext={`Network Size: ${d.dealers ?? 0} Showrooms`}
          icon={Store}
          variant="default"
          onClick={() => navigate('/oem/dealers')}
        />
        <StatCard
          title="Demand Pipeline"
          value={d.pendingDemands ?? 0}
          subtext={`Sanctioned: ${d.approvedDemands ?? 0} Demands`}
          icon={FileText}
          variant="warning"
          onClick={() => navigate('/oem/demands')}
        />
        <StatCard
          title="Open Supply Orders"
          value={d.pendingOrders ?? 0}
          subtext={`In Process: ${d.processingOrders ?? 0} Orders`}
          icon={Truck}
          variant="warning"
          onClick={() => navigate('/oem/orders')}
        />
        <StatCard
          title="Factory Dispatched"
          value={`${d.completedOrders ?? 0} Units`}
          subtext="Delivered via authorized network"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/oem/orders')}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid-3-col gap-2 mb-3">
        <Card title="Catalog & Empanelment" subtitle="Manage CSD index numbers and rate contracts">
          <p className="muted small mb-2">
            Register new automobile variants, submit HO negotiated rates, and monitor CSD rate contract empanelment.
          </p>
          <div className="flex gap-1">
            <Button size="sm" variant="primary" icon={Package} onClick={() => navigate('/oem/products')}>
              Manage Lineup
            </Button>
            <Button size="sm" variant="outline" icon={Layers} onClick={() => navigate('/oem/dealer-products')}>
              Dealer Allotments
            </Button>
          </div>
        </Card>

        <Card title="Dealer Network & State Pricing" subtitle="Authorize regional dealers and state ceiling tariffs">
          <p className="muted small mb-2">
            Configure dealership product mappings, depot appointments, and state-wise published AFD pricing tiers.
          </p>
          <div className="flex gap-1">
            <Button size="sm" variant="primary" icon={Store} onClick={() => navigate('/oem/dealers')}>
              Dealer Network
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/oem/pricing')}>
              State Pricing
            </Button>
          </div>
        </Card>

        <Card title="Fulfillment Reports & MIS" subtitle="Download dispatch registers and demand pipeline summaries">
          <p className="muted small mb-2">
            Export institutional delivery performance logs, supply order turnaround records, and demand reconciliations.
          </p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" icon={TrendingUp} onClick={() => navigate('/oem/reports')}>
              View MIS Reports
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/oem/profile')}>
              Corporate Profile
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Supply Orders Table */}
      <Card
        title="Active Institutional Supply Orders"
        subtitle="Recent CSD supply orders requiring chassis VIN allocation, invoice Stamping, or dealer delivery"
        actions={
          <Link to="/oem/orders" className="link small font-semibold">
            View All Orders &rarr;
          </Link>
        }
        className="mb-3"
      >
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          emptyTitle="No recent supply orders"
          emptyText="There are currently no supply orders assigned to your OEM."
        />
      </Card>

      {/* Analytics Breakdown Grid */}
      <div className="grid-2-col gap-2">
        {/* Top Demanded Products */}
        <Card title="Top Demanded Products" subtitle="Highest volume models in defence personnel pipeline">
          {topProducts.length === 0 ? (
            <p className="muted small py-2">No product demand activity recorded yet.</p>
          ) : (
            <div className="info-kv-list">
              {topProducts.map((p, idx) => (
                <div key={p.productId || idx} className="kv-row between py-1 border-bottom">
                  <div>
                    <span className="font-semibold text-brand mr-1">#{idx + 1}</span>
                    <span className="font-medium">{p.name || 'Empaneled Model'}</span>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-primary mr-2">{p.count} Orders</span>
                    <span className="muted small">{formatCurrency(p.totalAmount || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* State-Wise Demand Breakdown */}
        <Card title="State-Wise Defence Demand Distribution" subtitle="Geographic demand across state depots">
          {stateWise.length === 0 ? (
            <p className="muted small py-2">No state-level distribution data available.</p>
          ) : (
            <div className="info-kv-list">
              {stateWise.map((s, idx) => (
                <div key={s.state || idx} className="kv-row between py-1 border-bottom">
                  <span className="font-medium">{s.state || 'National / Other'}</span>
                  <div className="text-right">
                    <span className="badge badge-default mr-2">{s.count} Units</span>
                    <span className="muted small">{formatCurrency(s.totalAmount || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
