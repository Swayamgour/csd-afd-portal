import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { UserDetailsModal } from './UserDetailsModal.jsx';
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
    <div className="admin-dashboard-page" style={{ paddingBottom: '3rem' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            background: '#065f46',
            color: '#fff',
            padding: '0.85rem 1.35rem',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* HEADER */}
      <PageHeader
        title="CSD-HO & Enterprise Administration Dashboard"
        subtitle="Real-time operational intelligence, master catalog management, and supply chain telemetry"
        breadcrumbs={[{ label: 'System Admin', href: '/admin/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={14}
                style={{
                  marginRight: '0.35rem',
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
              {isRefreshing ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Link to="/admin/demands">
              <Button variant="outline" size="sm">
                <FileCheck size={14} style={{ marginRight: '0.35rem' }} /> All Demands
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="primary" size="sm">
                <Users size={14} style={{ marginRight: '0.35rem' }} /> User Directory
              </Button>
            </Link>
          </div>
        }
      />

      {/* SECTION 1: 18 DYNAMIC SUMMARY CARDS (Grouped) */}
      <div style={{ marginBottom: '2rem' }}>
        {/* GROUP A: DEMANDS & TRANSACTIONS */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShoppingBag size={18} style={{ color: '#1e40af' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
              Operational Demand & Fulfillment Lifecycle
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
            }}
          >
            <SummaryStatCard
              title="Total Demands"
              count={totalDemands}
              icon={<ShoppingBag size={20} color="#2563eb" />}
              bgColor="#eff6ff"
              borderColor="#bfdbfe"
            />
            <SummaryStatCard
              title="Processing Demands"
              count={processingDemands}
              icon={<Clock size={20} color="#d97706" />}
              bgColor="#fffbeb"
              borderColor="#fde68a"
            />
            <SummaryStatCard
              title="Pending Payment"
              count={pendingPaymentDemands}
              icon={<IndianRupee size={20} color="#ea580c" />}
              bgColor="#fff7ed"
              borderColor="#fed7aa"
            />
            <SummaryStatCard
              title="Approved Demands"
              count={approvedDemands}
              icon={<CheckCircle2 size={20} color="#16a34a" />}
              bgColor="#f0fdf4"
              borderColor="#bbf7d0"
            />
            <SummaryStatCard
              title="Rejected Demands"
              count={rejectedDemands}
              icon={<XCircle size={20} color="#dc2626" />}
              bgColor="#fef2f2"
              borderColor="#fecaca"
            />
            <SummaryStatCard
              title="Completed Orders"
              count={completedOrders}
              icon={<Package size={20} color="#059669" />}
              bgColor="#ecfdf5"
              borderColor="#a7f3d0"
            />
          </div>
        </div>

        {/* GROUP B: MASTER DATA (OEM, DEALER, DEPOT, URC, PRODUCTS) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={18} style={{ color: '#0d9488' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
              Catalog & Organizational Master Entities
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
            }}
          >
            <SummaryStatCard
              title="Total Products"
              count={totalProducts}
              subtext={`${activeProducts} Active in Catalog`}
              icon={<Package size={20} color="#0284c7" />}
              bgColor="#f0f9ff"
              borderColor="#bae6fd"
            />
            <SummaryStatCard
              title="Total OEMs"
              count={totalOems}
              subtext={`${activeOems} Active Manufacturers`}
              icon={<Building2 size={20} color="#7c3aed" />}
              bgColor="#f5f3ff"
              borderColor="#ddd6fe"
            />
            <SummaryStatCard
              title="Total Dealers"
              count={totalDealers}
              subtext={`${activeDealers} Active Dealerships`}
              icon={<Store size={20} color="#4f46e5" />}
              bgColor="#eef2ff"
              borderColor="#c7d2fe"
            />
            <SummaryStatCard
              title="Total Depots"
              count={totalDepots}
              subtext={`${activeDepots} Operational Depots`}
              icon={<Warehouse size={20} color="#0d9488" />}
              bgColor="#f0fdfa"
              borderColor="#99f6e4"
            />
            <SummaryStatCard
              title="Total URCs"
              count={totalUrcs}
              subtext={`${activeUrcs} Active Canteens`}
              icon={<Shield size={20} color="#0284c7" />}
              bgColor="#f0f9ff"
              borderColor="#bae6fd"
            />
          </div>
        </div>

        {/* GROUP C: BENEFICIARY DIRECTORY COUNTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Users size={18} style={{ color: '#475569' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
              Beneficiary Entitlement & Registrations
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.85rem',
            }}
          >
            <SummaryStatCard
              title="Total Beneficiaries"
              count={totalBeneficiaries}
              subtext="Armed forces personnel & ex-servicemen"
              icon={<Users size={20} color="#334155" />}
              bgColor="#f8fafc"
              borderColor="#e2e8f0"
            />
            <SummaryStatCard
              title="Pending Beneficiary Verification"
              count={pendingBeneficiaryVerification}
              subtext="Under CS Director review"
              icon={<Clock size={20} color="#d97706" />}
              bgColor="#fffbeb"
              borderColor="#fde68a"
              highlight={pendingBeneficiaryVerification > 0}
            />
            <SummaryStatCard
              title="Verified / Approved Beneficiaries"
              count={verifiedBeneficiaries}
              subtext="Eligible for online booking"
              icon={<UserCheck size={20} color="#16a34a" />}
              bgColor="#f0fdf4"
              borderColor="#bbf7d0"
            />
            <SummaryStatCard
              title="Total Revenue Realized"
              count={`₹${Number(totalRevenue).toLocaleString('en-IN')}`}
              subtext="Aggregated successful payments"
              icon={<IndianRupee size={20} color="#047857" />}
              bgColor="#ecfdf5"
              borderColor="#a7f3d0"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: DYNAMIC ANALYTICS & CHARTS WITH TIMEFRAME FILTERS */}
      <Card
        title="Enterprise Analytics & Supply Chain Insights"
        style={{ marginBottom: '2rem' }}
        actions={
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.25rem', fontWeight: 600 }}>
              <Calendar size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              Period:
            </span>
            {['today', '7d', '30d', 'month', 'prev_month', 'year'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.28rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: timeframe === tf ? '#1e40af' : '#cbd5e1',
                  background: timeframe === tf ? '#1e40af' : '#fff',
                  color: timeframe === tf ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {timeframeLabels[tf]}
              </button>
            ))}
          </div>
        }
      >
        {/* TAB TOGGLE: DEMANDS / DEPOTS / OEMS */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveChartTab('demands')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeChartTab === 'demands' ? '#eff6ff' : 'transparent',
              color: activeChartTab === 'demands' ? '#1d4ed8' : '#64748b',
            }}
          >
            Demand Volume & Status
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('depots')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeChartTab === 'depots' ? '#eff6ff' : 'transparent',
              color: activeChartTab === 'depots' ? '#1d4ed8' : '#64748b',
            }}
          >
            Depot Processing Load
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('oems')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeChartTab === 'oems' ? '#eff6ff' : 'transparent',
              color: activeChartTab === 'oems' ? '#1d4ed8' : '#64748b',
            }}
          >
            OEM & Category Distribution
          </button>
        </div>

        {isAnalyticsLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
            <div>Loading live analytics aggregation from database...</div>
          </div>
        ) : (
          <div>
            {activeChartTab === 'demands' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Demand Trends Bar Chart */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                      Daily Demand Generation ({timeframeLabels[timeframe]})
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Total: {demandTrends.reduce((a, b) => a + b.count, 0)} demands
                    </span>
                  </div>
                  {demandTrends.length === 0 ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      No demand records found for the selected {timeframeLabels[timeframe]}.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '170px', paddingTop: '20px' }}>
                      {demandTrends.map((d, i) => {
                        const heightPct = Math.round((d.count / maxTrendCount) * 100);
                        return (
                          <div
                            key={d.date || i}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              height: '100%',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af', marginBottom: '3px' }}>
                              {d.count}
                            </span>
                            <div
                              title={`${d.date}: ${d.count} demands (₹${(d.volume || 0).toLocaleString('en-IN')})`}
                              style={{
                                width: '100%',
                                maxWidth: '32px',
                                height: `${Math.max(heightPct, 6)}%`,
                                background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '0.64rem',
                                color: '#64748b',
                                marginTop: '4px',
                                writingMode: demandTrends.length > 10 ? 'vertical-lr' : 'horizontal-tb',
                                transform: demandTrends.length > 10 ? 'rotate(180deg)' : 'none',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {(d.date || '').slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status Breakdown */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '1rem' }}>
                    Demand Status Pipeline Distribution
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { key: 'CREATED', label: 'Created / Initiated', color: '#64748b' },
                      { key: 'PAYMENT_PENDING', label: 'Payment Pending', color: '#ea580c' },
                      { key: 'PAID', label: 'Paid / Under Depot Review', color: '#d97706' },
                      { key: 'PROCESSING', label: 'Depot Processing', color: '#2563eb' },
                      { key: 'APPROVED', label: 'Depot Approved', color: '#16a34a' },
                      { key: 'SUPPLY_ORDER_ISSUED', label: 'Supply Order Issued', color: '#0d9488' },
                      { key: 'REJECTED', label: 'Rejected / Cancelled', color: '#dc2626' },
                    ].map((item) => {
                      const count = statusWise[item.key] || 0;
                      const pct = totalDemands > 0 ? Math.round((count / totalDemands) * 100) : 0;
                      return (
                        <div key={item.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                            <span style={{ color: '#334155', fontWeight: 600 }}>{item.label}</span>
                            <span style={{ color: '#64748b' }}>
                              <strong>{count}</strong> ({pct}%)
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeChartTab === 'depots' && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '1rem' }}>
                  Depot-wise Demand Ingestion & Processing Load
                </strong>
                {depotWise.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No depot demands recorded for the chosen timeframe.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {depotWise.map((d, i) => (
                      <div
                        key={d.depot || i}
                        style={{
                          background: '#fff',
                          padding: '1rem',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{d.depot}</span>
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {d.count} Demands
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Order Volume: ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeChartTab === 'oems' && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '1rem' }}>
                  Top Manufacturers (OEMs) by Demand Volume
                </strong>
                {oemWise.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No manufacturer demand records for this period.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {oemWise.map((o, i) => {
                      const maxOemCount = Math.max(...oemWise.map((x) => x.count), 1);
                      const pct = Math.round((o.count / maxOemCount) * 100);
                      return (
                        <div key={o.oem || i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{o.oem}</span>
                            <span style={{ color: '#475569', fontSize: '0.78rem' }}>
                              <strong>{o.count} Demands</strong> (₹{Number(o.amount || 0).toLocaleString('en-IN')})
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #6366f1 0%, #4338ca 100%)',
                                borderRadius: '5px',
                              }}
                            />
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Recent Demands Card */}
        <Card
          title="Recent Inbound Demands"
          actions={
            <Link to="/admin/demands" style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>
              View All Demands →
            </Link>
          }
        >
          {isDemandsLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading recent demands...</div>
          ) : recentDemands.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No recent demands created yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '0.5rem' }}>Demand No</th>
                    <th style={{ padding: '0.5rem' }}>Beneficiary</th>
                    <th style={{ padding: '0.5rem' }}>Amount</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDemands.slice(0, 6).map((dem) => (
                    <tr key={dem._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: '#1e40af' }}>
                        {dem.demandNo}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {dem.beneficiaryId?.name || 'Beneficiary'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {dem.beneficiaryId?.serviceNumber || dem.beneficiaryId?.rank || ''}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>
                        ₹{Number(dem.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background:
                              dem.status === 'APPROVED'
                                ? '#dcfce7'
                                : dem.status === 'REJECTED'
                                ? '#fee2e2'
                                : dem.status === 'PAYMENT_PENDING'
                                ? '#ffedd5'
                                : '#eff6ff',
                            color:
                              dem.status === 'APPROVED'
                                ? '#166534'
                                : dem.status === 'REJECTED'
                                ? '#991b1b'
                                : dem.status === 'PAYMENT_PENDING'
                                ? '#9a3412'
                                : '#1e40af',
                          }}
                        >
                          {dem.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Audit & Security Activity Log */}
        <Card
          title="System Audit & Security Activity"
          actions={
            <Link to="/admin/audit" style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>
              Audit Report →
            </Link>
          }
        >
          {isActivityLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading audit events...</div>
          ) : activityLogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No audit logs recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activityLogs.slice(0, 6).map((log) => (
                <div
                  key={log._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    fontSize: '0.8rem',
                  }}
                >
                  <Activity size={15} style={{ color: '#0d9488', marginTop: '3px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>
                        {log.action} <span style={{ color: '#64748b', fontWeight: 500 }}>on {log.entityType || log.entity}</span>
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      By: {log.userEmail || log.userId || 'System'} | IP: {log.ip || 'Localhost'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* SECTION 4: USER & BENEFICIARY DIRECTORY (View-only for Admin, approvals reserved for Director) */}
      <Card
        title="Beneficiary & System User Directory"
        actions={
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> accounts
          </span>
        }
      >
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '1rem',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Users', count: users.length },
              { id: 'PENDING', label: 'Pending Verification', count: pendingBeneficiaryVerification },
              { id: 'APPROVED', label: 'Verified & Active', count: verifiedBeneficiaries },
            ].map((tab) => {
              const active = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: active ? '#1e40af' : '#cbd5e1',
                    background: active ? '#1e40af' : '#fff',
                    color: active ? '#fff' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: active ? '#fff' : '#475569',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by name, email, service number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.75rem 0.4rem 2rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
              }}
            />
          </div>
        </div>

        {/* Directory Table */}
        {isUsersLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading user directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
            No accounts match your search or filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '0.6rem' }}>User Profile</th>
                  <th style={{ padding: '0.6rem' }}>Role</th>
                  <th style={{ padding: '0.6rem' }}>Contact</th>
                  <th style={{ padding: '0.6rem' }}>Status</th>
                  <th style={{ padding: '0.6rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.slice(0, 15).map((u) => {
                  const role = String(u.role || '').toLowerCase();
                  const roleLabel = ROLE_LABELS[role] || u.role || 'Beneficiary';
                  const isPending = u.verificationStatus === 'PENDING' || u.status === 'PENDING';
                  const isApproved = u.verificationStatus === 'VERIFIED' || u.verificationStatus === 'APPROVED' || u.status === 'ACTIVE';

                  return (
                    <tr key={u._id || u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{u.name || u.username}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {u.cardId || u.serviceNumber ? `Card/ID: ${u.cardId || u.serviceNumber}` : u.username}
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: role === 'beneficiary' ? '#eff6ff' : '#f8fafc',
                            color: role === 'beneficiary' ? '#1d4ed8' : '#334155',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          {roleLabel}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem', color: '#475569' }}>
                        <div>{u.email}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{u.mobile || '—'}</div>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        {isPending ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#92400e',
                              background: '#fef3c7',
                              border: '1px solid #fde68a',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            Pending CS Director Approval
                          </span>
                        ) : isApproved ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#166534',
                              background: '#dcfce7',
                              border: '1px solid #bbf7d0',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            Verified
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#991b1b',
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            Rejected
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedUserForDetails(u)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '5px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                          title="View user credentials & documents"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUserForDetails && (
        <UserDetailsModal
          user={selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
        />
      )}
    </div>
  );
};

// Reusable Summary Stat Card Component
const SummaryStatCard = ({ title, count, subtext, icon, bgColor = '#fff', borderColor = '#e2e8f0', highlight = false }) => {
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: highlight ? '0 0 0 2px #f59e0b' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', lineHeight: 1.3 }}>{title}</span>
        <div style={{ flexShrink: 0, marginLeft: '0.5rem' }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {count}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
