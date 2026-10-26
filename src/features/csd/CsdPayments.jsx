import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Download,
  Search,
  RefreshCw,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useGetPaymentsQuery, useVerifyPaymentMutation } from '../payment/paymentApi.js';

export default function CsdPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [toast, setToast] = useState('');

  const queryParams = useMemo(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (searchTerm) p.q = searchTerm;
    return p;
  }, [statusFilter, searchTerm]);

  const { data: paymentsData, isLoading, isFetching, refetch } = useGetPaymentsQuery(queryParams);
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  const payments = useMemo(() => {
    return paymentsData?.items || (Array.isArray(paymentsData) ? paymentsData : []);
  }, [paymentsData]);

  const kpiStats = useMemo(() => {
    const total = payments.length;
    const success = payments.filter((p) => p.status === 'SUCCESS' || p.status === 'VERIFIED').length;
    const totalAmt = payments
      .filter((p) => p.status === 'SUCCESS' || p.status === 'VERIFIED')
      .reduce((acc, p) => acc + (p.amount || 0), 0);
    const pending = payments.filter((p) => p.status === 'INITIATED' || p.status === 'PENDING').length;

    return [
      { title: 'Total Transactions', value: total, subtitle: 'All Payment Gateways' },
      { title: 'Realized & Reconciled', value: success, subtitle: `${total > 0 ? Math.round((success / total) * 100) : 0}% Realization Rate` },
      { title: 'Treasury Volume', value: formatCurrency(totalAmt), subtitle: 'Verified Receipts' },
      { title: 'Pending Settlement', value: pending, subtitle: 'In Clearance' },
    ];
  }, [payments]);

  const handleVerify = async (payment) => {
    try {
      await verifyPayment({
        paymentId: payment._id || payment.id,
        demandId: payment.demandId?._id || payment.demandId,
        gatewayPaymentId: payment.gatewayPaymentId || payment.utr || 'VERIFIED_TREASURY_' + Date.now(),
      }).unwrap();
      setToast(`Transaction ${payment.paymentNo || payment._id} verified and reconciled against Treasury.`);
      setTimeout(() => setToast(''), 5000);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to verify transaction');
    }
  };

  const columns = [
    {
      header: 'Receipt / Payment No',
      accessor: 'paymentNo',
      render: (row) => <span className="font-mono font-bold text-brand">{row.paymentNo || row._id?.slice(-8)}</span>,
    },
    {
      header: 'Demand Ref',
      accessor: 'demandId',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {row.demandId?.demandNo || row.demandNo || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiaryId',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs block text-ink">
            {row.beneficiaryId?.fullName || row.beneficiaryId?.name || 'Applicant'}
          </span>
          <span className="text-[10px] text-muted font-mono">{row.beneficiaryId?.serviceNumber || ''}</span>
        </div>
      ),
    },
    {
      header: 'Amount Realized',
      accessor: 'amount',
      render: (row) => (
        <span className="font-bold font-mono text-xs text-green-700">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Channel & UTR',
      accessor: 'method',
      render: (row) => (
        <div>
          <span className="badge-pill badge-outline badge-sm uppercase text-[10px] font-mono">
            {row.method || row.provider || 'ONLINE'}
          </span>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{row.utr || row.gatewayTxnId || 'Direct Treasury'}</div>
        </div>
      ),
    },
    {
      header: 'Transaction Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-xs text-muted font-mono">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'SUCCESS' || row.status === 'VERIFIED' ? 'success' : row.status === 'FAILED' ? 'danger' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Reconciliation',
      accessor: '_id',
      render: (row) => (
        <div className="csd-action-row">
          <button
            type="button"
            className="csd-btn-action-view"
            onClick={() => setSelectedPayment(row)}
            title="Inspect Payment Details"
          >
            <Eye size={13} /> View
          </button>
          {row.status !== 'SUCCESS' && row.status !== 'VERIFIED' ? (
            <button
              type="button"
              className="csd-btn-action-edit"
              onClick={() => handleVerify(row)}
              disabled={isVerifying}
              title="Verify & Reconcile against Treasury"
            >
              <RotateCcw size={13} className={isVerifying ? 'spin-icon' : ''} />
              <span>Verify & Reconcile</span>
            </button>
          ) : (
            <span className="csd-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={13} /> Reconciled
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="csd-payments-page space-y-6">
      <PageHeader
        title="National Treasury & Cyber Payment Directorate"
        subtitle="Daily automated reconciliation of Bharatkosh, Cyber Treasury, and institutional defense remittances."
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Payment Registry' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Transactions"
          >
            <RefreshCw size={14} className={`mr-xs ${isFetching ? 'spin-icon' : ''}`} />
            {isFetching ? 'Syncing...' : 'Sync Payments'}
          </Button>
        }
      />

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

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
              placeholder="Search by Payment No, Demand, or UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
            >
              <option value="">All Payment Statuses</option>
              <option value="SUCCESS">Success / Verified</option>
              <option value="INITIATED">Initiated</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
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
      <Card title="Payment & Treasury Transactions" subtitle={`Showing ${payments.length} transactions from database`}>
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
            <p className="font-semibold text-sm">Loading transactions from server...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No payment transactions match filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your filters</p>
          </div>
        ) : (
          <DataTable columns={columns} data={payments} />
        )}
      </Card>

      {/* Payment Inspection Modal */}
      {selectedPayment && (
        <Modal
          isOpen={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
          title={`Payment Dossier: ${selectedPayment.paymentNo || selectedPayment._id?.slice(-8)}`}
          maxWidth="640px"
        >
          <div className="director-modal-form">
            <div className="csd-card-preview-box">
              <div className="csd-card-preview-header">
                <h3 className="csd-card-preview-title">
                  Amount Realized: {formatCurrency(selectedPayment.amount)}
                </h3>
                <Badge variant={selectedPayment.status === 'SUCCESS' || selectedPayment.status === 'VERIFIED' ? 'success' : selectedPayment.status === 'FAILED' ? 'danger' : 'warning'}>
                  {selectedPayment.status}
                </Badge>
              </div>
              <div className="csd-subtext-muted">
                Payment No: <strong>{selectedPayment.paymentNo || selectedPayment._id}</strong> | Demand Ref: <strong>{selectedPayment.demandId?.demandNo || selectedPayment.demandNo || 'N/A'}</strong>
              </div>
            </div>

            <div className="csd-preview-grid-2">
              <div>
                <span className="csd-preview-field-label">Beneficiary</span>
                <div className="csd-preview-field-value">
                  {selectedPayment.beneficiaryId?.fullName || selectedPayment.beneficiaryId?.name || 'Applicant'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Service Number</span>
                <div className="csd-preview-field-value font-mono">
                  {selectedPayment.beneficiaryId?.serviceNumber || 'Armed Forces'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Payment Channel</span>
                <div className="csd-preview-field-value uppercase">
                  {selectedPayment.method || selectedPayment.provider || 'ONLINE'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">UTR / Gateway Txn ID</span>
                <div className="csd-preview-field-value font-mono">
                  {selectedPayment.utr || selectedPayment.gatewayTxnId || 'Direct Treasury'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Transaction Date</span>
                <div className="csd-preview-field-value">
                  {formatDate(selectedPayment.createdAt)}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Reconciliation Status</span>
                <div className="csd-preview-field-value">
                  {selectedPayment.status === 'SUCCESS' || selectedPayment.status === 'VERIFIED' ? 'Fully Reconciled' : 'Pending Clearance'}
                </div>
              </div>
            </div>

            <div className="director-modal-actions">
              {selectedPayment.status !== 'SUCCESS' && selectedPayment.status !== 'VERIFIED' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleVerify(selectedPayment);
                    setSelectedPayment(null);
                  }}
                  disabled={isVerifying}
                >
                  <RotateCcw size={14} className="mr-xs" /> Reconcile Now
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
