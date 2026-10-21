import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Package, Truck, CheckCircle2, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetOemSummaryQuery } from '../admin/adminApi.js';
import { useGetOrdersQuery } from '../demand/demandApi.js';

export default function OemDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: summary,
    isLoading: loadingSummary,
    isFetching: fetchingSummary,
    refetch: refetchSummary,
  } = useGetOemSummaryQuery();

  const {
    data: ordersData,
    isLoading: loadingOrders,
    refetch: refetchOrders,
  } = useGetOrdersQuery();

  const loading = loadingSummary || loadingOrders;
  const orders = summary?.recentOrders || ordersData?.items || [];

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchOrders()]);
  };

  const orderColumns = [
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
      header: 'Assigned Dealership',
      accessor: 'dealerId',
      render: (r) => r.dealerId?.name || r.dealer || 'Authorized Dealer',
    },
    {
      header: 'Allocated Chassis VIN',
      accessor: 'delivery',
      render: (r) => (
        <span className="font-mono small">
          {r.delivery?.trackingNo || r.chassisNumber || 'Needs Allocation'}
        </span>
      ),
    },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Action',
      accessor: '_id',
      render: () => (
        <Link to="/oem/orders" className="btn sm out">
          Manage VIN
        </Link>
      ),
    },
  ];

  return (
    <div className="oem-dashboard-page">
      <PageHeader
        title={`OEM Institutional Directorate · ${user?.company || user?.name || 'Manufacturer Portal'}`}
        subtitle={`Nodal Officer: ${user?.name} · Institutional Defence Quota & Factory Dispatch Management`}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={fetchingSummary}
            onClick={handleRefresh}
          >
            Sync Real-Time
          </Button>
        }
      />

      <div className="kpi-grid mb-3">
        <StatCard
          title="Empaneled Models"
          value={`${summary?.empaneledModels ?? 0} Models`}
          subtext="Rate Contract Active"
          icon={Package}
          variant="primary"
          onClick={() => navigate('/oem/products')}
        />
        <StatCard
          title="Open Supply Orders"
          value={summary?.openSupplyOrders ?? 0}
          subtext="Factory Allocation Queue"
          icon={Truck}
          variant="warning"
          onClick={() => navigate('/oem/orders')}
        />
        <StatCard
          title="Vehicles in Transit"
          value={summary?.inTransit ?? 0}
          subtext="En Route to Dealerships"
          icon={Building2}
          variant="default"
          onClick={() => navigate('/oem/orders')}
        />
        <StatCard
          title="Delivered Orders"
          value={`${summary?.deliveredQuarter ?? 0} Units`}
          subtext="Handed over by dealers"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/oem/reports')}
        />
      </div>

      <Card
        title="Active Supply Orders Awaiting Factory VIN Allocation"
        subtitle="Stamped CSD Supply Orders requiring chassis assignment and dealer dispatch"
        actions={
          <Link to="/oem/orders" className="link small font-semibold">
            All OEM Orders
          </Link>
        }
      >
        <DataTable columns={orderColumns} data={orders} loading={loading} />
      </Card>
    </div>
  );
}
