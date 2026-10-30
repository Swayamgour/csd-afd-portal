import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Truck,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  Building,
  Store,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import { LoadingState, EmptyState } from '../../components/common/States.jsx';
import { useGetDemandByIdQuery, useCancelDemandMutation } from '../demand/demandApi.js';
import { useSubmitDirectTransferMutation } from '../payment/paymentApi.js';
import InlinePaymentCard from '../../components/common/InlinePaymentCard.jsx';
import { getErrorMessage } from '../../utils/apiError.js';

export default function BeneficiaryDemandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('Beneficiary request');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const {
    data: demandData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDemandByIdQuery(id);

  const [cancelDemandMutation, { isLoading: isCancelling }] = useCancelDemandMutation();
  const [submitDirectTransfer] = useSubmitDirectTransferMutation();

  const demand = demandData?.data || demandData;

  const handlePaymentSubmitSuccess = async (paymentPayload) => {
    try {
      if (paymentPayload && (paymentPayload.selfAccount?.utr || paymentPayload.utrNumber)) {
        const targetDemandId = demand._id || demand.id;
        const utr = paymentPayload.selfAccount?.utr || paymentPayload.utrNumber;
        const bank = paymentPayload.selfAccount?.bank || paymentPayload.bankName || 'State Bank of India';
        const date = paymentPayload.selfAccount?.date || paymentPayload.depositDate || new Date().toISOString();
        const remarks = `Bank Transfer UTR: ${utr} (${bank}). Amount: ₹${paymentPayload.totalPaid || demand.totalAmount}`;

        await submitDirectTransfer({
          demandId: targetDemandId,
          utrNumber: utr,
          bankName: bank,
          depositDate: date,
          remarks,
        }).unwrap();
      }
      setShowPaymentForm(false);
      showToast('success', 'Payment details / UTR submitted successfully! Awaiting depot verification.');
      refetch();
    } catch (e) {
      showToast('error', e?.data?.message || e.message || 'Error submitting payment details');
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const handleCancel = async () => {
    try {
      await cancelDemandMutation({ id, reason: cancelReason }).unwrap();
      setCancelModalOpen(false);
      showToast('success', 'Demand has been cancelled successfully.');
      refetch();
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to cancel demand.'));
    }
  };

  if (isLoading) return <LoadingState message="Retrieving demand details from CSD database..." />;

  if (isError || !demand) {
    return (
      <EmptyState
        title="Demand Not Found"
        message={getErrorMessage(error, `The demand ${id} could not be located in records.`)}
        action={
          <Link to="/beneficiary/demands" className="btn btn-primary">
            Back to Demands
          </Link>
        }
      />
    );
  }

  const normStatus = (demand.status || '').toUpperCase();
  const isApprovedAndPayable =
    ['APPROVED', 'PAYMENT_PENDING', 'ON HOLD'].includes(normStatus) &&
    demand.paymentStatus !== 'PAID';
  const isAwaitingDepotApproval = normStatus === 'CREATED';

  const product = demand.productId || {};
  const depot = demand.depotId || {};
  const dealer = demand.dealerId || {};
  const urc = demand.urcId || {};

  // Status mapping for milestone timeline
  const timelineItems = (demand.statusHistory && demand.statusHistory.length > 0)
    ? demand.statusHistory.map((h, i) => ({
        step: h.status?.replace(/_/g, ' '),
        date: new Date(h.changedAt || h.at || demand.createdAt).toLocaleDateString('en-IN'),
        status: i === demand.statusHistory.length - 1 ? 'current' : 'completed',
        note: h.comment || h.remarks || 'Status update logged',
      }))
    : [
        {
          step: 'Demand Created',
          date: new Date(demand.createdAt).toLocaleDateString('en-IN'),
          status: 'completed',
          note: `Demand No: ${demand.demandNo || demand._id}`,
        },
        {
          step: 'Treasury Payment',
          date: demand.status === 'PAID' ? 'Verified' : 'Pending',
          status: demand.status === 'PAID' ? 'completed' : isPaymentPending ? 'current' : 'pending',
          note: demand.status === 'PAID' ? 'Payment verified & recorded' : 'Awaiting payment confirmation',
        },
        {
          step: 'Depot Allocation & Supply Order',
          date: demand.supplyOrderNo ? 'Issued' : 'Pending',
          status: demand.supplyOrderNo ? 'completed' : 'pending',
          note: demand.supplyOrderNo || 'Pending on regional depot',
        },
        {
          step: 'Dealer Handover & Delivery',
          date: demand.status === 'DELIVERED' ? 'Completed' : 'Pending',
          status: demand.status === 'DELIVERED' ? 'completed' : 'pending',
          note: 'Final physical delivery',
        },
      ];

  return (
    <div className="demand-detail-page">
      <div className="mb-2">
        <Link to="/beneficiary/demands" className="row align-center gap-1 link small font-semibold">
          <ArrowLeft size={16} />
          Back to All Demands
        </Link>
      </div>

      <PageHeader
        title={`Demand Details · ${demand.demandNo || demand._id?.slice(-8).toUpperCase()}`}
        subtitle={`Submitted on ${new Date(demand.createdAt).toLocaleDateString('en-IN')}`}
        badge={<StatusBadge status={demand.status} />}
        actions={
          <div className="row gap-1 align-center">
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh">
              <RefreshCw size={14} />
            </Button>
            {isApprovedAndPayable && (
              <Button
                variant="primary"
                icon={CreditCard}
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 700 }}
              >
                {demand.paymentStatus === 'PENDING_VERIFICATION' ? 'Update Payment UTR' : 'Pay Now / Submit Bank UTR'}
              </Button>
            )}
            {isAwaitingDepotApproval && (
              <span
                className="checkout-spec-pill"
                style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '11px', padding: '6px 10px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Payment link opens once Depot approves this demand"
              >
                <Clock size={12} /> Under Scrutiny (Payment Unlocks Post-Sanction)
              </span>
            )}
            {demand.status !== 'CANCELLED' && demand.status !== 'DELIVERED' && demand.status !== 'REJECTED' && (
              <Button
                variant="ghost"
                className="text-danger"
                icon={XCircle}
                onClick={() => setShowCancelPrompt(!showCancelPrompt)}
              >
                Cancel Demand
              </Button>
            )}
          </div>
        }
      />

      {/* Inline Cancellation Confirmation Banner */}
      {showCancelPrompt && (
        <div className="alert-banner error mb-3 p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
          <div>
            <strong className="text-red-900 block">Are you sure you want to cancel Demand {demand.demandNo || demand._id}?</strong>
            <p className="text-xs text-red-700 m-0 mt-0.5">This will withdraw the vehicle allocation from the regional depot. This operation cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCancelPrompt(false)}>
              Keep Demand
            </Button>
            <Button variant="danger" size="sm" loading={isCancelling} onClick={handleCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      )}

      {/* Inline Payment Submission Card */}
      {showPaymentForm && (
        <div className="mb-4">
          <InlinePaymentCard
            demand={demand}
            onCancel={() => setShowPaymentForm(false)}
            onPaymentSubmitted={() => {
              setShowPaymentForm(false);
              refetch();
            }}
          />
        </div>
      )}

      {toast.message && (
        <div
          className={`alert-banner ${toast.type === 'error' ? 'error bg-red-50 text-red-800' : 'success'} mb-2 small`}
          role="alert"
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Stage Alert Banners */}
      {isAwaitingDepotApproval && (
        <div className="alert-banner info mb-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', padding: '12px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#2563eb" className="flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '13px' }}>Demand Under Scrutiny by Sanctioning Depot (Pre-Payment Stage)</strong>
            <span style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px', display: 'block' }}>
              This demand was lodged directly without upfront payment. Depot Officials are verifying your documents and quota limits. Once approved, the payment button will be unlocked right here to allow online payment or UTR upload.
            </span>
          </div>
        </div>
      )}

      {isApprovedAndPayable && demand.paymentStatus !== 'PENDING_VERIFICATION' && (
        <div className="alert-banner success mb-3" style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#065f46', padding: '12px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} color="#16a34a" className="flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '13px', color: '#15803d' }}>✓ Demand Approved by Depot! Payment Unlocked</strong>
            <span style={{ fontSize: '12px', color: '#166534', marginTop: '2px', display: 'block' }}>
              Your demand has received Depot Sanction. Please complete payment via Direct Bank Transfer (NEFT/RTGS) and submit your UTR reference number.
            </span>
          </div>
          <Button
            variant="primary"
            icon={CreditCard}
            size="sm"
            onClick={() => setShowPaymentForm(true)}
            style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 700, flexShrink: 0 }}
          >
            Pay Now / Submit UTR
          </Button>
        </div>
      )}

      {demand.paymentStatus === 'PENDING_VERIFICATION' && (
        <div className="alert-banner info mb-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', padding: '12px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#2563eb" className="flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '13px' }}>Payment Reference (UTR) Submitted — Awaiting Depot Finance Verification</strong>
            <span style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px', display: 'block' }}>
              Your transaction details have been received. Once the Depot Finance Officer confirms the funds, your Local Supply Order will be issued and handed over to URC for delivery.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Left details & Right timeline */}
      <div className="grid-2-col gap-2 mb-3">
        {/* Left Column: Vehicle & Financial Breakdown */}
        <div className="left-col-stack flex-col gap-2">
          <Card title="Vehicle & Entitlement Summary">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Product Item:</span>
                <span className="font-semibold">{product.name || demand.productName || 'AFD Item'}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">AFD Category:</span>
                <span className="text-uppercase font-medium">{product.afdType || 'AFD-I'}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Quantity:</span>
                <span>{demand.quantity || 1} Unit</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Selected Colour:</span>
                <span>{demand.selectedColor || 'Standard'}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">SKU / Index:</span>
                <span className="font-mono">{product.sku || 'N/A'}</span>
              </div>
            </div>
          </Card>

          <Card title="Price & Financial Breakdown">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Base Concession Price:</span>
                <span>₹ {(demand.basePrice || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Applicable Tax & Levies:</span>
                <span>₹ {(demand.taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Total Sanction Amount:</span>
                <span className="h4 text-brand mb-0">
                  ₹ {(demand.totalPrice || demand.netPayable || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {demand.loan?.isLoan && (
                <>
                  <div className="kv-row between small py-1 border-bottom">
                    <span className="muted">Bank Loan Component:</span>
                    <span className="font-semibold text-blue-800">
                      ₹ {(demand.loan.loanAmount || 0).toLocaleString('en-IN')} ({demand.loan.bankName || 'Bank'})
                    </span>
                  </div>
                  <div className="kv-row between small py-1 border-bottom">
                    <span className="muted">Net Self-Transfer:</span>
                    <span className="font-semibold text-slate-800">
                      ₹ {((demand.totalPrice || 0) - (demand.loan.loanAmount || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}
              <div className="kv-row between small py-1">
                <span className="muted">Payment Status:</span>
                <span className={`font-semibold ${demand.status === 'PAID' ? 'text-green' : 'text-saffron'}`}>
                  ● {demand.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Regional Allocation">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted row align-center gap-1">
                  <Building size={14} /> Regional Depot:
                </span>
                <span className="font-medium">{depot.name || 'Assigned Depot'} ({depot.city || depot.code || ''})</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted row align-center gap-1">
                  <Store size={14} /> Authorized Dealer:
                </span>
                <span className="font-medium">{dealer.name || 'Assigned Dealer'}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted row align-center gap-1">
                  <Store size={14} /> Serving URC:
                </span>
                <span className="font-medium">{urc.name || 'Serving Canteen'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Status Timeline & Actions */}
        <div className="right-col-stack flex-col gap-2">
          <Card title="Application Tracking Timeline" subtitle="CSD Depot Milestone Status">
            <Timeline items={timelineItems} />
          </Card>

          {demand.remarks && (
            <Card title="Official Remarks / Notes">
              <p className="text-sm text-slate-700 m-0">{demand.remarks}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
