import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Search,
  RefreshCw,
  Building2,
  Store,
  Warehouse,
  Package,
  Users,
  CreditCard,
  Truck,
  RotateCcw,
  ShieldAlert,
  History,
  FileCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { ExportButton } from '../../components/common/ExportButton';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  useGetDemandsReportQuery,
  useGetBeneficiariesReportQuery,
  useGetPaymentsReportQuery,
  useGetOrdersReportQuery,
  useGetOemsReportQuery,
  useGetDealersReportQuery,
  useGetDepotsReportQuery,
  useGetUrcsReportQuery,
  useGetProductsReportQuery,
  useGetRefundsReportQuery,
  useGetAuditReportQuery,
  useGetAuthReportQuery,
} from './adminApi';

const REPORT_TABS = [
  { id: 'demands', label: '1. Demand Report', icon: FileSpreadsheet },
  { id: 'beneficiaries', label: '2. Beneficiary Report', icon: Users },
  { id: 'payments', label: '3. Payment Report', icon: CreditCard },
  { id: 'products', label: '4. Product Report', icon: Package },
  { id: 'orders', label: '5. Order Report', icon: Truck },
  { id: 'oems', label: '6. OEM Report', icon: Building2 },
  { id: 'dealers', label: '7. Dealer Report', icon: Store },
  { id: 'depots', label: '8. Depot Report', icon: Warehouse },
  { id: 'urcs', label: '9. URC Report', icon: Store },
  { id: 'refunds', label: '10. Refund Report', icon: RotateCcw },
  { id: 'audit', label: '11. Audit Report', icon: ShieldAlert },
  { id: 'auth', label: '12. Authentication Report', icon: History },
];

