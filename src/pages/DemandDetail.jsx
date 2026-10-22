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
  BadgeCheck
} from 'lucide-react';
import { useGetDemandByIdQuery } from '../features/demand/demandApi.js';
import { PaymentDetailsModal } from '../components/modals/PaymentDetailsModal.jsx';
import DocumentPreviewModal from '../components/common/DocumentPreviewModal.jsx';

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

  const demand = demandData?.data || demandData;

  // Payment upload modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const handlePaymentSubmitSuccess = async () => {
    setPaymentModalOpen(false);
    fetchDemand();
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

  // Canonical lifecycle steps
  const canonicalTimeline = [
    { key: 'CREATED', label: 'Demand Created', sub: 'Beneficiary demand registered' },
    { key: 'PAYMENT_PENDING', label: 'Payment Pending', sub: 'Awaiting payment verification' },
    { key: 'PAID', label: 'Payment Verified', sub: 'Funds confirmed in CSD Fund' },
    { key: 'DEALER_VERIFICATION', label: 'Dealer Verification', sub: 'Chassis & vehicle allocation' },
    { key: 'DEPOT_PROCESSING', label: 'Depot Processing', sub: 'Regional Depot officer review' },
    { key: 'APPROVED', label: 'Approved', sub: 'Supply Order sanctioned' },
    { key: 'COMPLETED', label: 'Delivered', sub: 'Vehicle delivered to beneficiary' },
  ];

  const statusOrder = [
    'CREATED',
    'PAYMENT_PENDING',
    'PAID',
    'DEALER_VERIFICATION',
    'DEPOT_PROCESSING',
    'APPROVED',
    'SUPPLY_ORDER_ISSUED',
    'PROCESSING',
    'COMPLETED'
  ];

  const currentStatus = (demand.status || 'CREATED').toUpperCase();
  const currentStepIndex = Math.max(0, statusOrder.indexOf(currentStatus));
  const isTerminated = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED' || currentStatus === 'EXPIRED';

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
              currentStatus === 'APPROVED' || currentStatus === 'COMPLETED' || currentStatus === 'PAID'
                ? 'badge-verified-pill'
                : isTerminated
                ? 'status-onhold text-danger'
                : 'status-processing'
            }`}>
              {currentStatus}
            </span>
          </div>
          <div className="csd-form-helper-text mt-xs">
            Date of Booking: <strong>{new Date(demand.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong> • Beneficiary: <strong>{beneficiary.fullName || beneficiary.name || 'Verified Beneficiary'}</strong>
          </div>
        </div>

        <div className="portal-flex-wrap-gap-xs">
          {demand.status === 'PAYMENT_PENDING' && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="btn-action-upload-details flex-align-center-gap-xs"
            >
              <CreditCard size={16} />
              Update Bank Transfer UTR
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
            <span>7. Payment State</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Payment Mode</div>
              <div className="beneficiary-field-value">{demand.paymentMethod || 'Direct Bank Transfer'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Payment Status</div>
              <div className="beneficiary-field-value font-semibold">
                {demand.paymentStatus || 'UNPAID'}
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
                    <div key={idx} className="between py-1 border-b text-xs">
                      <span>Receipt: <strong>{p.paymentNo}</strong> ({p.method})</span>
                      <span>₹ {Number(p.amount).toLocaleString('en-IN')} • <strong className="text-success">{p.status}</strong></span>
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
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="checkout-spec-pill badge-verified-pill flex-align-center-gap-xs cursor-pointer"
                      style={{ border: 'none', background: 'var(--brand-light, #eff6ff)', color: 'var(--brand, #1e4fd8)' }}
                    >
                      <ExternalLink size={12} /> View
                    </button>
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

      {/* Payment Details Modal */}
      {paymentModalOpen && (
        <PaymentDetailsModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          demand={demand}
          onSubmitSuccess={handlePaymentSubmitSuccess}
        />
      )}

      {/* In-Portal Document Previewer Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          doc={previewDoc}
        />
      )}
    </div>
  );
}
