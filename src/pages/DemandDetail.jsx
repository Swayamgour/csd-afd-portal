import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useGetDemandByIdQuery } from '../features/demand/demandApi.js';
import { PaymentDetailsModal } from '../components/modals/PaymentDetailsModal.jsx';

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
        <p className="portal-error-desc">The requested demand #{id} could not be located in the CSD database.</p>
        <Link to="/demands" className="btn btn-primary portal-btn-inline">
          Back to Demands
        </Link>
      </div>
    );
  }

  const netAmount = demand.totalAmount || demand.csdPrice || 721826;
  const subtotal = demand.subtotal || Math.round(netAmount / 1.315);
  const additionalCost = demand.additionalCost || Math.round(subtotal * 0.14);
  const cess = demand.cess || Math.round(subtotal * 0.17);
  const incidental = demand.incidentalCharges || Math.round(subtotal * 0.005);

  // Status mapping for timeline
  const statusesList = [
    { key: 'submitted', label: 'Demand Submitted', sub: 'Online submission recorded' },
    { key: 'payment', label: 'Payment Pending', sub: 'Beneficiary payment clearance' },
    { key: 'processing', label: 'Processing', sub: 'Pending on Regional Depot' },
    { key: 'supply_order', label: 'Supply Order Issued', sub: 'Pending with local URC' },
    { key: 'delivered', label: 'Delivery Completed', sub: 'Product delivered by dealer' }
  ];

  const currentStatusLower = (demand.status || '').toLowerCase();
  let activeStepIndex = 0;
  if (currentStatusLower === 'on hold' || currentStatusLower === 'payment pending') {
    activeStepIndex = 1;
  } else if (currentStatusLower === 'processing' || currentStatusLower === 'depot sanctioned') {
    activeStepIndex = 2;
  } else if (currentStatusLower === 'supply order issued' || currentStatusLower === 'supply_order_issued') {
    activeStepIndex = 3;
  } else if (currentStatusLower === 'delivery completed' || currentStatusLower === 'delivered') {
    activeStepIndex = 4;
  }

  return (
    <div className="demand-detail-container">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="checkout-breadcrumb-nav">
        <ol className="checkout-breadcrumb-list">
          <li><Link to="/" className="checkout-breadcrumb-link">Home</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><Link to="/demands" className="checkout-breadcrumb-link">Demands</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><span aria-current="page" className="checkout-breadcrumb-active">{demand.id}</span></li>
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
              Demand {demand.id}
            </h1>
            <span className={`checkout-spec-pill ${currentStatusLower === 'processing' ? 'status-processing' : 'status-onhold'}`}>
              {demand.status}
            </span>
          </div>
          <div className="csd-form-helper-text mt-xs">
            Date of Booking: <strong>{demand.displayDate || (demand.createdAt ? new Date(demand.createdAt).toLocaleDateString() : 'Dec 7, 2020')}</strong> • Username: <strong>{demand.username || demand.beneficiaryName || 'DEMO'}</strong>
          </div>
        </div>

        <div className="portal-flex-wrap-gap-xs">
          {demand.status?.toLowerCase() === 'on hold' && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="btn-action-upload-details flex-align-center-gap-xs"
            >
              <CreditCard size={16} />
              Upload Payment Details
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

      {/* 8. Demand Status Timeline (Section 17) */}
      <div className="checkout-card">
        <h2 className="checkout-card-title mb-md">
          <Clock size={18} color="var(--brand)" />
          <span>Demand Status Timeline</span>
        </h2>

        <div className="demand-timeline-grid">
          {statusesList.map((st, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

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

      {/* Grid of Sections (Section 17 Requirements) */}
      <div className="checkout-form-row-2">

        {/* 1. Product Information */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <Truck size={17} color="#1e4fd8" />
            <span>1. Product Information</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Vehicle / Item</div>
              <div className="beneficiary-field-value">{demand.productName}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">SKU</div>
              <div className="beneficiary-field-value">{demand.sku || '64224-53'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Color</div>
              <div className="beneficiary-field-value">{demand.color || 'GRANITE GREY'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Category</div>
              <div className="beneficiary-field-value">{demand.category || '4 Wheelers'}</div>
            </div>
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Price Zone</div>
              <div className="beneficiary-field-value">{demand.priceZone || 'DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)'}</div>
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
              <div className="beneficiary-field-label">Beneficiary Name</div>
              <div className="beneficiary-field-value">{demand.beneficiaryName || 'Subedar Major Rajesh Kumar'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Username / Service No</div>
              <div className="beneficiary-field-value">{demand.username || 'JC-765432X'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Grocery Card No</div>
              <div className="beneficiary-field-value">abcd123456789000000</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Entitlement</div>
              <div className="beneficiary-field-value">Officers (Pay Level 10-18)</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">PAN Number</div>
              <div className="beneficiary-field-value">BLBPPT151N</div>
            </div>
            {demand.registrationAddress && (
              <div className="beneficiary-field-box beneficiary-field-full">
                <div className="beneficiary-field-label">Registration Address</div>
                <div className="beneficiary-field-value">{demand.registrationAddress}</div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Dealer Information */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <Building size={17} color="#1e4fd8" />
            <span>3. Dealer Information</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Dealer Name</div>
              <div className="beneficiary-field-value">{demand.dealer || demand.dealerName || 'AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)'}</div>
            </div>
            <div className="beneficiary-field-box">
              <div className="beneficiary-field-label">Dealer Code</div>
              <div className="beneficiary-field-value">{demand.dealerCode || '1802'}</div>
            </div>
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Dealer Address</div>
              <div className="beneficiary-field-value">{demand.dealerAddress || 'DELHI ROHTAK ROAD NEAR HIRAN KUDNA MODE METRO PILLAR NO 616 DELHI 110041'}</div>
            </div>
          </div>
        </div>

        {/* 4 & 5. Depot & URC Information */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <Store size={17} color="#1e4fd8" />
            <span>4 & 5. Depot and URC Details</span>
          </h3>
          <div className="beneficiary-read-only-grid">
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Regional CSD Depot</div>
              <div className="beneficiary-field-value">{demand.depot || 'DELHI'} Depot</div>
              <div className="csd-form-helper-text">Under CSD Directorate Head Office</div>
            </div>
            <div className="beneficiary-field-box beneficiary-field-full">
              <div className="beneficiary-field-label">Parent URC Canteen</div>
              <div className="beneficiary-field-value">{demand.urc || '7 WING AF'}</div>
              <div className="csd-form-helper-text">URC Code: 685 • Address: C/O 56 APO</div>
            </div>
          </div>
        </div>

        {/* 6. Payment Information */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <CreditCard size={17} color="#1e4fd8" />
            <span>6. Payment Information</span>
          </h3>
          {demand.productSnapshot?.basicPrice ? (
            <table className="demand-summary-calc-table">
              <tbody>
                <tr>
                  <td>Basic Price (incl. Dealer Margin)</td>
                  <td>₹ {Number(demand.productSnapshot.basicPrice).toLocaleString('en-IN')}</td>
                </tr>
                {(demand.productSnapshot.csdDiscountAmount > 0 || demand.productSnapshot.marketScheme > 0) && (
                  <tr className="row-discount-positive">
                    <td>CSD Discount & Market Scheme</td>
                    <td>- ₹ {(Number(demand.productSnapshot.csdDiscountAmount || 0) + Number(demand.productSnapshot.marketScheme || 0)).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td>CSD Basic with Discount</td>
                  <td className="font-semibold">₹ {Number(demand.productSnapshot.csdBasicWithDiscount || demand.productSnapshot.basicPrice).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>GST (SGST + CGST with Concession)</td>
                  <td>₹ {(Number(demand.productSnapshot.sgstAmount || 0) + Number(demand.productSnapshot.cgstAmount || 0)).toLocaleString('en-IN')}</td>
                </tr>
                {demand.productSnapshot.csdProfitAmount > 0 && (
                  <tr>
                    <td>CSD Profit Margin (0.50%)</td>
                    <td>₹ {Number(demand.productSnapshot.csdProfitAmount).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {demand.productSnapshot.tcsAmount > 0 && (
                  <tr>
                    <td>TCS @ 1% (Above 10 Lacs)</td>
                    <td>₹ {Number(demand.productSnapshot.tcsAmount).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className="demand-summary-net-row">
                  <td>Net Price Paid (Price to Customer)</td>
                  <td className="demand-summary-net-price">₹ {netAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="demand-summary-calc-table">
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td>₹ {subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Additional Cost (14%)</td>
                  <td>₹ {additionalCost.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Cess (17%)</td>
                  <td>₹ {cess.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Incidental Charges (0.5%)</td>
                  <td>₹ {incidental.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="demand-summary-net-row">
                  <td>Net Price Paid</td>
                  <td className="demand-summary-net-price">₹ {netAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          )}

          <div className="beneficiary-field-box mt-sm">
            <div>Method: <strong>{demand.paymentMethod || 'Direct bank transfer'}</strong></div>
            {demand.razorpayId && <div>Razorpay Gateway ID: <code>{demand.razorpayId}</code></div>}
            {demand.paymentData?.utrNumber && <div>Bank Transfer UTR: <code>{demand.paymentData.utrNumber}</code></div>}
          </div>
        </div>

        {/* 7. Documents */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <FileText size={17} color="var(--brand)" />
            <span>7. Attached Documents</span>
          </h3>
          <div className="portal-flex-col-gap-sm">
            {(demand.documents || [
              { name: 'Canteen Card.pdf', size: '1.2 MB', status: 'Uploaded' },
              { name: 'PAN Copy.pdf', size: '640 KB', status: 'Uploaded' },
              { name: 'Availability Certificate.pdf', size: '1.1 MB', status: 'Uploaded' }
            ]).map((doc, i) => (
              <div
                key={i}
                className="doc-upload-preview-card"
              >
                <div className="doc-upload-preview-left">
                  <div className="doc-upload-file-icon">
                    <FileText size={18} />
                  </div>
                  <div className="doc-upload-file-details">
                    <span className="doc-upload-filename">{doc.name}</span>
                    <span className="doc-upload-meta-status">{doc.size || '1.1 MB'}</span>
                  </div>
                </div>
                <span className="checkout-spec-pill badge-verified-pill">
                  {doc.status || 'Verified'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Payment Details Modal (Fig. 21 & 22) */}
      {paymentModalOpen && (
        <PaymentDetailsModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          demand={demand}
          onSubmitSuccess={handlePaymentSubmitSuccess}
        />
      )}
    </div>
  );
}
