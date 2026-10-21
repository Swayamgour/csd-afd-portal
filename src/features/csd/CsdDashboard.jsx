import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  CreditCard,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import ChartCard from '../../components/common/ChartCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetAdminSummaryQuery } from '../admin/adminApi.js';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { useGetTicketsQuery } from '../helpdesk/ticketApi.js';

export default function CsdDashboard() {
  const navigate = useNavigate();

  const {
    data: summaryData,
    isLoading: loadingSummary,
    isFetching: fetchingSummary,
    refetch: refetchSummary,
  } = useGetAdminSummaryQuery();

  const {
    data: demandsData,
    isLoading: loadingDemands,
    refetch: refetchDemands,
  } = useGetDemandsQuery();

  const {
    data: ticketsData,
    isLoading: loadingTickets,
    refetch: refetchTickets,
  } = useGetTicketsQuery({ status: 'ESCALATED' });

  const summary = summaryData || {};
  const demands = Array.isArray(demandsData?.items)
    ? demandsData.items
    : Array.isArray(demandsData)
    ? demandsData
    : [];

  const escalatedTickets = Array.isArray(ticketsData)
    ? ticketsData
    : Array.isArray(ticketsData?.items)
    ? ticketsData.items
    : [];

  const loading = loadingSummary || loadingDemands || loadingTickets;

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchDemands(), refetchTickets()]);
  };

  const demandColumns = [
    {
      header: 'Demand ID',
      accessor: 'demandNo',
      render: (row) => <span className="font-semibold text-brand">{row.demandNo || row._id}</span>,
    },
    {
      header: 'Applicant',
      accessor: 'beneficiaryId',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.beneficiaryId?.fullName || 'Applicant'}</span>
          <span className="micro muted">{row.beneficiaryId?.serviceNumber || ''}</span>
        </div>
      ),
    },
    {
      header: 'Item / Vehicle',
      accessor: 'productSnapshot',
      render: (row) => row.productSnapshot?.name || row.productId?.name || 'AFD Product',
    },
    {
      header: 'Regional Depot',
      accessor: 'depotId',
      render: (row) => row.depotId?.name || 'Regional Depot',
    },
    {
      header: 'Sanction Value',
      accessor: 'totalAmount',
      render: (row) => `₹ ${(row.totalAmount || 0).toLocaleString('en-IN')}`,
    },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Review',
      accessor: '_id',
      render: (row) => (
        <Link to={`/csd/demands`} className="btn sm out">
          Scrutiny
        </Link>
      ),
    },
  ];

  return (
    <div className="csd-dashboard-page">
      <PageHeader
        title="CSD Head Office Operations Directorate"
        subtitle="National procurement oversight, policy enforcement, depot sanctions, and institutional dealer governance."
        actions={
          <div className="row gap-1">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={fetchingSummary}
              onClick={handleRefresh}
            >
              Sync Real-Time
            </Button>
            <Link to="/csd/reports" className="btn btn-primary">
              Generate National MIS Report
            </Link>
          </div>
        }
      />

      {/* Top Oversight KPIs */}
      <div className="kpi-grid mb-3">
        <StatCard
          title="Total Registered Beneficiaries"
          value={(summary.totalBeneficiaries ?? 0).toLocaleString('en-IN')}
          subtext="Armed Forces & Veterans"
          icon={Users}
          trend={{ value: `${summary.pendingBeneficiaryVerification ?? 0} Pending Approval`, isUp: true }}
          variant="primary"
          onClick={() => navigate('/csd/beneficiaries')}
        />
        <StatCard
          title="AFD Demands In Pipeline"
          value={summary.totalDemands ?? demands.length}
          subtext={`Active Depots: ${summary.activeDepots ?? 0}`}
          icon={FileText}
          variant="default"
          onClick={() => navigate('/csd/demands')}
        />
        <StatCard
          title="Treasury Collections"
          value={`₹ ${((summary.totalRevenue || 0) / 10000000).toFixed(2)} Cr`}
          subtext="Reconciled Collections"
          icon={CreditCard}
          trend={{ value: '100% matched', isUp: true }}
          variant="success"
          onClick={() => navigate('/csd/payments')}
        />
        <StatCard
          title="Escalated Grievances"
          value={`${escalatedTickets.length} Cases`}
          subtext="Requiring HQ Intervention"
          icon={ShieldAlert}
          variant={escalatedTickets.length > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/csd/support')}
        />
      </div>

      {/* 2-Column: National Demand Sanctions & Regional Depot Breakdown */}
      <div className="grid-2-col gap-2 mb-3">
        <Card
          title="Regional Depot Procurement Volume"
          subtitle="Real-time distribution of AFD allocation by zonal command"
        >
          <ChartCard
            title=""
            data={[
              { label: 'Processing Demands', value: summary.processingDemands || 1, displayValue: `${summary.processingDemands || 0} Demands`, color: 'var(--brand)' },
              { label: 'Pending Payment', value: summary.pendingPaymentDemands || 1, displayValue: `${summary.pendingPaymentDemands || 0} Demands`, color: '#3b82f6' },
              { label: 'Approved & Supply Order Issued', value: summary.approvedDemands || 1, displayValue: `${summary.approvedDemands || 0} Sanctions`, color: 'var(--green)' },
              { label: 'Rejected / Cancelled', value: summary.rejectedDemands || 1, displayValue: `${summary.rejectedDemands || 0} Demands`, color: 'var(--saffron)' }
            ]}
          />
        </Card>

        {/* Escalated Helpdesk Cases */}
        <Card
          title="HQ Escalation Oversight Cases"
          subtitle="Grievances escalated directly to Joint Director / CSD Head Office"
          actions={
            <Link to="/csd/support" className="link small font-semibold">
              View All Support Cases
            </Link>
          }
        >
          <div className="escalated-tickets-list flex-col gap-2">
            {escalatedTickets.length === 0 ? (
              <p className="muted small p-3">No unresolved high-priority escalations pending.</p>
            ) : (
              escalatedTickets.slice(0, 4).map((t) => (
                <div key={t._id || t.id} className="panel p-3 border-left-danger bg-red-soft">
                  <div className="between align-start mb-1">
                    <span className="font-semibold text-danger small block">
                      {t.ticketNo || t.id} · {t.category}
                    </span>
                    <span className="badge-pill badge-danger badge-sm">Level {t.escalationLevel || 1} HQ</span>
                  </div>
                  <h4 className="font-semibold small mb-1">{t.subject}</h4>
                  <p className="small muted mb-2">Complainant: <b>{t.userName || 'Beneficiary'}</b></p>
                  <div className="between align-center">
                    <span className="micro text-danger font-semibold">Status: {t.status}</span>
                    <Link to={`/helpdesk/tickets`} className="btn sm out">
                      Investigate Case
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Demands Scrutiny Table */}
      <Card
        title="National Demand Inflow"
        subtitle="Live queue of applications submitted across regional commands"
        actions={
          <Link to="/csd/demands" className="link small font-semibold">
            All Demands & Approvals
          </Link>
        }
      >
        <DataTable
          columns={demandColumns}
          data={demands.slice(0, 5)}
          loading={loading}
        />
      </Card>
    </div>
  );
}
