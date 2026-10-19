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
import { demandService } from '../services/demand.service.js';
import { PaymentDetailsModal } from '../components/modals/PaymentDetailsModal.jsx';

export default function DemandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [demand, setDemand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment upload modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchDemand = async () => {
    setLoading(true);
    try {
      const data = await demandService.getDemandById(id);
      if (data) {
        setDemand(data);
      } else {
        setError('Demand not found');
      }
    } catch (err) {
      setError('Unable to load demand details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDemand();
  }, [id]);

  const handlePaymentSubmitSuccess = async (paymentData) => {
    if (demand) {
      await demandService.updateDemandPayment(demand.id, paymentData);
      setPaymentModalOpen(false);
      await fetchDemand();
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <Clock size={36} className="spin" color="#1e4fd8" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Loading demand details...</h2>
      </div>
    );
  }

  if (error || !demand) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 12px', display: 'block' }} />
        <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '8px' }}>Demand Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The requested demand #{id} could not be located in the CSD database.</p>
        <Link to="/demands" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.65rem 1.25rem', textDecoration: 'none' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/demands" className="checkout-breadcrumb-link" title="Back to demands">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="checkout-page-heading" style={{ fontSize: '1.65rem', margin: 0 }}>
              Demand {demand.id}
            </h1>
            <span className={`checkout-spec-pill ${currentStatusLower === 'processing' ? 'status-processing' : 'status-onhold'}`}>
              {demand.status}
            </span>
          </div>
          <div className="csd-form-helper-text" style={{ marginTop: '6px' }}>
            Date of Booking: <strong>{demand.displayDate || (demand.createdAt ? new Date(demand.createdAt).toLocaleDateString() : 'Dec 7, 2020')}</strong> • Username: <strong>{demand.username || demand.beneficiaryName || 'DEMO'}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {demand.status?.toLowerCase() === 'on hold' && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="btn-action-upload-details"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CreditCard size={16} />
              Upload Payment Details
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="btn-secondary-action"
            style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>

      {/* 8. Demand Status Timeline (Section 17) */}
      <div className="checkout-card">
        <h2 className="checkout-card-title" style={{ marginBottom: '1.25rem' }}>
          <Clock size={18} color="#1e4fd8" />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div
                    className={`checkout-step-badge ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                    style={{ width: '24px', height: '24px', fontSize: '0.78rem' }}
                  >
                    {isCompleted ? <CheckCircle2 size={15} /> : idx + 1}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: isCurrent ? '#1e4fd8' : isCompleted ? '#166534' : '#64748b' }}>
                    {st.label}
                  </div>
                </div>
                <div className="csd-form-helper-text" style={{ paddingLeft: '32px' }}>
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

          <div className="beneficiary-field-box" style={{ marginTop: '10px' }}>
            <div>Method: <strong>{demand.paymentMethod || 'Direct bank transfer'}</strong></div>
            {demand.razorpayId && <div>Razorpay Gateway ID: <code>{demand.razorpayId}</code></div>}
            {demand.paymentData?.utrNumber && <div>Bank Transfer UTR: <code>{demand.paymentData.utrNumber}</code></div>}
          </div>
        </div>

        {/* 7. Documents */}
        <div className="demand-detail-section">
          <h3 className="demand-detail-section-title">
            <FileText size={17} color="#1e4fd8" />
            <span>7. Attached Documents</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                <span className="checkout-spec-pill" style={{ background: '#dcfce7', color: '#166534' }}>
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
