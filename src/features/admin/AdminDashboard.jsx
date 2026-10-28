import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  useGetAdminSummaryQuery,
  useGetAdminAnalyticsQuery,
  useGetAdminRecentDemandsQuery,
  useGetAdminActivityQuery,
  useGetUsersQuery,
} from './adminApi.js';
import { ROLE_LABELS } from '../../permissions/roles.js';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Search,
  Building2,
  Store,
  Warehouse,
  Layers,
  ShoppingBag,
  TrendingUp,
  IndianRupee,
  Activity,
  Package,
  Calendar,
  Shield,
  FileCheck,
  XCircle,
} from 'lucide-react';

const toPctClass = (pct, prefix = 'w-pct') => `${prefix}-${Math.min(100, Math.max(0, Math.round(Number(pct || 0) / 5) * 5))}`;

export const AdminDashboard = () => {
  // Timeframe filter for analytics & charts
  const [timeframe, setTimeframe] = useState('30d');
  const [activeChartTab, setActiveChartTab] = useState('demands'); // 'demands' | 'depots' | 'oems'

  // RTK Query: Dynamic API driven data
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useGetAdminSummaryQuery();

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    isFetching: isAnalyticsFetching,
    refetch: refetchAnalytics,
  } = useGetAdminAnalyticsQuery({ timeframe });

  const {
    data: recentDemands = [],
    isLoading: isDemandsLoading,
    refetch: refetchDemands,
  } = useGetAdminRecentDemandsQuery();

  const {
    data: activityLogs = [],
    isLoading: isActivityLoading,
    refetch: refetchActivity,
  } = useGetAdminActivityQuery();

  const {
    data: fetchedUsers = [],
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery({ limit: 100 });

  // UI State for User Directory inspection
  const [statusTab, setStatusTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refetchSummary(),
        refetchAnalytics(),
        refetchDemands(),
        refetchActivity(),
        refetchUsers(),
      ]);
      showToast('✓ Admin dashboard metrics & charts synchronized with database.');
    } catch (e) {
      console.error('[AdminDashboard] Refresh error:', e);
    }
  };

  // Safe numbers from live database summary
  const s = summaryData || {};
  const totalBeneficiaries = s.totalBeneficiaries ?? 0;
  const pendingBeneficiaryVerification = s.pendingBeneficiaryVerification ?? 0;
  const verifiedBeneficiaries = s.verifiedBeneficiaries ?? 0;

  const totalProducts = s.totalProducts ?? 0;
  const activeProducts = s.activeProducts ?? 0;

  const totalOems = s.totalOems ?? 0;
  const activeOems = s.activeOems ?? 0;

  const totalDealers = s.totalDealers ?? 0;
  const activeDealers = s.activeDealers ?? 0;

  const totalDepots = s.totalDepots ?? 0;
  const activeDepots = s.activeDepots ?? 0;

  const totalUrcs = s.totalUrcs ?? 0;
  const activeUrcs = s.activeUrcs ?? 0;

  const totalDemands = s.totalDemands ?? 0;
  const processingDemands = s.processingDemands ?? 0;
  const pendingPaymentDemands = s.pendingPaymentDemands ?? 0;
  const approvedDemands = s.approvedDemands ?? 0;
  const rejectedDemands = s.rejectedDemands ?? 0;
  const completedOrders = s.completedOrders ?? 0;
  const totalRevenue = s.totalRevenue ?? 0;

  // Filtered Users
  const users = Array.isArray(fetchedUsers) ? fetchedUsers : [];
  const filteredUsers = users.filter((u) => {
    const isPending = u.verificationStatus === 'PENDING' || u.status === 'PENDING';
    const isApproved = u.verificationStatus === 'VERIFIED' || u.verificationStatus === 'APPROVED' || u.status === 'ACTIVE';
    const isRejected = u.verificationStatus === 'REJECTED' || u.status === 'REJECTED';

    if (statusTab === 'PENDING' && !isPending) return false;
    if (statusTab === 'APPROVED' && !isApproved) return false;
    if (statusTab === 'REJECTED' && !isRejected) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const n = (u.name || '').toLowerCase();
      const un = (u.username || '').toLowerCase();
      const em = (u.email || '').toLowerCase();
      const card = (u.cardId || u.serviceNumber || '').toLowerCase();
      if (!n.includes(q) && !un.includes(q) && !em.includes(q) && !card.includes(q)) return false;
    }
    return true;
  });

  // Analytics datasets
  const demandTrends = analyticsData?.demandTrends || [];
  const maxTrendCount = Math.max(...demandTrends.map((d) => d.count), 1);
  const depotWise = analyticsData?.depotWise || [];
  const oemWise = analyticsData?.oemWise || [];
  const statusWise = analyticsData?.statusWise || {};

  const timeframeLabels = {
    today: 'Today',
    '7d': '7 Days',
    '30d': '30 Days',
    month: 'This Month',
    prev_month: 'Previous Month',
    year: 'This Year',
  };

  const isRefreshing = isSummaryFetching || isAnalyticsFetching;

  return (
    <div className="admin-dashboard-page">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="admin-toast-success">
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* HEADER */}
      <PageHeader
        title="CSD HO Admin Dashboard"
        subtitle="Real-time operational intelligence, master catalog management, and supply chain telemetry"
        breadcrumbs={[{ label: 'System Admin', href: '/admin/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex-align-center-gap-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={14}
                className={`mr-xs ${isRefreshing ? 'portal-spinner-icon' : ''}`}
              />
              {isRefreshing ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Link to="/admin/demands">
              <Button variant="outline" size="sm">
                <FileCheck size={14} className="mr-xs" /> All Demands
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="primary" size="sm">
                <Users size={14} className="mr-xs" /> User Directory
              </Button>
            </Link>
          </div>
        }
      />

      {/* SECTION 1: 18 DYNAMIC SUMMARY CARDS (Grouped) */}
      <div className="mb-2xl">
        {/* GROUP A: DEMANDS & TRANSACTIONS */}
        <div className="mb-lg">
          <div className="dashboard-group-header">
            <ShoppingBag size={18} className="text-blue-dark" />
            <h3 className="dashboard-group-title">
              Operational Demand & Fulfillment Lifecycle
            </h3>
          </div>
          <div className="dashboard-kpi-grid-6">
            <SummaryStatCard
              title="Total Demands"
              count={totalDemands}
              icon={<ShoppingBag size={20} className="icon-blue" />}
              variant="blue"
            />
            <SummaryStatCard
              title="Processing Demands"
              count={processingDemands}
              icon={<Clock size={20} className="icon-amber" />}
              variant="amber"
            />
            <SummaryStatCard
              title="Pending Payment"
              count={pendingPaymentDemands}
              icon={<IndianRupee size={20} className="icon-orange" />}
              variant="orange"
            />
            <SummaryStatCard
              title="Approved Demands"
              count={approvedDemands}
              icon={<CheckCircle2 size={20} className="icon-green" />}
              variant="green"
            />
            <SummaryStatCard
              title="Rejected Demands"
              count={rejectedDemands}
              icon={<XCircle size={20} className="icon-red" />}
              variant="red"
            />
            <SummaryStatCard
              title="Completed Orders"
              count={completedOrders}
              icon={<Package size={20} className="icon-emerald" />}
              variant="emerald"
            />
          </div>
        </div>

        {/* GROUP B: MASTER DATA (OEM, DEALER, DEPOT, URC, PRODUCTS) */}
        <div className="mb-lg">
          <div className="dashboard-group-header">
            <Layers size={18} className="text-teal" />
            <h3 className="dashboard-group-title">
              Catalog & Organizational Master Entities
            </h3>
          </div>
          <div className="dashboard-kpi-grid-6">
            <SummaryStatCard
              title="Total Products"
              count={totalProducts}
              subtext={`${activeProducts} Active in Catalog`}
              icon={<Package size={20} className="icon-sky" />}
              variant="sky"
            />
            <SummaryStatCard
              title="Total OEMs"
              count={totalOems}
              subtext={`${activeOems} Active Manufacturers`}
              icon={<Building2 size={20} className="icon-purple" />}
              variant="purple"
            />
            <SummaryStatCard
              title="Total Dealers"
              count={totalDealers}
              subtext={`${activeDealers} Active Dealerships`}
              icon={<Store size={20} className="icon-indigo" />}
              variant="indigo"
            />
            <SummaryStatCard
              title="Total Depots"
              count={totalDepots}
              subtext={`${activeDepots} Operational Depots`}
              icon={<Warehouse size={20} className="icon-teal" />}
              variant="teal"
            />
            <SummaryStatCard
              title="Total URCs"
              count={totalUrcs}
              subtext={`${activeUrcs} Active Canteens`}
              icon={<Shield size={20} className="icon-sky" />}
              variant="sky"
            />
          </div>
        </div>

        {/* GROUP C: BENEFICIARY DIRECTORY COUNTS */}
        <div>
          <div className="dashboard-group-header">
            <Users size={18} className="text-slate-600" />
            <h3 className="dashboard-group-title">
              Beneficiary Entitlement & Registrations
            </h3>
          </div>
          <div className="dashboard-kpi-grid-4">
            <SummaryStatCard
              title="Total Beneficiaries"
              count={totalBeneficiaries}
              subtext="Armed forces personnel & ex-servicemen"
              icon={<Users size={20} className="icon-slate" />}
              variant="slate"
            />
            <SummaryStatCard
              title="Pending Beneficiary Verification"
              count={pendingBeneficiaryVerification}
              subtext="Under CS Director review"
              icon={<Clock size={20} className="icon-amber" />}
              variant="amber"
              highlight={pendingBeneficiaryVerification > 0}
            />
            <SummaryStatCard
              title="Verified / Approved Beneficiaries"
              count={verifiedBeneficiaries}
              subtext="Eligible for online booking"
              icon={<UserCheck size={20} className="icon-green" />}
              variant="green"
            />
            <SummaryStatCard
              title="Total Revenue Realized"
              count={`₹${Number(totalRevenue).toLocaleString('en-IN')}`}
              subtext="Aggregated successful payments"
              icon={<IndianRupee size={20} className="icon-emerald" />}
              variant="emerald"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: DYNAMIC ANALYTICS & CHARTS WITH TIMEFRAME FILTERS */}
      <Card
        title="Enterprise Analytics & Supply Chain Insights"
        className="mb-2xl"
        actions={
          <div className="portal-period-container">
            <span className="portal-period-label">
              <Calendar size={13} className="portal-calendar-icon" />
              Period:
            </span>
            {['today', '7d', '15d', 'month', 'prev_month', 'year'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`period-toggle-btn ${timeframe === tf ? 'active' : ''}`}
              >
                {timeframeLabels[tf]}
              </button>
            ))}
          </div>
        }
      >
        {/* TAB TOGGLE: DEMANDS / DEPOTS / OEMS */}
        <div className="dashboard-chart-tabs">
          <button
            type="button"
            onClick={() => setActiveChartTab('demands')}
            className={`chart-tab-btn ${activeChartTab === 'demands' ? 'active' : ''}`}
          >
            Demand Volume & Status
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('depots')}
            className={`chart-tab-btn ${activeChartTab === 'depots' ? 'active' : ''}`}
          >
            Depot Processing Load
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('oems')}
            className={`chart-tab-btn ${activeChartTab === 'oems' ? 'active' : ''}`}
          >
            OEM & Category Distribution
          </button>
        </div>

        {isAnalyticsLoading ? (
          <div className="chart-loading-box">
            <RefreshCw size={24} className="spin-icon" />
            <div>Loading live analytics aggregation from database...</div>
          </div>
        ) : (
          <div>
            {activeChartTab === 'demands' && (
              <div className="dashboard-charts-grid">
                {/* Demand Trends Bar Chart */}
                <div className="dashboard-chart-card">
                  <div className="chart-card-header">
                    <strong className="chart-card-title">
                      Daily Demand Generation ({timeframeLabels[timeframe]})
                    </strong>
                    <span className="chart-card-subtitle">
                      Total: {demandTrends.reduce((a, b) => a + b.count, 0)} demands
                    </span>
                  </div>
                  {demandTrends.length === 0 ? (
                    <div className="dashboard-empty-msg">
                      No demand records found for the selected {timeframeLabels[timeframe]}.
                    </div>
                  ) : (
                    <div className="bar-chart-track-container">
                      {demandTrends.map((d, i) => {
                        const heightPct = Math.round((d.count / maxTrendCount) * 100);
                        return (
                          <div key={d.date || i} className="bar-col-item">
                            <span className="bar-val-label">{d.count}</span>
                            <div
                              title={`${d.date}: ${d.count} demands (₹${(d.volume || 0).toLocaleString('en-IN')})`}
                              className={`bar-fill-gradient ${toPctClass(Math.max(heightPct, 6), 'h-pct')}`}
                            />
                            <span className={`bar-date-label ${demandTrends.length > 10 ? 'rotated' : ''}`}>
                              {(d.date || '').slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status Breakdown */}
                <div className="dashboard-chart-card">
                  <strong className="chart-card-title">
                    Demand Status Pipeline Distribution
                  </strong>
                  <div className="status-pipeline-list">
                    {[
                      { key: 'CREATED', label: 'Created / Initiated', fillClass: 'fill-status-created' },
                      { key: 'PAYMENT_PENDING', label: 'Payment Pending', fillClass: 'fill-status-payment-pending' },
                      { key: 'PAID', label: 'Paid / Under Depot Review', fillClass: 'fill-status-paid' },
                      { key: 'PROCESSING', label: 'Depot Processing', fillClass: 'fill-status-processing' },
                      { key: 'APPROVED', label: 'Depot Approved', fillClass: 'fill-status-approved' },
                      { key: 'SUPPLY_ORDER_ISSUED', label: 'Supply Order Issued', fillClass: 'fill-status-supply-order' },
                      { key: 'REJECTED', label: 'Rejected / Cancelled', fillClass: 'fill-status-rejected' },
                    ].map((item) => {
                      const count = statusWise[item.key] || 0;
                      const pct = totalDemands > 0 ? Math.round((count / totalDemands) * 100) : 0;
                      return (
                        <div key={item.key}>
                          <div className="status-row-header">
                            <span className="status-label-text">{item.label}</span>
                            <span className="status-val-text">
                              <strong>{count}</strong> ({pct}%)
                            </span>
                          </div>
                          <div className="status-bar-track">
                            <div className={`status-bar-fill ${item.fillClass} ${toPctClass(pct, 'w-pct')}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeChartTab === 'depots' && (
              <div className="dashboard-chart-card">
                <strong className="chart-card-title">
                  Depot-wise Demand Ingestion & Processing Load
                </strong>
                {depotWise.length === 0 ? (
                  <div className="empty-center-pad">
                    No depot demands recorded for the chosen timeframe.
                  </div>
                ) : (
                  <div className="depot-load-grid">
                    {depotWise.map((d, i) => (
                      <div key={d.depot || i} className="depot-load-card">
                        <div className="depot-load-header">
                          <span className="depot-name-title">{d.depot}</span>
                          <span className="badge-depot-demand-pill">
                            {d.count} Demands
                          </span>
                        </div>
                        <div className="depot-volume-text">
                          Order Volume: ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeChartTab === 'oems' && (
              <div className="dashboard-chart-card">
                <strong className="chart-card-title">
                  Top Manufacturers (OEMs) by Demand Volume
                </strong>
                {oemWise.length === 0 ? (
                  <div className="empty-center-pad">
                    No manufacturer demand records for this period.
                  </div>
                ) : (
                  <div className="oem-list-container">
                    {oemWise.map((o, i) => {
                      const maxOemCount = Math.max(...oemWise.map((x) => x.count), 1);
                      const pct = Math.round((o.count / maxOemCount) * 100);
                      return (
                        <div key={o.oem || i}>
                          <div className="oem-item-header">
                            <span className="oem-item-name">{o.oem}</span>
                            <span className="oem-item-details">
                              <strong>{o.count} Demands</strong> (₹{Number(o.amount || 0).toLocaleString('en-IN')})
                            </span>
                          </div>
                          <div className="oem-bar-track">
                            <div className={`oem-bar-fill ${toPctClass(pct, 'w-pct')}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* SECTION 3: RECENT DEMANDS & AUDIT ACTIVITY STREAMS */}
    
      {/* SECTION 4: USER & BENEFICIARY DIRECTORY (View-only for Admin, approvals reserved for Director) */}
    

    </div>
  );
};

// Reusable Summary Stat Card Component
const SummaryStatCard = ({ title, count, subtext, icon, variant = 'slate', highlight = false }) => {
  return (
    <div className={`summary-stat-card variant-${variant} ${highlight ? 'highlight' : ''}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon-box">{icon}</div>
      </div>
      <div>
        <div className="stat-card-count">
          {count}
        </div>
        {subtext && (
          <div className="stat-card-subtext">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
