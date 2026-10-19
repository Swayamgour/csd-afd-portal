import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Store,
  MapPin,
  CreditCard,
  Landmark,
  User,
  FileText,
  Upload,
  Lock,
  ArrowRight,
  ArrowLeft,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { DocumentUpload } from '../components/common/DocumentUpload.jsx';
import { DemandConfirmationModal } from '../components/modals/DemandConfirmationModal.jsx';
import { OnlinePaymentModal } from '../components/modals/OnlinePaymentModal.jsx';
import { demandService } from '../services/demand.service.js';
import { INDIAN_STATES, PAY_LEVELS, MOCK_DEALERS_LIST, MOCK_URCS_LIST } from '../data/mock/locations.mock.js';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load product selection from location state or sessionStorage
  const [productData, setProductData] = useState(() => {
    if (location.state?.productData) return location.state.productData;
    const saved = sessionStorage.getItem('csd_checkout_product');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // Default fallback if directly visited
  const fallbackProduct = {
    productId: 'maruti-brezza',
    productName: 'MARUTI VITARA BREZZA VXI 1.5L 5MT (BS-VI)',
    sku: '64224-53',
    manufacturerCode: '7116',
    productImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    selectedColor: 'GRANITE GREY',
    selectedZone: 'DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)',
    selectedDealer: 'AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)',
    selectedDepot: 'DELHI',
    selectedUrc: '7 WING AF',
    productPrice: 548917,
    quantity: 1,
    taxClass: 'tax-class-8'
  };

  const product = productData || fallbackProduct;

  // Beneficiary Pre-filled Details (Fig. 14 - Read Only)
  const beneficiary = {
    priceZone: product.selectedZone,
    depot: product.selectedDepot,
    urc: product.selectedUrc,
    email: user?.email || 'rajesh.kumar@gov.in',
    username: user?.username || 'JC-765432X',
    name: user?.name || 'Subedar Major Rajesh Kumar',
    groceryCardNumber: user?.groceryCardNumber || 'abcd123456789000000',
    chipNumber: user?.chipNumber || '1111112222333444',
    phone: user?.phone || '+91 98765 43210',
    employmentStatus: user?.employmentStatus || 'Servicemen',
    organization: user?.organization || 'Army',
    dateOfBirth: user?.dateOfBirth || '27/11/1992',
    dateOfEnrollment: user?.dateOfEnrollment || '23/11/2015',
    dateOfRetirement: user?.dateOfRetirement || '25/11/2027',
    entitlementCategory: user?.entitlementCategory || 'Officers (Pay Level 10-18)',
    ppoNumber: user?.ppoNumber || 'PPO/DIS/ARM-88912',
    panNumber: user?.panNumber || 'BLBPPT151N'
  };

  // Financial Calculations (Fig. 12 & 15)
  // Subtotal: ₹548,917 | Additional Cost (14%): ₹76,848 | Cess (17%): ₹93,316 | Incidental (0.5%): ₹2,745 | Net: ₹721,826
  const subtotal = product.productPrice || 548917;
  const additionalCost = Math.round(subtotal * 0.14);
  const cess = Math.round(subtotal * 0.17);
  const incidentalCharges = Math.round(subtotal * 0.005);
  const netPrice = subtotal + additionalCost + cess + incidentalCharges; // 721,826

  // Form State: Yet to be filled section (Fig. 15)
  const [prevPurchase, setPrevPurchase] = useState('No'); // Yes / No
  const [prevPurchaseDate, setPrevPurchaseDate] = useState('');
  const [payLevel, setPayLevel] = useState('3A');
  const [addressLine, setAddressLine] = useState('');
  const [townCity, setTownCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [billingState, setBillingState] = useState('Delhi');
  const [country] = useState('India');

  // File Upload states
  const [canteenCardFile, setCanteenCardFile] = useState(null);
  const [panCopyFile, setPanCopyFile] = useState(null);
  const [availabilityCertFile, setAvailabilityCertFile] = useState(null);
  const [dealerPriceInput, setDealerPriceInput] = useState(netPrice.toString()); // prefilled to match or editable
  const [ppoDocFile, setPpoDocFile] = useState(null);
  const [pensionSlipFile, setPensionSlipFile] = useState(null);

  // Loan Section (Fig. 21)
  const [hasLoan, setHasLoan] = useState('No'); // Yes / No
  const [loanAmount, setLoanAmount] = useState('');
  const [loanSanctionFile, setLoanSanctionFile] = useState(null);

  // Payment Mode (Fig. 15)
  const [paymentMode, setPaymentMode] = useState('Direct Bank Transfer'); // Direct Bank Transfer / Online Payment
  const [remarks, setRemarks] = useState('');

  // Modals & Validation states
  const [formErrors, setFormErrors] = useState({});
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fig. 16, 17, 18: Price validation between Dealer Price and Net Price
  const enteredDealerPrice = Number(dealerPriceInput) || 0;
  const isPriceMatched = enteredDealerPrice === netPrice;

  // Matched dealer object for address display
  const dealerInfo = MOCK_DEALERS_LIST.find((d) => d.name === product.selectedDealer) || {
    name: 'AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)',
    address: 'DELHI ROHTAK ROAD NEAR HIRAN KUDNA MODE METRO PILLAR NO 616 DELHI 110041'
  };

  const handleMatchPrice = () => {
    setDealerPriceInput(netPrice.toString());
    setFormErrors((prev) => ({ ...prev, dealerPrice: null }));
  };

  const validateCheckoutForm = () => {
    const errs = {};

    if (prevPurchase === 'Yes' && !prevPurchaseDate) {
      errs.prevPurchaseDate = 'Date of last purchase of Ibid item is required.';
    }

    if (!addressLine.trim()) errs.addressLine = 'Address for registration is required.';
    if (!townCity.trim()) errs.townCity = 'Town / City is required.';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      errs.pincode = 'Valid 6-digit PIN Code is required.';
    }
    if (!billingState) errs.billingState = 'Please select Billing State.';

    // Documents
    if (!canteenCardFile) errs.canteenCard = 'Canteen Card copy upload is required.';
    if (!panCopyFile) errs.panCopy = 'PAN copy upload is required.';
    if (!availabilityCertFile) errs.availabilityCert = 'Availability certificate upload is required.';

    // Dealer Price Validation (Fig. 16 & 18)
    if (!dealerPriceInput || enteredDealerPrice === 0) {
      errs.dealerPrice = 'Billing Dealer Price mentioned in Availability certificate is a required field.';
    } else if (enteredDealerPrice !== netPrice) {
      errs.dealerPrice = 'Dealer Price and Net Price to be Paid must be the same.';
    }

    // Loan Validation
    if (hasLoan === 'Yes') {
      const lAmt = Number(loanAmount) || 0;
      if (lAmt <= 0) errs.loanAmount = 'Please enter valid loan sanctioned amount.';
      if (lAmt > netPrice) errs.loanAmount = 'Loan amount cannot exceed total net payable price.';
      if (!loanSanctionFile) errs.loanSanction = 'Bank loan sanction letter upload is required.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateCheckoutForm()) {
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    // Direct Bank Transfer or Online Payment
    if (paymentMode === 'Online Payment' && hasLoan === 'Yes') {
      alert('Online payment method can only be used if loan is not availed. Please select Direct Bank Transfer.');
      return;
    }

    setConfirmationModalOpen(true);
  };

  const handleConfirmedDemand = async () => {
    setConfirmationModalOpen(false);

    if (paymentMode === 'Online Payment') {
      setOnlineModalOpen(true);
      return;
    }

    // Direct Bank Transfer path
    await finalizeDemandCreation('Direct Bank Transfer', 'On hold');
  };

  const handleOnlinePaymentSuccess = async (paymentDetails) => {
    setOnlineModalOpen(false);
    await finalizeDemandCreation('Online Payment (Razorpay)', 'Processing', paymentDetails);
  };

  const finalizeDemandCreation = async (methodName, initialStatus, paymentDetails = null) => {
    setSubmitting(true);
    try {
      const demandPayload = {
        beneficiaryId: user?.id || 'USR-BEN-001',
        beneficiaryName: beneficiary.name,
        serviceNumber: beneficiary.username,
        productId: product.productId,
        productName: product.productName,
        sku: product.sku,
        color: product.selectedColor,
        priceZone: product.selectedZone,
        depot: product.selectedDepot,
        urc: product.selectedUrc,
        dealerName: dealerInfo.name,
        dealerAddress: dealerInfo.address,
        csdPrice: netPrice,
        subtotal,
        additionalCost,
        cess,
        incidentalCharges,
        paymentMethod: methodName,
        status: initialStatus, // 'On hold' (direct transfer) or 'Processing' (online)
        paymentStatus: initialStatus === 'Processing' ? 'Verified' : 'Pending',
        hasLoan: hasLoan === 'Yes',
        loanAmount: hasLoan === 'Yes' ? Number(loanAmount) : 0,
        registrationAddress: `${addressLine}, ${townCity}, ${billingState} - ${pincode}`,
        payLevel,
        documents: [
          { name: canteenCardFile?.name || 'Canteen_Card.pdf', size: '1.2 MB', status: 'Uploaded' },
          { name: panCopyFile?.name || 'PAN_Card_Copy.pdf', size: '750 KB', status: 'Uploaded' },
          { name: availabilityCertFile?.name || 'Dealer_Availability_Cert.pdf', size: '1.4 MB', status: 'Uploaded' }
        ],
        remarks
      };

      const result = await demandService.createDemand(demandPayload);
      setSubmitting(false);

      // Save latest demand for success page
      sessionStorage.setItem('csd_last_created_demand', JSON.stringify({ ...result, ...demandPayload }));
      navigate('/checkout/success', { state: { demand: { ...result, ...demandPayload } } });
    } catch (err) {
      setSubmitting(false);
      alert(err.message || 'Failed to submit demand.');
    }
  };

  return (
    <div className="checkout-page-container">
      {/* Breadcrumb matching Section 3 */}
      <nav aria-label="Breadcrumb" className="checkout-breadcrumb-nav">
        <ol className="checkout-breadcrumb-list">
          <li><Link to="/" className="checkout-breadcrumb-link">Home</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><Link to="/products" className="checkout-breadcrumb-link">Products</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><span aria-current="page" className="checkout-breadcrumb-active">Checkout</span></li>
        </ol>
      </nav>

      {/* Progress Indicator matching Section 3 */}
      <div className="checkout-progress-card">
        <div className="checkout-progress-row">
          {[
            { step: 1, label: 'Product Selection', state: 'completed' },
            { step: 2, label: 'Eligibility Verified', state: 'completed' },
            { step: 3, label: 'Checkout Details', state: 'current' },
            { step: 4, label: 'Payment Execution', state: 'upcoming' },
            { step: 5, label: 'Confirmation / Supply Order', state: 'upcoming' }
          ].map((s, idx) => (
            <div key={s.step} className="checkout-step-item">
              <div className={`checkout-step-badge ${s.state}`}>
                {s.state === 'completed' ? <CheckCircle2 size={16} /> : s.step}
              </div>
              <span className={`checkout-step-label ${s.state}`}>
                {s.label}
              </span>
              {idx < 4 && <ChevronRight size={14} color="#cbd5e1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="checkout-header-section">
        <h1 className="checkout-page-heading">
          Checkout
        </h1>
        <p className="checkout-page-subheading">
          Complete your official CSD concessional demand application with statutory declarations and document attachments.
        </p>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <form onSubmit={handleFormSubmit}>
        <div className="checkout-main-grid">
          {/* =========================================================
              LEFT COLUMN: Pre-filled section & Additional Information
              ========================================================= */}
          <div className="checkout-left-column">

            {/* SECTION A: PRE-FILLED SECTION (Fig. 14) */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-title">
                  <User size={20} color="#1e4fd8" />
                  <span>Beneficiary Details</span>
                </div>
                <span className="checkout-spec-pill">
                  <Lock size={12} /> READ ONLY (REGISTRATION RECORD)
                </span>
              </div>

              <p className="csd-form-helper-text" style={{ marginBottom: '1.25rem' }}>
                The data in this section is fetched from the registration form and it cannot be changed.
              </p>

              {/* 2-Column Grid matching Fig. 14 */}
              <div className="beneficiary-read-only-grid">
                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Price Zone <span className="doc-upload-required-star">*</span>
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.priceZone}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Depot <span className="doc-upload-required-star">*</span>
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.depot}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    URC <span className="doc-upload-required-star">*</span>
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.urc}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Email <span className="doc-upload-required-star">*</span>
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.email}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Username
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.username}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Beneficiary Name
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.name}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Grocery Card Number
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.groceryCardNumber}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Chip Number
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.chipNumber}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Mobile Number
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.phone}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Employment Status
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.employmentStatus}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Organization
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.organization}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Date of Birth
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.dateOfBirth}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Date of Enrollment / Commissioning
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.dateOfEnrollment}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Date of Retirement
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.dateOfRetirement}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    Entitlement Category
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.entitlementCategory}
                  </div>
                </div>

                <div className="beneficiary-field-box">
                  <div className="beneficiary-field-label">
                    PPO No. / Discharge No. (ESM)
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.ppoNumber}
                  </div>
                </div>

                <div className="beneficiary-field-box beneficiary-field-full">
                  <div className="beneficiary-field-label">
                    PAN Number
                  </div>
                  <div className="beneficiary-field-value">
                    {beneficiary.panNumber}
                  </div>
                </div>
              </div>

              <div className="profile-correction-link-box">
                <Link to="/beneficiary/profile" className="checkout-breadcrumb-link">
                  Need corrections in service record? Update Profile →
                </Link>
              </div>
            </div>

            {/* SECTION B: YET TO BE FILLED SECTION (Fig. 15) */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-title">
                  <FileText size={20} color="#d97706" />
                  <span>Additional Required Information</span>
                </div>
                <p className="csd-form-helper-text">
                  User will have to upload the documents and requested data. No serving document should be uploaded until specified.
                </p>
              </div>

              <div className="checkout-form-stack">
                {/* Previous Purchase Question (Fig. 15 & 18) */}
                <div className="dealer-price-validation-box">
                  <label className="csd-form-label">
                    Did you purchase AFD1 item (same category) earlier from CSD? <span className="doc-upload-required-star">*</span>
                  </label>
                  <div className="checkout-radio-card-group">
                    <label className={`checkout-radio-card ${prevPurchase === 'Yes' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="prevPurchase"
                        value="Yes"
                        checked={prevPurchase === 'Yes'}
                        onChange={() => setPrevPurchase('Yes')}
                      />
                      <span className="checkout-radio-card-title">Yes</span>
                    </label>
                    <label className={`checkout-radio-card ${prevPurchase === 'No' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="prevPurchase"
                        value="No"
                        checked={prevPurchase === 'No'}
                        onChange={() => setPrevPurchase('No')}
                      />
                      <span className="checkout-radio-card-title">No</span>
                    </label>
                  </div>

                  {/* Conditional: If Yes -> Date of last purchase of Ibid item */}
                  {prevPurchase === 'Yes' && (
                    <div className="previous-purchase-date-box">
                      <label className="csd-form-label">
                        Date of last purchase of Ibid item <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="date"
                        className={`csd-form-input ${formErrors.prevPurchaseDate ? 'has-error' : ''}`}
                        value={prevPurchaseDate}
                        onChange={(e) => setPrevPurchaseDate(e.target.value)}
                        required={prevPurchase === 'Yes'}
                      />
                      <p className="csd-form-helper-text">
                        Notice: As per CSD rules, four-wheelers may only be purchased once in 5 to 8 years depending on service entitlement.
                      </p>
                      {formErrors.prevPurchaseDate && (
                        <span className="csd-form-error-text">
                          <AlertCircle size={14} /> {formErrors.prevPurchaseDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pay Level (Fig. 15) */}
                <div className="csd-form-group">
                  <label className="csd-form-label">
                    Pay Level <span className="doc-upload-required-star">*</span>
                  </label>
                  <select
                    value={payLevel}
                    onChange={(e) => setPayLevel(e.target.value)}
                    className="csd-form-select"
                  >
                    {PAY_LEVELS.map((pl) => (
                      <option key={pl.value} value={pl.value}>
                        {pl.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registration Address (Fig. 15) */}
                <div className="csd-form-group">
                  <label className="csd-form-label">
                    Address for registration <span className="doc-upload-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className={`csd-form-input ${formErrors.addressLine ? 'has-error' : ''}`}
                    placeholder="House number and street name"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    required
                  />
                  {formErrors.addressLine && (
                    <span className="csd-form-error-text">
                      <AlertCircle size={14} /> {formErrors.addressLine}
                    </span>
                  )}
                </div>

                {/* Town/City, Pincode, Billing State, Country */}
                <div className="checkout-form-row-2">
                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Town / City <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`csd-form-input ${formErrors.townCity ? 'has-error' : ''}`}
                      placeholder="e.g. New Delhi"
                      value={townCity}
                      onChange={(e) => setTownCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Pin code <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      className={`csd-form-input ${formErrors.pincode ? 'has-error' : ''}`}
                      placeholder="e.g. 110010"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Billing State <span className="doc-upload-required-star">*</span>
                    </label>
                    <select
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      className={`csd-form-select ${formErrors.billingState ? 'has-error' : ''}`}
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Country <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      value={country}
                      disabled
                      className="csd-form-input"
                      style={{ background: '#f1f5f9' }}
                    />
                  </div>
                </div>

                {/* Mandatory Document Uploads (Fig. 15) */}
                <div className="checkout-docs-section">
                  <h4 className="checkout-docs-title">
                    Statutory Documents & Certificates
                  </h4>

                  <DocumentUpload
                    label="Canteen Card"
                    required
                    file={canteenCardFile}
                    onFileSelect={setCanteenCardFile}
                    onFileRemove={() => setCanteenCardFile(null)}
                    error={formErrors.canteenCard}
                    helperText="Upload scanned copy of valid CSD Smart Grocery / Liquor Card (PDF, JPG, PNG)"
                  />

                  <DocumentUpload
                    label="PAN copy"
                    required
                    file={panCopyFile}
                    onFileSelect={setPanCopyFile}
                    onFileRemove={() => setPanCopyFile(null)}
                    error={formErrors.panCopy}
                    helperText="Upload official self-attested Permanent Account Number card copy"
                  />

                  <DocumentUpload
                    label="Availability certificate"
                    required
                    file={availabilityCertFile}
                    onFileSelect={setAvailabilityCertFile}
                    onFileRemove={() => setAvailabilityCertFile(null)}
                    error={formErrors.availabilityCert}
                    helperText="Upload official Availability Certificate signed and stamped by authorized CSD Dealer"
                  />

                  {/* Dealer Price Mentioned in Availability Certificate (Fig. 15 & 16) */}
                  <div className="dealer-price-validation-box">
                    <div className="dealer-price-header-row">
                      <label className="csd-form-label">
                        Dealer Price mentioned in Availability certificate <span className="doc-upload-required-star">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleMatchPrice}
                        className="btn-autofill-price"
                      >
                        Auto-fill Net Price (₹ {netPrice.toLocaleString('en-IN')})
                      </button>
                    </div>

                    <input
                      type="number"
                      className={`dealer-price-input ${isPriceMatched ? 'matched' : 'mismatched'}`}
                      value={dealerPriceInput}
                      onChange={(e) => setDealerPriceInput(e.target.value)}
                      placeholder="Enter exact price quoted in availability certificate"
                      required
                    />

                    {/* Fig. 16, 17, 18 Alert */}
                    {!isPriceMatched && (
                      <div className="price-mismatch-alert-banner">
                        <AlertCircle size={16} flexShrink={0} />
                        <span>
                          <strong>Dealer Price and Net Price to be Paid must be the same.</strong> Net Price: ₹{netPrice.toLocaleString('en-IN')}, Dealer Price: ₹{enteredDealerPrice.toLocaleString('en-IN')}.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Optional for ESM / Pensioners */}
                  <div className="checkout-form-row-2">
                    <DocumentUpload
                      label="PPO / Discharge Book / Release Order"
                      file={ppoDocFile}
                      onFileSelect={setPpoDocFile}
                      onFileRemove={() => setPpoDocFile(null)}
                      helperText="Required for Ex-Servicemen (ESM) applicants"
                    />

                    <DocumentUpload
                      label="Last Pension slip"
                      file={pensionSlipFile}
                      onFileSelect={setPensionSlipFile}
                      onFileRemove={() => setPensionSlipFile(null)}
                      helperText="Required for Ex-Servicemen (ESM) applicants"
                    />
                  </div>
                </div>

                {/* Loan Section (Fig. 15 & Fig. 21) */}
                <div className="dealer-price-validation-box">
                  <label className="csd-form-label">
                    Have you taken loan? <span className="doc-upload-required-star">*</span>
                  </label>
                  <div className="checkout-radio-card-group">
                    <label className={`checkout-radio-card ${hasLoan === 'Yes' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="hasLoan"
                        value="Yes"
                        checked={hasLoan === 'Yes'}
                        onChange={() => {
                          setHasLoan('Yes');
                          setPaymentMode('Direct Bank Transfer'); // Auto enforce direct bank transfer for loan
                        }}
                      />
                      <span className="checkout-radio-card-title">Yes</span>
                    </label>
                    <label className={`checkout-radio-card ${hasLoan === 'No' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="hasLoan"
                        value="No"
                        checked={hasLoan === 'No'}
                        onChange={() => setHasLoan('No')}
                      />
                      <span className="checkout-radio-card-title">No</span>
                    </label>
                  </div>

                  {/* Conditional Loan Fields (Fig. 21) */}
                  {hasLoan === 'Yes' && (
                    <div className="previous-purchase-date-box">
                      <div className="csd-form-group">
                        <label className="csd-form-label">
                          Loan Amount <span className="doc-upload-required-star">*</span>
                        </label>
                        <input
                          type="number"
                          className={`csd-form-input ${formErrors.loanAmount ? 'has-error' : ''}`}
                          placeholder="e.g. 500000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          required={hasLoan === 'Yes'}
                        />
                        {formErrors.loanAmount && (
                          <span className="csd-form-error-text">
                            <AlertCircle size={14} /> {formErrors.loanAmount}
                          </span>
                        )}
                      </div>

                      <DocumentUpload
                        label="Loan Sanction Letter"
                        required
                        file={loanSanctionFile}
                        onFileSelect={setLoanSanctionFile}
                        onFileRemove={() => setLoanSanctionFile(null)}
                        error={formErrors.loanSanction}
                        helperText="Upload official sanction letter from nationalized / scheduled commercial bank"
                      />
                    </div>
                  )}
                </div>

                {/* Mode of Payment (Fig. 15) */}
                <div className="csd-form-group">
                  <label className="csd-form-label">
                    Mode of Payment <span className="doc-upload-required-star">*</span>
                  </label>
                  <div className="checkout-form-row-2">
                    {/* Direct Bank Transfer */}
                    <div
                      onClick={() => setPaymentMode('Direct Bank Transfer')}
                      className={`checkout-radio-card ${paymentMode === 'Direct Bank Transfer' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === 'Direct Bank Transfer'}
                        onChange={() => setPaymentMode('Direct Bank Transfer')}
                      />
                      <div>
                        <div className="checkout-radio-card-title">Direct Bank Transfer</div>
                        <div className="csd-form-helper-text">Deposit via NEFT/RTGS to CSD Public Fund Account</div>
                      </div>
                    </div>

                    {/* Online Payment */}
                    <div
                      onClick={() => {
                        if (hasLoan === 'Yes') {
                          alert('Online payment method can only be used if loan is not availed.');
                          return;
                        }
                        setPaymentMode('Online Payment');
                      }}
                      className={`checkout-radio-card ${paymentMode === 'Online Payment' ? 'active' : ''}`}
                      style={{ opacity: hasLoan === 'Yes' ? 0.6 : 1, cursor: hasLoan === 'Yes' ? 'not-allowed' : 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === 'Online Payment'}
                        disabled={hasLoan === 'Yes'}
                        onChange={() => setPaymentMode('Online Payment')}
                      />
                      <div>
                        <div className="checkout-radio-card-title">Online Payment</div>
                        <div className="csd-form-helper-text">
                          Instant checkout via Razorpay (Not available with loan)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Remarks (Fig. 15) */}
                <div className="csd-form-group">
                  <label className="csd-form-label">
                    Additional remarks
                  </label>
                  <textarea
                    rows={3}
                    className="csd-form-textarea"
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* =========================================================
              RIGHT COLUMN: Payment Details / Summary ("Your demand") (Fig. 12 & 15)
              ========================================================= */}
          <div className="checkout-summary-sticky">
            
            <div className="checkout-card">
              <div className="demand-summary-header">
                <h3 className="demand-summary-title">
                  Your demand
                </h3>
              </div>

              {/* Product Info */}
              <div className="demand-product-info-box">
                <div className="demand-summary-product-name">
                  {product.productName}
                </div>
                <div className="checkout-spec-pill-group">
                  <span className="checkout-spec-pill">
                    {product.sku}
                  </span>
                  <span className="checkout-spec-pill" style={{ background: '#ecfdf5', color: '#047857' }}>
                    {product.taxClass || 'tax-class-8'}
                  </span>
                </div>
              </div>

              {/* Color & Dealer Specification */}
              <div className="demand-summary-dealer-box">
                <div className="demand-summary-meta-line">
                  Color: <strong>{product.selectedColor || 'GRANITE GREY'}</strong>
                </div>
                <div className="demand-summary-meta-line">
                  Dealer Name: <strong>{dealerInfo.name}</strong>
                </div>
                <div className="demand-summary-meta-line">
                  Dealer Address: <span className="text-muted">{dealerInfo.address}</span>
                </div>
                <div className="checkout-form-row-2" style={{ marginTop: '4px' }}>
                  <div className="demand-summary-meta-line">Depot: <strong>{product.selectedDepot}</strong></div>
                  <div className="demand-summary-meta-line">URC: <strong>{product.selectedUrc}</strong></div>
                </div>
              </div>

              {/* Breakdown Table matching Fig. 12 */}
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
                    <td>₹ {incidentalCharges.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="demand-summary-net-row">
                    <td>
                      <div>Net Price to be Paid</div>
                      <small style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, display: 'block' }}>
                        Inclusive of all Taxes and Levies
                      </small>
                    </td>
                    <td className="demand-summary-net-price">
                      ₹ {netPrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!isPriceMatched || submitting}
                className="btn-submit-demand"
              >
                {submitting ? 'Processing Demand...' : 'Submit Demand'}
              </button>

              {!isPriceMatched && (
                <p className="csd-form-error-text" style={{ justifyContent: 'center', marginTop: '0.65rem' }}>
                  ⚠ Please match Dealer Price with Net Price to proceed.
                </p>
              )}
            </div>

            {/* Statutory Security Seal */}
            <div className="csd-alert-banner info">
              <ShieldCheck size={20} color="#16a34a" flexShrink={0} />
              <span style={{ fontSize: '0.78rem' }}>
                Statutory AFD Portal: All allocations are protected by Armed Forces HQ guidelines. No dealer handling charges allowed.
              </span>
            </div>

          </div>
        </div>
      </form>

      {/* Confirmation & Payment Modals */}
      <DemandConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleConfirmedDemand}
        demandSummary={{
          productName: product.productName,
          sku: product.sku,
          color: product.selectedColor,
          dealerName: dealerInfo.name,
          depot: product.selectedDepot,
          urc: product.selectedUrc,
          priceZone: product.selectedZone,
          netPrice,
          paymentMethod: paymentMode
        }}
        loading={submitting}
      />

      <OnlinePaymentModal
        isOpen={onlineModalOpen}
        onClose={() => setOnlineModalOpen(false)}
        onSuccess={handleOnlinePaymentSuccess}
        amount={netPrice}
        demandNo="30-76510"
        productName={product.productName}
      />
    </div>
  );
}
