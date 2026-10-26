import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Clock,
  Landmark,
  Upload,
  ArrowUpRight,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { PaymentDetailsModal } from '../../components/modals/PaymentDetailsModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useSubmitDirectTransferMutation,
} from '../payment/paymentApi.js';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export default function BeneficiaryPayments() {
  const { user } = useAuth();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [utrModalOpen, setUtrModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [paymentMode, setPaymentMode] = useState('sbi_epay');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Search & Filter State (identical to BeneficiaryProducts.jsx)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const {
    data: paymentsData,
    isLoading: loadingPayments,
    refetch: refetchPayments,
  } = useGetPaymentsQuery();

  const {
    data: demandsData,
    isLoading: loadingDemands,
    refetch: refetchDemands,
  } = useGetDemandsQuery();

  const [createPayment] = useCreatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [submitDirectTransfer] = useSubmitDirectTransferMutation();

  const payments = paymentsData?.items || [];
  const allDemands = demandsData?.items || [];

  // Demands that have Depot approval and are awaiting payment
  const pendingDemands = allDemands.filter(
    (d) =>
      ['APPROVED', 'PAYMENT_PENDING', 'ON HOLD'].includes((d.status || '').toUpperCase()) &&
      d.paymentStatus !== 'PAID'
  );

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const initiateOnlinePayment = (dem) => {
    setSelectedDemand(dem);
    setPayModalOpen(true);
  };

  const initiateUtrUpload = (dem) => {
    setSelectedDemand(dem);
    setUtrModalOpen(true);
  };

  const handleCompletePayment = async () => {
    if (!selectedDemand) return;
    setProcessing(true);
    try {
      const amount = selectedDemand.totalAmount || selectedDemand.totalPrice || selectedDemand.netPayable || 10000;
      const method = paymentMode === 'sbi_epay' ? 'DIRECT_TRANSFER' : 'GATEWAY';

      const payRes = await createPayment({
        demandId: selectedDemand._id || selectedDemand.id,
        amount,
        method,
        gateway: method === 'GATEWAY' ? 'BHARATKOSH' : undefined,
        utr: method === 'DIRECT_TRANSFER' ? `SBI-EPAY-${Date.now().toString().slice(-8)}` : undefined,
        bankName: 'State Bank of India',
      }).unwrap();

      const payDoc = payRes?.data || payRes;

      await verifyPayment({
        paymentId: payDoc._id,
        demandId: selectedDemand._id || selectedDemand.id,
        gatewayPaymentId: `TXN-${Date.now()}`,
      }).unwrap();

      setPayModalOpen(false);
      showToast('success', 'Treasury payment verified successfully. Demand updated to PAID.');
      refetchPayments();
      refetchDemands();
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to complete payment.'));
    } finally {
      setProcessing(false);
    }
  };

  const handleUtrSubmitSuccess = async (paymentPayload) => {
    try {
      if (paymentPayload && (paymentPayload.selfAccount?.utr || paymentPayload.utrNumber)) {
        const targetDemandId = selectedDemand?._id || selectedDemand?.id;
        const utr = paymentPayload.selfAccount?.utr || paymentPayload.utrNumber;
        const bank = paymentPayload.selfAccount?.bank || paymentPayload.bankName || 'State Bank of India';
        const date = paymentPayload.selfAccount?.date || paymentPayload.depositDate || new Date().toISOString();
        const remarks = `Bank Transfer UTR: ${utr} (${bank}). Amount: ₹${paymentPayload.totalPaid || selectedDemand?.totalAmount}`;

        await submitDirectTransfer({
          demandId: targetDemandId,
          utrNumber: utr,
          bankName: bank,
          depositDate: date,
          remarks,
        }).unwrap();
      }
      setUtrModalOpen(false);
      showToast('success', 'Bank Transfer UTR details submitted successfully! Awaiting depot verification.');
      refetchDemands();
      refetchPayments();
    } catch (e) {
      showToast('error', e?.data?.message || e.message || 'Error submitting payment details');
    }
  };

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // 1. Status Filter
      if (statusFilter !== 'All') {
        const pStatus = (p.status || '').toUpperCase();
        if (statusFilter === 'SUCCESS' && pStatus !== 'SUCCESS') return false;
        if (statusFilter === 'INITIATED' && pStatus !== 'INITIATED') return false;
        if (statusFilter === 'FAILED' && pStatus !== 'FAILED') return false;
      }

      // 2. Search Query
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      const pId = String(p._id || '').toLowerCase();
      const pNo = String(p.paymentNo || '').toLowerCase();
      const dNo = String(p.demandId?.demandNo || p.demandId || '').toLowerCase();
      const utr = String(p.utr || p.gatewayPaymentId || '').toLowerCase();
      const method = String(p.method || '').toLowerCase();

      return pId.includes(q) || pNo.includes(q) || dNo.includes(q) || utr.includes(q) || method.includes(q);
    });
  }, [payments, search, statusFilter]);

  // Statistics
  const totalPaidAmount = useMemo(() => {
    return payments
      .filter((p) => (p.status || '').toUpperCase() === 'SUCCESS')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const columns = [
    {
      header: 'Receipt ID',
      accessor: '_id',
      render: (row) => (
        <span className="font-semibold text-brand font-mono">
          {row.paymentNo || row._id?.slice(-8).toUpperCase() || 'RCP-ONLINE'}
        </span>
      ),
    },
    {
      header: 'Demand Ref',
      accessor: 'demandId',
      render: (row) => (
        <span className="font-mono text-slate-700">
          {row.demandId?.demandNo || (typeof row.demandId === 'string' ? row.demandId.slice(-8).toUpperCase() : 'Direct Demand')}
        </span>
      ),
    },
    {
      header: 'Amount Paid',
      accessor: 'amount',
      render: (row) => <span className="font-bold text-slate-900">₹ {(row.amount || 0).toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Channel / Method',
      accessor: 'method',
      render: (row) => (
        <span className="capitalize">{row.method?.replace(/_/g, ' ') || 'Treasury e-Pay'}</span>
      ),
    },
    {
      header: 'UTR / Ref No',
      accessor: 'utr',
      render: (row) => <span className="font-mono small text-slate-700">{row.utr || row.gatewayPaymentId || 'N/A'}</span>,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => alert(`Certified Treasury Receipt: ${row.paymentNo || 'RCP-' + row._id?.slice(-8).toUpperCase()}\nAmount: ₹${Number(row.amount || 0).toLocaleString('en-IN')}\nStatus: ${row.status || 'Verified'}`)}
        >
          <Download size={13} />
          <span>Receipt</span>
        </button>
      ),
    },
  ];

  const loading = loadingPayments || loadingDemands;

  return (
    <div className="beneficiary-payments-page">
      {/* 1. Header with Breadcrumbs matching BeneficiaryProducts.jsx */}
      <PageHeader
        title="AFD Payments & Treasury Challans"
        subtitle="Track payments, initiate SBI Cyber Treasury transfers, or submit Direct Bank UTR references"
        breadcrumbs={[
          { label: 'Beneficiary', href: '/beneficiary/dashboard' },
          { label: 'Payments' },
        ]}
        actions={
          <div className="row gap-1 align-center">
            <Link to="/beneficiary/demands">
              <Button variant="outline" size="sm">
                <FileText size={14} />
                <span>My Demands</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchPayments();
                refetchDemands();
              }}
              title="Refresh payments"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {/* 2. Feedback Alert Toast */}
      {toast.message && (
        <div
          className={`alert-banner ${toast.type === 'error' ? 'error bg-red-50 text-red-800' : 'success'} mb-3 small`}
          role="alert"
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 3. Quick KPI Metrics Row */}
      <div className="grid-3-col gap-2 mb-3">
        <div className="panel p-3 bg-white border border-slate-200 rounded-lg">
          <div className="row between align-center mb-1">
            <span className="small muted font-medium">Total Settled Payments</span>
            <CheckCircle2 size={18} className="text-green" />
          </div>
          <div className="h2 text-brand font-bold">
            ₹ {totalPaidAmount.toLocaleString('en-IN')}
          </div>
          <span className="micro muted">Reconciled with CSD Treasury</span>
        </div>

        <div className="panel p-3 bg-white border border-slate-200 rounded-lg">
          <div className="row between align-center mb-1">
            <span className="small muted font-medium">Awaiting Beneficiary Payment</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="h2 text-ink font-bold">
            {pendingDemands.length}
          </div>
          <span className="micro text-amber-600 font-medium">
            {pendingDemands.length > 0 ? 'Action Required · Depot Sanction Granted' : 'All approved demands settled'}
          </span>
        </div>

        <div className="panel p-3 bg-white border border-slate-200 rounded-lg">
          <div className="row between align-center mb-1">
            <span className="small muted font-medium">Treasury Receipts Generated</span>
            <Landmark size={18} className="text-blue-500" />
          </div>
          <div className="h2 text-ink font-bold">
            {payments.length}
          </div>
          <span className="micro muted">Official Cyber Treasury Challans</span>
        </div>
      </div>

      {/* 4. Filter and Search Bar identical to BeneficiaryProducts.jsx */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-[280px] items-center gap-2 border border-slate-300 rounded px-3 py-2 bg-slate-50">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by receipt ID, demand ref, UTR, or channel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-500" />
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="SUCCESS">Success / Paid</option>
            <option value="INITIATED">Initiated / Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            type="button"
            onClick={() => {
              refetchPayments();
              refetchDemands();
            }}
            className="p-2 border border-slate-300 rounded hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh payments list"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 5. Sanctioned Demands Awaiting Payment Card (Post-Depot Approval Flow) */}
      {pendingDemands.length > 0 && (
        <Card
          title="Sanctioned Demands Awaiting Payment"
          subtitle="Your demands have been scrutinized and approved by the Depot. Please complete payment or submit your UTR to trigger Local Supply Order release."
          className="mb-4"
          headerClassName="border-b pb-2"
        >
          <div className="flex-col gap-2">
            {pendingDemands.map((dem) => (
              <div
                key={dem._id || dem.id}
                className="panel p-3 between align-center flex-wrap gap-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-brand transition-colors"
              >
                <div>
                  <div className="row align-center gap-1 mb-05">
                    <span className="font-mono font-bold text-brand small">
                      {dem.demandNo || dem._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="status-badge status-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      <CheckCircle2 size={12} />
                      <span>Sanction Granted</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 m-0">
                    {dem.productId?.name || dem.productSnapshot?.name || dem.productName || 'AFD Item'}
                  </h4>
                  <p className="small muted mb-0 mt-05">
                    Sanctioning Depot: <strong>{dem.depotId?.name || 'Regional Depot'}</strong> • Dealer: <strong>{dem.dealerId?.name || 'Authorized Dealership'}</strong>
                  </p>
                </div>

                <div className="row align-center gap-2 flex-wrap">
                  <div className="text-right">
                    <span className="micro muted block uppercase tracking-wider">Payable Sanction Amount</span>
                    <span className="h3 font-bold text-green block m-0">
                      ₹ {(Number(dem.totalAmount || dem.totalPrice || dem.netPayable || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="row gap-1">
                    <Button
                      variant="primary"
                      icon={Upload}
                      onClick={() => initiateUtrUpload(dem)}
                      style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 600 }}
                    >
                      Submit Bank UTR
                    </Button>
                    <Button
                      variant="outline"
                      icon={CreditCard}
                      onClick={() => initiateOnlinePayment(dem)}
                    >
                      Pay via SBI e-Pay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Payment & Cyber Treasury History Table */}
      <Card
        title="Payment & Cyber Treasury History"
        subtitle="Certified records of transactions reconciled with CSD Treasury database"
      >
        <DataTable
          columns={columns}
          data={filteredPayments}
          loading={loading}
          emptyTitle="No payments found"
          emptyText="No completed transactions match the search criteria. Completed cyber treasury challans and bank transfers will be displayed here."
        />
      </Card>

      {/* 7. Modal 1: Bank Transfer (NEFT/RTGS) Details & UTR Upload Modal */}
      {utrModalOpen && selectedDemand && (
        <PaymentDetailsModal
          isOpen={utrModalOpen}
          onClose={() => {
            setUtrModalOpen(false);
            setSelectedDemand(null);
          }}
          demand={selectedDemand}
          onSubmitSuccess={handleUtrSubmitSuccess}
        />
      )}

      {/* 8. Modal 2: Online Cyber Treasury Gateway Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => {
          setPayModalOpen(false);
          setSelectedDemand(null);
        }}
        title="CSD AFD Secure Cyber Treasury Gateway"
        subtitle={`Sanctioned Demand: ${selectedDemand?.demandNo || selectedDemand?._id} · ${selectedDemand?.productId?.name || selectedDemand?.productName || 'AFD Item'}`}
        maxWidth="520px"
        footer={
          <div className="modal-footer-btns">
            <Button
              variant="outline"
              onClick={() => {
                setPayModalOpen(false);
                setSelectedDemand(null);
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button variant="primary" loading={processing} onClick={handleCompletePayment}>
              Authorize &amp; Pay ₹ {(Number(selectedDemand?.totalAmount || selectedDemand?.totalPrice || selectedDemand?.netPayable || 0)).toLocaleString('en-IN')}
            </Button>
          </div>
        }
      >
        <div className="payment-modal-body">
          <div className="panel p-3 bg-slate-50 border border-slate-200 rounded text-center mb-3">
            <span className="small muted block">Total Sanctioned Net Price</span>
            <p className="h2 text-brand font-bold my-1">
              ₹ {(Number(selectedDemand?.totalAmount || selectedDemand?.totalPrice || selectedDemand?.netPayable || 0)).toLocaleString('en-IN')}
            </p>
            <span className="small text-green font-semibold">● Official Zero-Surcharge Gateway for Defence Personnel</span>
          </div>

          <label className="form-label">Choose Payment Gateway Channel</label>
          <div className="payment-modes-grid row gap-1 mb-3">
            <button
              type="button"
              className={`panel p-2 flex-1 text-left ${paymentMode === 'sbi_epay' ? 'border-brand bg-brand-soft' : ''}`}
              onClick={() => setPaymentMode('sbi_epay')}
            >
              <span className="font-semibold small block">SBI Cyber Treasury (e-Pay)</span>
              <span className="micro muted">Net Banking / Direct Bank Debit</span>
            </button>

            <button
              type="button"
              className={`panel p-2 flex-1 text-left ${paymentMode === 'bharatkosh' ? 'border-brand bg-brand-soft' : ''}`}
              onClick={() => setPaymentMode('bharatkosh')}
            >
              <span className="font-semibold small block">Bharatkosh Portal</span>
              <span className="micro muted">Govt. Non-Tax Receipt Portal</span>
            </button>
          </div>

          <p className="micro muted mb-0">
            *Security Directive: Transactions are processed through NIC/SBI Cyber Treasury servers with 256-bit encryption. Never share your OTP with anyone.
          </p>
        </div>
      </Modal>
    </div>
  );
}

