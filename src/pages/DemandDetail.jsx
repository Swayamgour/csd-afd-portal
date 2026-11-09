import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building,
  Store,
  MapPin,
  CreditCard,
  User,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  AlertCircle,
  Truck,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  Check,
  XCircle,
  Landmark,
  BadgeCheck,
  Lock
} from 'lucide-react';
import { useGetDemandByIdQuery } from '../features/demand/demandApi.js';
import { useSubmitDirectTransferMutation } from '../features/payment/paymentApi.js';
import InlinePaymentCard from '../components/common/InlinePaymentCard.jsx';
import { isPayable, getStatusLabel, isAwaitingDepotApproval, paymentMethodLabel, paymentStatusLabel } from '../utils/demandStatus.js';

export default function DemandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: demandData,
    isLoading: loading,
    isError,
    error,
    refetch: fetchDemand,
  } = useGetDemandByIdQuery(id);

  const [submitDirectTransfer] = useSubmitDirectTransferMutation();
  const demand = demandData?.data || demandData;

  // Inline payment form toggle
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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
      fetchDemand();
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error submitting payment details');
    }
  };

  if (loading) {
    return (
      <div className="demand-loading-box">
        <Clock size={36} className="spin portal-spinner-icon" />
        <h2 className="portal-loading-title">Loading demand details...</h2>
      </div>
    );
  }

  if (error || !demand) {
    return (
      <div className="portal-card-state-error">
        <AlertCircle size={48} className="portal-error-icon" />
        <h2 className="portal-error-title">Demand Not Found</h2>
        <p className="portal-error-desc">The requested demand could not be located in the CSD database.</p>
        <Link to="/demands" className="btn btn-primary portal-btn-inline">
          Back to Demands
        </Link>
      </div>
    );
  }

  const demandId = demand.demandNo || demand._id;
  const beneficiary = demand.beneficiaryId || {};
  const dealer = demand.dealerId || {};
  const depot = demand.depotId || {};
  const urc = demand.urcId || {};
  const product = demand.productId || {};
  const snapshot = demand.productSnapshot || {};

  const netAmount = demand.totalAmount || demand.unitPrice || 0;
  const paymentsList = demand.payments || [];

  // Canonical lifecycle steps matching Depot Approval before Payment
  const canonicalTimeline = [
    { key: 'CREATED', label: '1. Demand Lodged', sub: 'Demand lodged with documents; depot scrutiny pending' },
    { key: 'APPROVED', label: '2. Depot Approval', sub: 'Approved by depot — payment enabled' },
    { key: 'PROCESSING', label: '3. Payment & Depot Verification', sub: 'Payment made; depot verifies it and prepares Supply Order' },
    { key: 'SUPPLY_ORDER_ISSUED', label: '4. Supply Order Issued (URC)', sub: 'Supply Order handed over to URC' },
    { key: 'COMPLETED', label: '5. Delivery Completed', sub: 'Item delivered to beneficiary' },
  ];

  const statusOrder = ['CREATED', 'APPROVED', 'PAYMENT_PENDING', 'PROCESSING', 'SUPPLY_ORDER_ISSUED', 'COMPLETED'];

  const currentStatus = (demand.status || 'CREATED').toUpperCase();
  const stepKey = currentStatus === 'PAYMENT_PENDING' ? 'APPROVED' : ['PAID', 'DEPOT_PROCESSING', 'DEALER_VERIFICATION'].includes(currentStatus) ? 'PROCESSING' : currentStatus;
  const currentStepIndex = Math.max(0, canonicalTimeline.findIndex((st) => st.key === stepKey));
  const isTerminated = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED' || currentStatus === 'EXPIRED';

  const normStatus = (demand.status || '').toUpperCase();
  // Payment is open while the demand is on hold and unpaid (manual: payment comes before the depot sees the demand)
  const canMakePayment = !isTerminated && isPayable(demand);

  return (
    <div className="demand-detail-container">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="checkout-breadcrumb-nav">
        <ol className="checkout-breadcrumb-list">
          <li><Link to="/" className="checkout-breadcrumb-link">Home</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><Link to="/demands" className="checkout-breadcrumb-link">Demands</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><span aria-current="page" className="checkout-breadcrumb-active">{demandId}</span></li>
        </ol>
      </nav>

      {/* Top Header Card */}
      <div className="demand-detail-header-card">
        <div>
          <div className="flex-align-center-gap-sm">
            <Link to="/demands" className="checkout-breadcrumb-link" title="Back to demands">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="checkout-page-heading m-0">
              Demand #{demandId}
            </h1>
            <span className={`checkout-spec-pill ${
              ['SUPPLY_ORDER_ISSUED', 'COMPLETED'].includes(currentStatus)
                ? 'badge-verified-pill'
                : isTerminated
                ? 'status-onhold text-danger'
                : currentStatus === 'CREATED'
                ? 'status-onhold'
                : 'status-processing'
            }`}>
              {getStatusLabel(demand).toUpperCase()}
            </span>
          </div>
          <div className="csd-form-helper-text mt-xs">
            Date of Booking: <strong>{new Date(demand.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong> • Beneficiary: <strong>{beneficiary.fullName || beneficiary.name || 'Verified Beneficiary'}</strong>
          </div>
        </div>

        <div className="portal-flex-wrap-gap-xs">
          {canMakePayment && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="btn-action-upload-details flex-align-center-gap-xs"
              style={{ fontWeight: 700, background: '#16a34a', color: '#fff', border: '1px solid #15803d', padding: '0.6rem 1.2rem', cursor: 'pointer' }}
            >
              <CreditCard size={16} />
              Pay Now / Submit Bank Transfer
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="btn-secondary-action flex-align-center-gap-xs"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Workflow Phase Notification Banners */}
      {isAwaitingDepotApproval(demand) && (
        <div className="csd-alert-banner info mb-4">
          <Clock size={20} className="alert-banner-icon" color="#1e4fd8" />
          <div>
            <strong>Pending depot approval</strong>
            <p className="mb-0 text-xs">The depot is verifying your documents and entitlement. The payment button will be enabled here once the demand is approved.</p>
          </div>
        </div>
      )}

      {canMakePayment && demand.paymentStatus !== 'PENDING_VERIFICATION' && (
        <div className="csd-alert-banner warning mb-4" style={{ background: '#ecfdf5', borderColor: '#86efac' }}>
          <CheckCircle2 size={20} className="alert-banner-icon" color="#15803d" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#15803d' }}>Approved by Depot — payment enabled</strong>
            <p className="mb-0 text-xs" style={{ color: '#166534', marginTop: '2px' }}>
              Your demand is approved by the depot. Pay by Direct Bank Transfer (NEFT/RTGS) with receipt upload, or pay online if no loan is taken. The depot will then verify the payment and issue the Supply Order.
            </p>
          </div>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="btn-primary-action flex-align-center-gap-xs"
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
          >
            <CreditCard size={15} />
            {showPaymentForm ? 'Hide Payment Form' : 'Submit Bank Transfer'}
          </button>
        </div>
      )}

      {showPaymentForm && (
        <div className="mb-4">
          <InlinePaymentCard
            demand={demand}
            onCancel={() => setShowPaymentForm(false)}
            onPaymentSubmitted={() => {
              setShowPaymentForm(false);
              fetchDemand();
            }}
          />
        </div>
      )}

      {demand.paymentStatus === 'PENDING_VERIFICATION' && (
        <div className="csd-alert-banner info mb-4">
          <Clock size={20} className="alert-banner-icon" color="#1e4fd8" />
          <div>
            <strong>Payment Reference (UTR) Submitted — Awaiting Depot Finance Verification</strong>
            <p className="mb-0 text-xs">
              Your transaction details have been received and submitted for Official CSD Receipt verification. Once the Depot Finance Officer confirms the funds, your Local Supply Order will be issued and handed over to URC for delivery.
            </p>
          </div>
        </div>
      )}

      {/* Termination Notice if Cancelled / Rejected */}
      {isTerminated && (
        <div className="csd-alert-banner danger mb-4">
          <XCircle size={20} className="alert-banner-icon" />
          <div>
            <strong>Demand {currentStatus}</strong>
            <p className="mb-0 text-xs">This demand cannot proceed further. Reason: {demand.remarks || 'Terminated per CSD administrative rules.'}</p>
          </div>
        </div>
      )}

      {/* Demand Status Timeline */}
      <div className="checkout-card mb-4">
        <h2 className="checkout-card-title mb-md">
          <Clock size={18} color="var(--brand)" />
          <span>Demand Status Timeline</span>
        </h2>

        <div className="demand-timeline-grid">
          {canonicalTimeline.map((st, idx) => {
            const isCompleted = !isTerminated && idx < currentStepIndex;
            const isCurrent = !isTerminated && (st.key === currentStatus || (idx === currentStepIndex));

            return (
              <div
                key={st.key}
                className={`timeline-step-card ${isCurrent ? 'is-current' : isCompleted ? 'is-completed' : ''}`}
              >
                <div className="timeline-step-header">
                  <div
                    className={`checkout-step-badge checkout-step-badge-sm ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                  >
                    {isCompleted ? <CheckCircle2 size={15} /> : idx + 1}
                  </div>
                  <div className={`timeline-step-title ${isCurrent ? 'is-current' : isCompleted ? 'is-completed' : 'is-upcoming'}`}>
                    {st.label}
                  </div>
                </div>
                <div className="csd-form-helper-text timeline-step-desc">
                  {st.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Canonical Sections */}
      <div className="checkout-form-row-2">

        {/* 1. Product Information */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <Truck size={17} color="#1e4fd8" />
            <span>1. Product Information</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Vehicle / Item Name</div>
              <div className="beneficiary-field-value">{product.name || snapshot.name || 'CSD AFD Product'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">SKU / Index No</div>
              <div className="beneficiary-field-value">{product.sku || snapshot.sku || 'N/A'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Color</div>
              <div className="beneficiary-field-value">{demand.selectedColor || 'Standard'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Quantity</div>
              <div className="beneficiary-field-value">{demand.quantity || 1} Unit</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Chassis / Engine Allocation</div>
              <div className="beneficiary-field-value">
                {demand.dealerVerification?.chassisNo ? `${demand.dealerVerification.chassisNo} / ${demand.dealerVerification?.engineNo || ''}` : 'Pending Dealer Allocation'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Beneficiary Information */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <User size={17} color="#1e4fd8" />
            <span>2. Beneficiary Information</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Beneficiary Full Name</div>
              <div className="beneficiary-field-value">{beneficiary.fullName || beneficiary.name || 'CSD Beneficiary'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Service Number</div>
              <div className="beneficiary-field-value">{beneficiary.serviceNumber || 'N/A'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Rank / Designation</div>
              <div className="beneficiary-field-value">{beneficiary.rank || 'N/A'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Pay Level</div>
              <div className="beneficiary-field-value">{beneficiary.payLevel || 'Standard'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Entitlement Category</div>
              <div className="beneficiary-field-value">{beneficiary.entitlement || beneficiary.category || 'AFD Entitled'}</div>
            </div>
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Delivery & Registration Address</div>
              <div className="beneficiary-field-value">{demand.deliveryAddress?.address || 'CSD Registered Address'} ({demand.deliveryAddress?.state || ''} - {demand.deliveryAddress?.pinCode || ''})</div>
            </div>
          </div>
        </div>

        {/* 3. Dealer Information */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <Building size={17} color="#1e4fd8" />
            <span>3. Authorized Dealer Information</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Dealer Name</div>
              <div className="beneficiary-field-value">{dealer.name || 'Authorized CSD Dealership'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Dealer Code</div>
              <div className="beneficiary-field-value">{dealer.code || 'N/A'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Location (City / State)</div>
              <div className="beneficiary-field-value">{dealer.city || ''} {dealer.state ? `(${dealer.state})` : ''}</div>
            </div>
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Showroom Address</div>
              <div className="beneficiary-field-value">{dealer.address || 'Authorized Dealership Address'}</div>
            </div>
          </div>
        </div>

        {/* 4 & 5. CSD Location Hierarchy */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <Store size={17} color="#1e4fd8" />
            <span>4 & 5. CSD Location Hierarchy</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Authorized Price Zone</div>
              <div className="beneficiary-field-value">{demand.priceZone || 'CSD Price Zone'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Sanctioning CSD Depot</div>
              <div className="beneficiary-field-value">{depot.name || 'CSD Depot'}</div>
              <div className="csd-form-helper-text">Code: {depot.code || 'N/A'} ({depot.city || ''})</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Collecting URC Canteen</div>
              <div className="beneficiary-field-value">{urc.name || 'Parent URC'}</div>
              <div className="csd-form-helper-text">Code: {urc.code || 'N/A'} ({urc.city || ''})</div>
            </div>
          </div>
        </div>

        {/* 6. Pricing & Authoritative Valuation */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <CreditCard size={17} color="#1e4fd8" />
            <span>6. Authoritative Pricing</span>
          </h3>
          <table className="demand-summary-calc-table">
            <tbody>
              <tr>
                <td>Unit Base / CSD Basic Price</td>
                <td>₹ {Number(demand.unitPrice || snapshot.price || 0).toLocaleString('en-IN')}</td>
              </tr>
              {demand.taxAmount > 0 && (
                <tr>
                  <td>Concessional Taxes & Statutory Cess</td>
                  <td>₹ {Number(demand.taxAmount).toLocaleString('en-IN')}</td>
                </tr>
              )}
              {demand.loan?.isLoan && (
                <tr className="text-brand">
                  <td>Sanctioned Bank Loan Component</td>
                  <td>₹ {Number(demand.loan.loanAmount || 0).toLocaleString('en-IN')} ({demand.loan.bankName || 'Bank'})</td>
                </tr>
              )}
              <tr className="demand-summary-net-row">
                <td>Total Net Demand Amount</td>
                <td className="demand-summary-net-price">₹ {netAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 7. Payment State & Verification */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <Landmark size={17} color="#1e4fd8" />
            <span>7. Payment</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Payment Mode</div>
              <div className="beneficiary-field-value">{paymentMethodLabel(demand.paymentMethod)}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Payment Status</div>
              <div className="beneficiary-field-value font-semibold">
                {paymentStatusLabel(demand.paymentStatus)}
              </div>
            </div>
            {demand.remarks && (
              <div className="beneficiary-field-box beneficiary-field-full">
                <div className="beneficiary-field-label">Payment Particulars / UTR Reference</div>
                <div className="beneficiary-field-value">{demand.remarks}</div>
              </div>
            )}
            {paymentsList.length > 0 && (
              <div className="beneficiary-field-box beneficiary-field-full">
                <div className="beneficiary-field-label">Payment Records on Ledger</div>
                <div className="portal-flex-col-gap-xs mt-1">
                  {paymentsList.map((p, idx) => (
                    <div key={idx} className="ledger-row">
                      <span>Receipt <strong>{p.paymentNo}</strong> · {paymentMethodLabel(p.method)}</span>
                      <span className="nowrap"><strong>₹ {Number(p.amount).toLocaleString('en-IN')}</strong> · {p.status === 'SUCCESS' ? 'Received' : p.status === 'INITIATED' ? 'Awaiting verification' : p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 8. Eligibility Details */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <BadgeCheck size={17} color="#1e4fd8" />
            <span>8. Official Eligibility Verification</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Eligibility Verification Status</div>
              <div className="beneficiary-field-value text-success font-semibold">
                {demand.eligibility?.eligible !== false ? '✓ ELIGIBLE FOR PURCHASE' : 'INELIGIBLE'}
              </div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Verification Note / Rule Reason</div>
              <div className="beneficiary-field-value">{demand.eligibility?.reason || 'Verified under AFD Entitlement Rules'}</div>
            </div>
          </div>
        </div>

        {/* 9. Attached Documents */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <FileText size={17} color="var(--brand)" />
            <span>9. Attached Documents</span>
          </h3>
          <div className="portal-flex-col-gap-sm">
            {(demand.documents && demand.documents.length > 0) ? (
              demand.documents.map((doc, i) => (
                <div key={i} className="doc-upload-preview-card">
                  <div className="doc-upload-preview-left">
                    <div className="doc-upload-file-icon">
                      <FileText size={18} />
                    </div>
                    <div className="doc-upload-file-details">
                      <span className="doc-upload-filename">{doc.name || doc.type}</span>
                      <span className="doc-upload-meta-status">{doc.type}</span>
                    </div>
                  </div>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="checkout-spec-pill badge-verified-pill flex-align-center-gap-xs cursor-pointer text-decoration-none"
                      style={{ border: 'none', background: 'var(--brand-light, #eff6ff)', color: 'var(--brand, #1e4fd8)' }}
                    >
                      <ExternalLink size={12} /> View
                    </a>
                  ) : (
                    <span className="checkout-spec-pill badge-verified-pill">Attached</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted small">No external documents attached to this demand.</p>
            )}
          </div>
        </div>

      </div>

      {/* 10. Audit Status History */}
      {demand.statusHistory && demand.statusHistory.length > 0 && (
        <div className="checkout-card mt-4">
          <h3 className="checkout-card-title mb-3">
            <Clock size={16} /> Audit Trail & Status History
          </h3>
          <div className="portal-flex-col-gap-xs">
            {demand.statusHistory.map((h, i) => (
              <div key={i} className="between py-2 border-b text-xs">
                <div>
                  <strong>{h.from || 'START'}</strong> → <strong className="text-brand">{h.to}</strong>: {h.note || 'State updated'}
                </div>
                <div className="text-muted">
                  {new Date(h.at).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
