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
import InlinePaymentCard from '../../components/common/InlinePaymentCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
} from '../payment/paymentApi.js';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { openRazorpayCheckout } from '../../utils/razorpay.js';
import { paymentMethodLabel } from '../../utils/demandStatus.js';
import { isPayable, demandAmount } from '../../utils/demandStatus.js';

export default function BeneficiaryPayments() {
  const { user } = useAuth();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [utrModalOpen, setUtrModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
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

  const payments = paymentsData?.items || [];
  const allDemands = demandsData?.items || [];

  // Demands on hold that still need payment (online, or direct bank transfer with receipt)
  const pendingDemands = allDemands.filter(isPayable);
  const isLoanDemand = (d) => Boolean(d?.loan?.isLoan);

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
      const id = selectedDemand._id || selectedDemand.id;
      const init = await createPayment({ demandId: id }).unwrap();
      const resp = await openRazorpayCheckout({
        checkout: init.checkout,
        prefill: { name: user?.name, email: user?.email, contact: user?.mobile },
      });
      await verifyPayment({
        demandId: id,
        paymentNo: init.paymentNo,
        gatewayOrderId: resp.razorpay_order_id || init.gatewayOrderId,
        gatewayPaymentId: resp.razorpay_payment_id,
        gatewaySignature: resp.razorpay_signature,
      }).unwrap();

      setPayModalOpen(false);
      setSelectedDemand(null);
      showToast('success', 'Payment successful. The depot will now verify it.');
    } catch (err) {
      showToast('error', getErrorMessage(err, err?.message || 'Failed to complete payment.'));
    } finally {
      setProcessing(false);
      refetchPayments();
      refetchDemands();
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
      header: 'Payment ID',
      accessor: '_id',
      render: (row) => (
        <span className="font-semibold text-brand font-mono">
          {row.paymentNo || row._id?.slice(-8).toUpperCase() || 'RCP-ONLINE'}
        </span>
      ),
    },
    {
      header: 'Demand',
      accessor: 'demandId',
      render: (row) => (
        <span className="font-mono text-slate-700">
          {row.demandId?.demandNo || (typeof row.demandId === 'string' ? row.demandId.slice(-8).toUpperCase() : 'Direct Demand')}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => <span className="font-bold text-slate-900">₹ {(row.amount || 0).toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Method',
      accessor: 'method',
      render: (row) => (
        <span>{paymentMethodLabel(row.method)}</span>
      ),
    },
    {
      header: 'UTR / reference',
      accessor: 'utr',
      render: (row) => <span className="font-mono small text-slate-700">{row.transferDetails?.self?.utrNumber || row.utr || row.gatewayTxnId || row.gatewayPaymentId || '—'}</span>,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status === 'INITIATED' ? 'PENDING' : row.status === 'SUCCESS' ? 'VERIFIED' : row.status} />,
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (row) => (
        row.transferDetails?.receiptUrl ? (
          <a className="btn sm out" href={row.transferDetails.receiptUrl} target="_blank" rel="noreferrer">
            <Download size={13} />
            <span>View receipt</span>
          </a>
        ) : (
          <span className="muted small">—</span>
        )
      ),
    },
  ];

  const loading = loadingPayments || loadingDemands;

  return (
    <div className="beneficiary-payments-page">
      {/* 1. Header with Breadcrumbs matching BeneficiaryProducts.jsx */}
      <PageHeader
        title="Payments"
        subtitle="Pay for demands approved by the depot and track every payment you have made."
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
          <span className="micro muted">Verified by the depot</span>
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
            <span className="small muted font-medium">Payments made</span>
            <Landmark size={18} className="text-blue-500" />
          </div>
          <div className="h2 text-ink font-bold">
            {payments.length}
          </div>
          <span className="micro muted">All payment records</span>
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
          title="Approved Demands Awaiting Payment"
          subtitle="The depot has approved these demands. Pay online, or transfer by NEFT/RTGS and upload the receipt; the depot will then verify the payment and issue the Supply Order."
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
                      <span>Approved</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 m-0">
                    {dem.productId?.name || dem.productSnapshot?.name || dem.productName || 'AFD Item'}
                  </h4>
                  <p className="small muted mb-0 mt-05">
                    Depot: <strong>{dem.depotId?.name || 'Regional Depot'}</strong> • Dealer: <strong>{dem.dealerId?.name || 'Authorized Dealership'}</strong>
                  </p>
                </div>

                <div className="row align-center gap-2 flex-wrap">
                  <div className="text-right">
                    <span className="micro muted block uppercase tracking-wider">Net Amount Payable</span>
                    <span className="h3 font-bold text-green block m-0">
                      ₹ {demandAmount(dem).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="row gap-1">
                    <Button
                      variant="primary"
                      icon={Upload}
                      onClick={() => initiateUtrUpload(dem)}
                      style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 600 }}
                    >
                      Bank Transfer Details
                    </Button>
                    {!isLoanDemand(dem) && (
                      <Button
                        variant="outline"
                        icon={CreditCard}
                        onClick={() => initiateOnlinePayment(dem)}
                      >
                        Pay Online
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Payment & Cyber Treasury History Table */}
      <Card
        title="Payment history"
        subtitle="Bank transfers and online payments for your demands"
      >
        <DataTable
          columns={columns}
          data={filteredPayments}
          loading={loading}
          emptyTitle="No payments yet"
          emptyText="Payments you make for approved demands will be listed here."
        />
      </Card>

      {/* 7. Inline Section: Bank Transfer (NEFT/RTGS) Details & UTR Upload */}
      {utrModalOpen && selectedDemand && (
        <div className="mt-4">
          <InlinePaymentCard
            demand={selectedDemand}
            onCancel={() => {
              setUtrModalOpen(false);
              setSelectedDemand(null);
            }}
            onPaymentSubmitted={() => {
              setUtrModalOpen(false);
              setSelectedDemand(null);
              showToast('success', 'Bank transfer details submitted. The depot will now verify the payment.');
              refetchDemands();
              refetchPayments();
            }}
          />
        </div>
      )}

      {/* 8. Inline Section: Online Cyber Treasury Gateway */}
      {payModalOpen && selectedDemand && (
        <Card
          className="mt-4 border-2 border-brand"
          title="Online Payment (Razorpay)"
          subtitle={`Demand: ${selectedDemand?.demandNo || selectedDemand?._id} · ${selectedDemand?.productId?.name || selectedDemand?.productName || 'AFD Item'}`}
          headerActions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPayModalOpen(false);
                setSelectedDemand(null);
              }}
              disabled={processing}
            >
              Cancel
            </Button>
          }
        >
          <div className="payment-modal-body">
            <div className="panel p-3 bg-slate-50 border border-slate-200 rounded text-center mb-3">
              <span className="small muted block">Net Amount Payable</span>
              <p className="h2 text-brand font-bold my-1">
                ₹ {demandAmount(selectedDemand).toLocaleString('en-IN')}
              </p>
              
            </div>

            <p className="micro muted mb-3">
              Payment is processed securely by Razorpay. Never share your OTP with anyone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t">
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
                Authorize &amp; Pay ₹ {demandAmount(selectedDemand).toLocaleString('en-IN')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