export const AdminReports = () => {
  const [activeReport, setActiveReport] = useState('demands');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const queryParams = useMemo(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    return p;
  }, [statusFilter, startDate, endDate]);

  // Hook invocations per tab (lazy or condition-based)
  const demandsQ = useGetDemandsReportQuery(queryParams, { skip: activeReport !== 'demands' });
  const beneficiariesQ = useGetBeneficiariesReportQuery({ verificationStatus: statusFilter || undefined }, { skip: activeReport !== 'beneficiaries' });
  const paymentsQ = useGetPaymentsReportQuery(queryParams, { skip: activeReport !== 'payments' });
  const productsQ = useGetProductsReportQuery({ status: statusFilter || undefined }, { skip: activeReport !== 'products' });
  const ordersQ = useGetOrdersReportQuery(queryParams, { skip: activeReport !== 'orders' });
  const oemsQ = useGetOemsReportQuery(undefined, { skip: activeReport !== 'oems' });
  const dealersQ = useGetDealersReportQuery(undefined, { skip: activeReport !== 'dealers' });
  const depotsQ = useGetDepotsReportQuery(undefined, { skip: activeReport !== 'depots' });
  const urcsQ = useGetUrcsReportQuery(undefined, { skip: activeReport !== 'urcs' });
  const refundsQ = useGetRefundsReportQuery(queryParams, { skip: activeReport !== 'refunds' });
  const auditQ = useGetAuditReportQuery({ limit: 100, ...queryParams }, { skip: activeReport !== 'audit' });
  const authQ = useGetAuthReportQuery({ limit: 100, ...queryParams }, { skip: activeReport !== 'auth' });

  // Current query resolution
  const currentQuery = useMemo(() => {
    switch (activeReport) {
      case 'demands': return demandsQ;
      case 'beneficiaries': return beneficiariesQ;
      case 'payments': return paymentsQ;
      case 'products': return productsQ;
      case 'orders': return ordersQ;
      case 'oems': return oemsQ;
      case 'dealers': return dealersQ;
      case 'depots': return depotsQ;
      case 'urcs': return urcsQ;
      case 'refunds': return refundsQ;
      case 'audit': return auditQ;
      case 'auth': return authQ;
      default: return demandsQ;
    }
  }, [activeReport, demandsQ, beneficiariesQ, paymentsQ, productsQ, ordersQ, oemsQ, dealersQ, depotsQ, urcsQ, refundsQ, auditQ, authQ]);

  const rawData = useMemo(() => {
    const d = currentQuery.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  }, [currentQuery.data]);

  // Client search filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return rawData;
    const q = search.toLowerCase();
    return rawData.filter((item) => {
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(q);
        }
        if (val && typeof val === 'object') {
          return Object.values(val).some((sub) => String(sub).toLowerCase().includes(q));
        }
        return false;
      });
    });
  }, [rawData, search]);

  // Dynamic KPI Stats based on current report
  const kpiStats = useMemo(() => {
    const total = filteredData.length;
    switch (activeReport) {
      case 'demands': {
        const approved = filteredData.filter((d) => d.status === 'APPROVED' || d.status === 'SUPPLY_ORDER_ISSUED' || d.status === 'COMPLETED').length;
        const totalVal = filteredData.reduce((acc, d) => acc + (d.totalAmount || 0), 0);
        const processing = filteredData.filter((d) => d.status === 'PROCESSING' || d.status === 'PAYMENT_VERIFIED').length;
        return [
          { title: 'Total Demands', value: total, subtitle: 'Filtered Scope' },
          { title: 'Approved / Executed', value: approved, subtitle: `${total > 0 ? Math.round((approved / total) * 100) : 0}% Sanction Rate` },
          { title: 'Gross Indent Value', value: formatCurrency(totalVal), subtitle: 'Total Indent Capital' },
          { title: 'Under Processing', value: processing, subtitle: 'Depot Action Required' },
        ];
      }
      case 'payments': {
        const success = filteredData.filter((p) => p.status === 'SUCCESS').length;
        const totalAmt = filteredData.filter((p) => p.status === 'SUCCESS').reduce((acc, p) => acc + (p.amount || 0), 0);
        return [
          { title: 'Total Transactions', value: total, subtitle: 'All Gateways & UTRs' },
          { title: 'Settled & Verified', value: success, subtitle: `${total > 0 ? Math.round((success / total) * 100) : 0}% Success Rate` },
          { title: 'Realized Revenue', value: formatCurrency(totalAmt), subtitle: 'Net CSD Treasury Collections' },
          { title: 'Pending Settlement', value: total - success, subtitle: 'Reconciliation Needed' },
        ];
      }
      case 'orders': {
        const completed = filteredData.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
        const totalVal = filteredData.reduce((acc, o) => acc + (o.amount || o.totalAmount || 0), 0);
        return [
          { title: 'Supply Orders Issued', value: total, subtitle: 'Authorized Orders' },
          { title: 'Delivered / Completed', value: completed, subtitle: `${total > 0 ? Math.round((completed / total) * 100) : 0}% Delivery Rate` },
          { title: 'Total Order Value', value: formatCurrency(totalVal), subtitle: 'Procurement Volume' },
          { title: 'In Transit / Pending', value: total - completed, subtitle: 'URC / Dealer Custody' },
        ];
      }
      case 'beneficiaries': {
        const verified = filteredData.filter((b) => b.verificationStatus === 'APPROVED' || b.verificationStatus === 'VERIFIED').length;
        const pending = filteredData.filter((b) => b.verificationStatus === 'PENDING').length;
        return [
          { title: 'Total Beneficiaries', value: total, subtitle: 'Defence Personnel' },
          { title: 'Verified Profiles', value: verified, subtitle: 'Authorized for Indents' },
          { title: 'Pending Approval', value: pending, subtitle: 'CS Director Queue' },
          { title: 'Rejection / Hold', value: total - verified - pending, subtitle: 'Clarification Needed' },
        ];
      }
      default:
        return [
          { title: 'Total Records', value: total, subtitle: 'Current Filter' },
          { title: 'Active Entities', value: filteredData.filter((x) => x.active !== false && x.status !== 'INACTIVE').length, subtitle: 'Operational' },
          { title: 'Status', value: 'Live System Data', subtitle: 'PostgreSQL/MongoDB' },
          { title: 'Audit Verification', value: 'Compliant', subtitle: 'Ministry of Defence' },
        ];
    }
  }, [filteredData, activeReport]);

  // Table Columns per Report
  const columns = useMemo(() => {
    switch (activeReport) {
      case 'demands':
        return [
          { header: 'Demand No', accessor: 'demandNo', render: (d) => <span className="font-mono font-bold text-brand">{d.demandNo}</span> },
          { header: 'Beneficiary', accessor: 'beneficiaryId', render: (d) => <div><div className="font-semibold text-ink">{d.beneficiaryId?.name || 'N/A'}</div><div className="text-xs text-muted font-mono">{d.beneficiaryId?.serviceNumber || ''} {d.beneficiaryId?.rank ? `(${d.beneficiaryId.rank})` : ''}</div></div> },
          { header: 'Product Indented', accessor: 'productSnapshot', render: (d) => <div><div className="font-medium text-ink">{d.productSnapshot?.name || 'N/A'}</div><div className="text-xs text-muted font-mono">{d.productSnapshot?.indexNo || d.productSnapshot?.sku || ''}</div></div> },
          { header: 'Commercial Dealer', accessor: 'dealerId', render: (d) => <span className="text-xs font-medium text-slate-700">{d.dealerId?.name || 'N/A'}</span> },
          { header: 'Depot & URC', accessor: 'depotId', render: (d) => <div className="text-xs"><div><strong>Depot:</strong> {d.depotId?.name || 'N/A'}</div><div className="text-muted"><strong>URC:</strong> {d.urcId?.name || 'N/A'}</div></div> },
          { header: 'Indented Amount', accessor: 'totalAmount', render: (d) => <span className="font-bold font-mono text-ink">{formatCurrency(d.totalAmount)}</span> },
          { header: 'Payment', accessor: 'paymentStatus', render: (d) => <Badge variant={d.paymentStatus === 'PAID' ? 'success' : d.paymentStatus === 'PENDING' ? 'warning' : 'neutral'}>{d.paymentStatus}</Badge> },
          { header: 'Demand Status', accessor: 'status', render: (d) => <Badge variant={d.status === 'COMPLETED' ? 'success' : d.status === 'APPROVED' ? 'brand' : d.status === 'REJECTED' ? 'danger' : 'warning'}>{d.status}</Badge> },
          { header: 'Date', accessor: 'createdAt', render: (d) => <span className="text-xs text-muted font-mono">{formatDate(d.createdAt)}</span> },
        ];

      case 'beneficiaries':
        return [
          { header: 'Service No', accessor: 'serviceNumber', render: (b) => <span className="font-mono font-bold text-brand">{b.serviceNumber}</span> },
          { header: 'Full Name & Rank', accessor: 'name', render: (b) => <div><div className="font-semibold text-ink">{b.name}</div><div className="text-xs text-muted">{b.rank || 'Armed Forces'}</div></div> },
          { header: 'Category', accessor: 'category', render: (b) => <Badge variant="outline">{b.category || 'DEFENCE'}</Badge> },
          { header: 'Pay Level', accessor: 'payLevel', render: (b) => <span className="font-mono font-semibold">Level {b.payLevel || 'N/A'}</span> },
          { header: 'Verification Status', accessor: 'verificationStatus', render: (b) => <Badge variant={b.verificationStatus === 'APPROVED' ? 'success' : b.verificationStatus === 'PENDING' ? 'warning' : 'danger'}>{b.verificationStatus}</Badge> },
          { header: 'Registered On', accessor: 'createdAt', render: (b) => <span className="text-xs text-muted font-mono">{formatDate(b.createdAt)}</span> },
        ];

      case 'payments':
        return [
          { header: 'Txn / UTR', accessor: 'utr', render: (p) => <span className="font-mono font-bold text-ink">{p.utr || p.gatewayPaymentId || p._id?.slice(-8)}</span> },
          { header: 'Demand Reference', accessor: 'demandId', render: (p) => <span className="font-mono font-semibold text-brand">{p.demandId?.demandNo || 'N/A'}</span> },
          { header: 'Method', accessor: 'method', render: (p) => <span className="badge-pill badge-outline badge-sm uppercase">{p.method || 'GATEWAY'}</span> },
          { header: 'Settled Amount', accessor: 'amount', render: (p) => <span className="font-bold font-mono text-green-700">{formatCurrency(p.amount)}</span> },
          { header: 'Gateway Status', accessor: 'status', render: (p) => <Badge variant={p.status === 'SUCCESS' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'}>{p.status}</Badge> },
          { header: 'Timestamp', accessor: 'createdAt', render: (p) => <span className="text-xs text-muted font-mono">{formatDate(p.createdAt)}</span> },
        ];

      case 'products':
        return [
          { header: 'Index / SKU', accessor: 'sku', render: (p) => <span className="font-mono font-bold text-brand">{p.indexNo || p.sku}</span> },
          { header: 'Product Description', accessor: 'name', render: (p) => <div><div className="font-semibold text-ink">{p.name}</div><div className="text-xs text-muted">{p.variant ? `Variant: ${p.variant}` : ''}</div></div> },
          { header: 'Category & OEM', accessor: 'categoryId', render: (p) => <div className="text-xs"><div><strong>OEM:</strong> {p.oemId?.name || 'N/A'}</div><div className="text-muted"><strong>Cat:</strong> {p.categoryId?.name || p.afdType || 'AFD-I'}</div></div> },
          { header: 'MRP (Civil)', accessor: 'mrp', render: (p) => <span className="text-xs line-through text-muted">{formatCurrency(p.mrp)}</span> },
          { header: 'Price To Customer', accessor: 'priceToCustomer', render: (p) => <span className="font-bold font-mono text-green-700">{formatCurrency(p.priceToCustomer || p.price)}</span> },
          { header: 'Catalogue Status', accessor: 'status', render: (p) => <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>{p.status}</Badge> },
        ];

      case 'orders':
        return [
          { header: 'Supply Order No', accessor: 'orderNo', render: (o) => <span className="font-mono font-bold text-brand">{o.orderNo}</span> },
          { header: 'Demand No', accessor: 'demandId', render: (o) => <span className="font-mono font-medium">{o.demandId?.demandNo || 'N/A'}</span> },
          { header: 'Commercial Dealer', accessor: 'dealerId', render: (o) => <span className="text-xs font-semibold">{o.dealerId?.name || 'N/A'}</span> },
          { header: 'Depot & URC Handover', accessor: 'depotId', render: (o) => <div className="text-xs"><div>{o.depotId?.name || 'N/A'}</div><div className="text-muted">{o.urcId?.name || ''}</div></div> },
          { header: 'Sanction Value', accessor: 'amount', render: (o) => <span className="font-bold font-mono text-ink">{formatCurrency(o.amount || o.totalAmount)}</span> },
          { header: 'Order Status', accessor: 'status', render: (o) => <Badge variant={o.status === 'COMPLETED' ? 'success' : o.status === 'SUPPLY_ORDER_ISSUED' ? 'brand' : 'warning'}>{o.status}</Badge> },
          { header: 'Issue Date', accessor: 'createdAt', render: (o) => <span className="text-xs text-muted font-mono">{formatDate(o.createdAt)}</span> },
        ];

      case 'oems':
        return [
          { header: 'OEM Code', accessor: 'code', render: (o) => <span className="font-mono font-bold text-brand">{o.code}</span> },
          { header: 'Manufacturer Name', accessor: 'name', render: (o) => <strong>{o.name}</strong> },
          { header: 'Contact Person', accessor: 'person', render: (o) => <div className="text-xs"><div>{o.person}</div><div className="text-muted">{o.email || o.phone}</div></div> },
          { header: 'Headquarters', accessor: 'city', render: (o) => `${o.city || ''}, ${o.state || ''}` },
          { header: 'Active Status', accessor: 'active', render: (o) => <Badge variant={o.active ? 'success' : 'neutral'}>{o.active ? 'ACTIVE' : 'INACTIVE'}</Badge> },
        ];

      case 'dealers':
        return [
          { header: 'Dealer Code', accessor: 'code', render: (d) => <span className="font-mono font-bold text-brand">{d.code}</span> },
          { header: 'Showroom Name', accessor: 'name', render: (d) => <strong>{d.name}</strong> },
          { header: 'Parent OEM', accessor: 'oemId', render: (d) => <span className="badge-pill badge-outline badge-sm font-semibold">{d.oemId?.name || 'N/A'}</span> },
          { header: 'Location', accessor: 'city', render: (d) => `${d.city || ''}, ${d.state || ''}` },
          { header: 'Contact Details', accessor: 'phone', render: (d) => <span className="text-xs font-mono">{d.phone || d.email || 'N/A'}</span> },
          { header: 'Authorization', accessor: 'active', render: (d) => <Badge variant={d.active ? 'success' : 'neutral'}>{d.active ? 'AUTHORIZED' : 'SUSPENDED'}</Badge> },
        ];

      case 'depots':
        return [
          { header: 'Depot Code', accessor: 'code', render: (d) => <span className="font-mono font-bold text-brand">{d.code}</span> },
          { header: 'Depot Command Node', accessor: 'name', render: (d) => <strong>{d.name}</strong> },
          { header: 'Location / State', accessor: 'state', render: (d) => `${d.city || ''}, ${d.state || ''}` },
          { header: 'Nodal Contact', accessor: 'contactPerson', render: (d) => <span className="text-xs">{d.contactPerson || d.phone || 'Depot HQ'}</span> },
          { header: 'Operational Status', accessor: 'active', render: (d) => <Badge variant={d.active ? 'success' : 'neutral'}>{d.active ? 'OPERATIONAL' : 'INACTIVE'}</Badge> },
        ];

      case 'urcs':
        return [
          { header: 'URC Code', accessor: 'code', render: (u) => <span className="font-mono font-bold text-brand">{u.code}</span> },
          { header: 'URC Canteen Name', accessor: 'name', render: (u) => <strong>{u.name}</strong> },
          { header: 'Parent Depot Link', accessor: 'depotId', render: (u) => <span className="font-semibold text-brand text-xs">{u.depotId?.name || 'N/A'}</span> },
          { header: 'Station / Station HQ', accessor: 'city', render: (u) => `${u.city || ''}, ${u.state || ''}` },
          { header: 'Status', accessor: 'active', render: (u) => <Badge variant={u.active ? 'success' : 'neutral'}>{u.active ? 'ACTIVE' : 'INACTIVE'}</Badge> },
        ];

      case 'refunds':
        return [
          { header: 'Refund No', accessor: 'refundNo', render: (r) => <span className="font-mono font-bold text-brand">{r.refundNo}</span> },
          { header: 'Demand Reference', accessor: 'paymentId', render: (r) => <span className="font-mono font-semibold">{r.paymentId?.demandId?.demandNo || 'N/A'}</span> },
          { header: 'Refund Amount', accessor: 'amount', render: (r) => <span className="font-bold font-mono text-ink">{formatCurrency(r.amount)}</span> },
          { header: 'Reason For Reversal', accessor: 'reason', render: (r) => <span className="text-xs text-slate-700">{r.reason || 'Order Cancellation'}</span> },
          { header: 'Status', accessor: 'status', render: (r) => <Badge variant={r.status === 'SUCCESS' ? 'success' : r.status === 'REQUESTED' ? 'warning' : 'danger'}>{r.status}</Badge> },
          { header: 'Date', accessor: 'createdAt', render: (r) => <span className="text-xs text-muted font-mono">{formatDate(r.createdAt)}</span> },
        ];

      case 'audit':
        return [
          { header: 'Timestamp', accessor: 'timestamp', render: (a) => <span className="text-xs font-mono">{formatDate(a.timestamp)}</span> },
          { header: 'Actor & Role', accessor: 'userName', render: (a) => <div><div className="font-semibold text-xs">{a.userName || 'System'}</div><div className="text-[10px] text-muted font-mono">{a.role}</div></div> },
          { header: 'Action Executed', accessor: 'action', render: (a) => <span className="badge-pill badge-primary badge-sm font-mono">{a.action}</span> },
          { header: 'Module & Entity', accessor: 'module', render: (a) => <span className="text-xs font-medium">{a.module} / {a.entityType}</span> },
          { header: 'Client IP', accessor: 'ip', render: (a) => <span className="font-mono text-xs text-muted">{a.ip || '127.0.0.1'}</span> },
        ];

      case 'auth':
        return [
          { header: 'Timestamp', accessor: 'at', render: (l) => <span className="text-xs font-mono">{formatDate(l.at)}</span> },
          { header: 'Account / Service No', accessor: 'identifier', render: (l) => <span className="font-mono font-bold text-brand">{l.identifier}</span> },
          { header: 'Auth Event', accessor: 'event', render: (l) => <Badge variant={l.event === 'LOGIN' ? 'brand' : 'outline'}>{l.event}</Badge> },
          { header: 'Authentication Outcome', accessor: 'success', render: (l) => <Badge variant={l.success ? 'success' : 'danger'}>{l.success ? 'SUCCESS' : 'FAILED'}</Badge> },
          { header: 'Client Machine & IP', accessor: 'ip', render: (l) => <div className="text-xs font-mono"><div>{l.ip}</div><div className="text-[10px] text-muted">{l.browser || l.device || ''}</div></div> },
        ];

      default:
        return [];
    }
  }, [activeReport]);

  const activeTabObj = REPORT_TABS.find((t) => t.id === activeReport);

  return (
    <div className="admin-reports-page space-y-6">
      <PageHeader
        title="Admin & CSD-HO Management Information System (MIS)"
        subtitle="Dynamic enterprise reports, operational throughput, treasury records, and regulatory audit compliance."
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'MIS Reports' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => currentQuery.refetch()}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${currentQuery.isFetching ? 'animate-spin text-brand' : ''}`} />
            </button>
            <ExportButton
              filename={`CSD_AFD_${activeReport.toUpperCase()}_REPORT_${new Date().toISOString().slice(0, 10)}`}
              data={filteredData}
              label={`Export ${activeTabObj?.label.replace(/^\d+\.\s*/, '')} (CSV)`}
            />
          </div>
        }
      />

      {/* 13-Report Tab Navigation Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveReport(tab.id);
                  setStatusFilter('');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic KPI Strip for Current Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${activeTabObj?.label.replace(/^\d+\.\s*/, '')}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status dropdown where applicable */}
            {['demands', 'beneficiaries', 'payments', 'products', 'orders', 'refunds'].includes(activeReport) && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">All Statuses</option>
                {activeReport === 'demands' && (
                  <>
                    <option value="CREATED">Created</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="PAYMENT_VERIFIED">Payment Verified</option>
                    <option value="APPROVED">Approved</option>
                    <option value="SUPPLY_ORDER_ISSUED">Supply Order Issued</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </>
                )}
                {activeReport === 'beneficiaries' && (
                  <>
                    <option value="PENDING">Pending Verification</option>
                    <option value="APPROVED">Approved / Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </>
                )}
                {activeReport === 'payments' && (
                  <>
                    <option value="SUCCESS">Success / Realized</option>
                    <option value="PENDING">Pending / Processing</option>
                    <option value="FAILED">Failed</option>
                  </>
                )}
                {activeReport === 'products' && (
                  <>
                    <option value="ACTIVE">Active in Catalogue</option>
                    <option value="INACTIVE">Inactive</option>
                  </>
                )}
                {activeReport === 'orders' && (
                  <>
                    <option value="PLACED">Placed</option>
                    <option value="SUPPLY_ORDER_ISSUED">Supply Order Issued</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="COMPLETED">Completed</option>
                  </>
                )}
                {activeReport === 'refunds' && (
                  <>
                    <option value="REQUESTED">Requested</option>
                    <option value="SUCCESS">Processed</option>
                    <option value="FAILED">Failed</option>
                  </>
                )}
              </select>
            )}

            {/* Date range filter where applicable */}
            {['demands', 'payments', 'orders', 'refunds', 'audit', 'auth'].includes(activeReport) && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
                  title="From Date"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
                  title="To Date"
                />
              </div>
            )}

            {(statusFilter || startDate || endDate || search) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setStartDate('');
                  setEndDate('');
                  setSearch('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Dynamic Data Table */}
      <Card
        title={`${activeTabObj?.label.replace(/^\d+\.\s*/, '')} Data Records`}
        subtitle={`Displaying ${filteredData.length} records retrieved from database`}
      >
        {currentQuery.isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
            <p className="font-semibold text-sm">Aggregating live report records...</p>
          </div>
        ) : currentQuery.isError ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
            <p className="font-semibold text-sm">Unable to load report data from server.</p>
            <p className="text-xs text-rose-500 mt-1">{currentQuery.error?.data?.message || 'Server communication error'}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No records found matching criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </Card>
    </div>
  );
};

export default AdminReports;
