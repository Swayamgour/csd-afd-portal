import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Truck,
  CreditCard,
  PlusCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetBeneficiaryDashboardQuery } from './beneficiaryApi.js';
import { useGetOrdersQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export function BeneficiaryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetBeneficiaryDashboardQuery();

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
  } = useGetOrdersQuery({ limit: 5 });

  const beneficiary = dashboardData?.beneficiary || {};
  const recentDemands = dashboardData?.recentDemands || [];
  const activeOrders = ordersData?.items || [];
  const activeOrder = activeOrders[0];

  const verificationStatus =
    beneficiary.verificationStatus ||
    user?.verificationStatus ||
    user?.status ||
    'PENDING';

  const isPendingApproval =
    verificationStatus === 'PENDING' ||
    verificationStatus === 'Pending' ||
    user?.status === 'Pending';

  const isRejected = verificationStatus === 'REJECTED';

  const demandColumns = [
    {
      header: 'Demand No',
      accessor: 'demandNo',
      render: (row) => (
        <span className="font-semibold text-brand">
          {row.demandNo || row._id?.slice(-8).toUpperCase() || 'DEM-PENDING'}
        </span>
      ),
    },
    {
      header: 'Item / Vehicle',
      accessor: 'productId',
      render: (row) => (
        <span className="font-medium text-slate-800">
          {row.productId?.name || row.productName || 'AFD Item'}
        </span>
      ),
    },
    {
      header: 'Depot / Dealer',
      accessor: 'depotId',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.depotId?.name || 'Assigned Depot'}
        </span>
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
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <Link
          to={`/beneficiary/demands/${row._id || row.id}`}
          className="btn sm out"
        >
          View Detail
        </Link>
      ),
    },
  ];

  if (isDashboardError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-red-800 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Failed to Load Beneficiary Dashboard</h3>
            <p className="text-sm mb-3">{getErrorMessage(dashboardError)}</p>
            <button
              onClick={() => refetchDashboard()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="beneficiary-dashboard-page">
      {/* Verification / Approval Alert Banner */}
      {isPendingApproval && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.35rem',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#92400e',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                }}
              >
                Beneficiary Account Pending Administrator Approval
              </h3>
              {user?.isEmailVerified && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    background: '#dcfce7',
                    color: '#166534',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={12} /> Email Verified ✓
                </span>
              )}
            </div>
            <p
              style={{
                margin: 0,
                color: '#78350f',
                fontSize: '0.92rem',
                lineHeight: 1.5,
              }}
            >
              Your registration is under verification by CSD authorities. You can browse the product catalog and view technical specifications. Demand generation and payment gateway will be enabled upon approval.
            </p>
            <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem' }}>
              <Link
                to="/products"
                className="btn btn-sm"
                style={{
                  background: '#d97706',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  display: 'inline-block',
                }}
              >
                Browse Products
              </Link>
              <Link
                to="/beneficiary/profile"
                className="btn btn-sm out"
                style={{
                  borderColor: '#d97706',
                  color: '#92400e',
                  fontWeight: 600,
                }}
              >
                Complete Profile ({dashboardData?.profileCompletion || 0}%)
              </Link>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-800 text-base mb-1">
              Account Registration Rejected
            </h3>
            <p className="text-sm text-red-700 mb-2">
              {beneficiary.verificationRemarks || 'Please review your uploaded documents and service credentials.'}
            </p>
            <Link to="/beneficiary/profile" className="btn btn-sm bg-red-600 text-white font-medium">
              Update Profile & Resubmit
            </Link>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="panel welcome-banner mb-3">
        <div className="between align-center flex-wrap gap-2">
          <div className="welcome-meta">
            <span className="eyebrow light">
              {isPendingApproval
                ? 'Defence Beneficiary (Pending Verification)'
                : 'Verified Defence Beneficiary'}
            </span>
            <h1 className="h2 text-white mb-1">
              Welcome, {beneficiary.name || user?.name || 'Beneficiary'}
            </h1>
            <p className="text-white-80 small mb-0">
              Service No: <b>{beneficiary.serviceNumber || user?.serviceNumber || 'N/A'}</b> · Rank:{' '}
              <b>{beneficiary.rank || user?.rank || 'Armed Forces'}</b> · Category:{' '}
              <b>{beneficiary.category || 'DEFENCE'}</b> · Status:{' '}
              <b>{beneficiary.employmentStatus || 'SERVING'}</b>
            </p>
          </div>

          <div className="welcome-actions row gap-1">
            <Link to="/products" className="btn btn-saffron font-bold">
              <PlusCircle size={16} />
              <span>Browse Catalog</span>
            </Link>
            <Link to="/beneficiary/profile" className="btn out text-white">
              <ShieldCheck size={16} />
              <span>My Profile ({dashboardData?.profileCompletion || 0}%)</span>
            </Link>
          </div>
        </div>

        {/* Live Profile & Category Strip */}
        <div className="eligibility-quick-strip mt-3 pt-2 border-top-white-10 row gap-2 flex-wrap">
          <div className="strip-item small text-white">
            <span className="muted-light">Pay Level:</span> <b>{beneficiary.payLevel || 'Not Specified'}</b>
          </div>
          <div className="strip-item small text-white">
            <span className="muted-light">Entitlement:</span> <b>{beneficiary.entitlement || 'AFD-I / AFD-II'}</b>
          </div>
          <div className="strip-item small text-white">
            <span className="muted-light">Organization:</span> <b>{beneficiary.organization || 'Indian Armed Forces'}</b>
          </div>
          <div className="strip-item small text-white">
            <span className="muted-light">Eligible Products:</span> <b>{dashboardData?.eligibleProductsCount || 0} Items</b>
          </div>
          <div className="strip-item small text-green-light row align-center gap-1 font-bold">
            <CheckCircle size={14} />
            <span>Profile {dashboardData?.profileCompletion || 0}% Complete</span>
          </div>
        </div>
      </div>

      {/* Dynamic KPI Stat Cards */}
      <div className="kpi-grid mb-3">
        <StatCard
          title="Total AFD Demands"
          value={dashboardData?.totalDemands ?? 0}
          subtext={`${dashboardData?.approvedDemands ?? 0} Approved / Paid`}
          icon={FileText}
          variant="primary"
          onClick={() => navigate('/beneficiary/demands')}
        />
        <StatCard
          title="Pending Demands"
          value={dashboardData?.pendingDemands ?? 0}
          subtext="Under Verification"
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/beneficiary/demands')}
        />
        <StatCard
          title="Active Supply Orders"
          value={dashboardData?.activeOrders ?? 0}
          subtext="Allocated to Dealership"
          icon={Truck}
          variant="success"
          onClick={() => navigate('/beneficiary/orders')}
        />
        <StatCard
          title="Eligible Products"
          value={dashboardData?.eligibleProductsCount ?? 0}
          subtext="Concessional Rate"
          icon={CreditCard}
          variant="default"
          onClick={() => navigate('/products')}
        />
      </div>

      {/* Active Order Spotlight */}
      {activeOrder && (
        <Card
          title={`Active Supply Order Dispatch · ${activeOrder.orderNo || activeOrder._id}`}
          subtitle={`Allocated Depot & Dealership`}
          actions={
            <Link
              to={`/beneficiary/orders/${activeOrder._id || activeOrder.id}`}
              className="link small font-semibold row align-center gap-1"
            >
              <span>Full Order Tracker</span>
              <ArrowRight size={14} />
            </Link>
          }
          className="mb-3"
        >
          <div className="active-order-grid">
            <div className="order-details-col">
              <div className="info-kv-list">
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Demand Reference:</span>
                  <span className="font-semibold">{activeOrder.demandId?.demandNo || activeOrder.demandId || 'Direct'}</span>
                </div>
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Chassis / Serial:</span>
                  <span className="font-mono font-semibold">{activeOrder.chassisNumber || 'In Allocation'}</span>
                </div>
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Engine Number:</span>
                  <span className="font-mono font-semibold">{activeOrder.engineNumber || 'In Allocation'}</span>
                </div>
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Order Amount:</span>
                  <span className="font-bold text-brand">₹ {(activeOrder.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="kv-row between small py-1">
                  <span className="muted">Order Status:</span>
                  <StatusBadge status={activeOrder.status} />
                </div>
              </div>
            </div>

            <div className="order-timeline-col">
              <h4 className="small font-semibold mb-2">Delivery Milestone Timeline</h4>
              <Timeline
                items={[
                  {
                    step: 'Supply Order Sanctioned',
                    date: new Date(activeOrder.createdAt).toLocaleDateString('en-IN'),
                    status: 'completed',
                    note: 'Order sanctioned by CSD Depot',
                  },
                  {
                    step: 'Factory Dispatch / In Transit',
                    date: activeOrder.status === 'DELIVERED' ? 'Completed' : 'In Progress',
                    status: activeOrder.status === 'DELIVERED' ? 'completed' : 'current',
                    note: 'Transit from OEM manufacturing plant',
                  },
                  {
                    step: 'Physical Dealer Delivery',
                    date: activeOrder.deliveredAt ? new Date(activeOrder.deliveredAt).toLocaleDateString('en-IN') : 'Scheduled',
                    status: activeOrder.status === 'DELIVERED' ? 'completed' : 'pending',
                    note: 'Vehicle inspection & key handover',
                  },
                ]}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Live Recent Demands Table */}
      <Card
        title="Recent AFD Demands"
        subtitle="Live tracking of applications submitted to CSD Regional Depots"
        actions={
          <Link to="/beneficiary/demands" className="link small font-semibold">
            View All Demands ({dashboardData?.totalDemands ?? 0})
          </Link>
        }
        className="mb-3"
      >
        <DataTable
          columns={demandColumns}
          data={recentDemands}
          loading={isDashboardLoading}
          emptyTitle="No demands created yet"
          emptyText="Browse our catalogue to select a vehicle or appliance and initiate your demand."
        />
      </Card>
    </div>
  );
}

export default BeneficiaryDashboard;
