import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  Eye,
  Download,
  Users,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../permissions/roles.js';
import { useGetBeneficiariesQuery } from '../admin/adminApi.js';
import { formatDate } from '../../utils/formatters.js';

export default function CsdBeneficiaries() {
  const { user } = useAuth();
  const isDirector = user?.role === ROLES.CS_DIRECTOR;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  const queryParams = useMemo(() => {
    const p = {};
    if (statusFilter) p.verificationStatus = statusFilter;
    if (searchTerm) p.search = searchTerm;
    return p;
  }, [statusFilter, searchTerm]);

  const { data: beneficiariesData, isLoading, isFetching, refetch } = useGetBeneficiariesQuery(queryParams);

  const beneficiaries = useMemo(() => {
    if (Array.isArray(beneficiariesData)) return beneficiariesData;
    if (Array.isArray(beneficiariesData?.data)) return beneficiariesData.data;
    if (Array.isArray(beneficiariesData?.items)) return beneficiariesData.items;
    return [];
  }, [beneficiariesData]);

  const kpiStats = useMemo(() => {
    const total = beneficiaries.length;
    const approved = beneficiaries.filter(
      (b) => b.verificationStatus === 'APPROVED' || b.verificationStatus === 'VERIFIED'
    ).length;
    const pending = beneficiaries.filter(
      (b) => b.verificationStatus === 'PENDING' || !b.verificationStatus
    ).length;

    return [
      { title: 'Total Beneficiaries', value: total, subtitle: 'National Defense Registry' },
      { title: 'Verified Profiles', value: approved, subtitle: 'Authorized for Procurement' },
      { title: 'Pending Approval', value: pending, subtitle: 'Awaiting CS Director Verification' },
      { title: 'Authority Mode', value: isDirector ? 'Approval Authority' : 'View-Only Directorate', subtitle: isDirector ? 'CS Director Executive' : 'Strict View Only' },
    ];
  }, [beneficiaries, isDirector]);

  const columns = [
    {
      header: 'Service / Card No.',
      accessor: 'serviceNumber',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-brand">{row.serviceNumber || row.cardId || 'DEF-SVC'}</span>
          {row.cardId && <div className="text-[10px] text-muted font-mono">Card: {row.cardId}</div>}
        </div>
      ),
    },
    {
      header: 'Beneficiary Name & Rank',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs block text-ink">{row.name}</span>
          <span className="text-[10px] text-muted">{row.rank || 'Armed Forces Member'} ({row.category || 'DEFENCE'})</span>
        </div>
      ),
    },
    {
      header: 'Pay Level',
      accessor: 'payLevel',
      render: (row) => <span className="font-mono font-semibold text-xs">Level {row.payLevel || '1'}</span>,
    },
    {
      header: 'Verification Status',
      accessor: 'verificationStatus',
      render: (row) => {
        const isApproved = row.verificationStatus === 'APPROVED' || row.verificationStatus === 'VERIFIED';
        const isRejected = row.verificationStatus === 'REJECTED';
        return (
          <Badge variant={isApproved ? 'success' : isRejected ? 'danger' : 'warning'}>
            {isApproved ? 'VERIFIED' : isRejected ? 'REJECTED' : 'PENDING'}
          </Badge>
        );
      },
    },
    {
      header: 'Registered Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-xs text-muted font-mono">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="csd-action-row">
          <button
            type="button"
            className="csd-btn-action-view"
            onClick={() => setSelectedBeneficiary(row)}
            title="Inspect Beneficiary Dossier"
          >
            <Eye size={13} /> View
          </button>
          {!isDirector && (row.verificationStatus === 'PENDING' || !row.verificationStatus) && (
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Pending CS Director Approval
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="csd-beneficiaries-page space-y-6">
      <PageHeader
        title="Armed Forces Beneficiary Registry"
        subtitle="National database of active service personnel, defense pensioners, and authorized family members."
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Beneficiary Registry' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Beneficiaries"
          >
            <RefreshCw size={14} className={`mr-xs ${isFetching ? 'spin-icon' : ''}`} />
            {isFetching ? 'Syncing...' : 'Sync Beneficiaries'}
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiStats.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
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
              placeholder="Search by Service No, PAN, or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Verification Statuses</option>
              <option value="APPROVED">Verified / Approved</option>
              <option value="PENDING">Pending CS Director Verification</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {(statusFilter || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card title="Entitled Beneficiaries" subtitle={`Showing ${beneficiaries.length} records retrieved from server`}>
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
            <p className="font-semibold text-sm">Loading beneficiaries from registry...</p>
          </div>
        ) : beneficiaries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No beneficiaries located</p>
            <p className="text-xs text-slate-400 mt-1">Try searching by service number</p>
          </div>
        ) : (
          <DataTable columns={columns} data={beneficiaries} />
        )}
      </Card>

      {/* Dossier Modal */}
      {selectedBeneficiary && (
        <Modal
          isOpen={!!selectedBeneficiary}
          onClose={() => setSelectedBeneficiary(null)}
          title={`Beneficiary Dossier · ${selectedBeneficiary.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block">Service Number:</span>
                <span className="font-mono font-bold text-ink">{selectedBeneficiary.serviceNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Rank / Cadre:</span>
                <span className="font-semibold">{selectedBeneficiary.rank || 'Armed Forces'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pay Level:</span>
                <span className="font-mono font-semibold">Level {selectedBeneficiary.payLevel || '1'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Verification Status:</span>
                <Badge variant={selectedBeneficiary.verificationStatus === 'APPROVED' ? 'success' : 'warning'}>
                  {selectedBeneficiary.verificationStatus || 'PENDING'}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Permanent Account Number (PAN):</span>
                <span className="font-mono font-semibold">{selectedBeneficiary.pan || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Canteen Grocery Card:</span>
                <span className="font-mono">{selectedBeneficiary.cardId || 'CSD-CARD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entitlement Category:</span>
                <span className="font-semibold text-brand">{selectedBeneficiary.category || 'DEFENCE'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1">
                <span className="text-slate-500">Registration Date:</span>
                <span className="font-mono">{formatDate(selectedBeneficiary.createdAt)}</span>
              </div>
            </div>

            {!isDirector && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px]">
                <strong>Governance Rule:</strong> Admin & CSD-HO have strictly View-Only access to the Beneficiary Registry. Registration approvals and profile modifications are exclusively exercised by the <strong>CS Director</strong>.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
