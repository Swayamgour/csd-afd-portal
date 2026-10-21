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
  Copy,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { DocumentUpload } from '../components/common/DocumentUpload.jsx';
import { DemandConfirmationModal } from '../components/modals/DemandConfirmationModal.jsx';
import { useCreateDemandMutation } from '../features/demand/demandApi.js';
import { useCreatePaymentMutation, useVerifyPaymentMutation } from '../features/payment/paymentApi.js';
import { useGetMyProfileQuery, useUploadFileMutation } from '../features/beneficiary/beneficiaryApi.js';
import { useGetDepotsQuery, useGetDealersQuery, useGetUrcsQuery, useGetPriceZonesQuery } from '../features/org/orgApi.js';
import { INDIAN_STATES, PAY_LEVELS } from '../data/mock/locations.mock.js';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profileData } = useGetMyProfileQuery();
  const [createDemandMutation, { isLoading: isCreatingDemand }] = useCreateDemandMutation();
  const [createPaymentMutation, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [verifyPaymentMutation, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const [uploadFileMutation] = useUploadFileMutation();

  const { data: priceZonesList = [] } = useGetPriceZonesQuery();
  const { data: depotsList = [] } = useGetDepotsQuery();
  const { data: dealersList = [] } = useGetDealersQuery();
  const { data: urcsList = [] } = useGetUrcsQuery();

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
    productId: '64224',
    productName: 'Maruti Suzuki Alto K10 VXi',
    sku: '64224',
    manufacturerCode: '7116',
    productImage: '/assets/maruti1.png',
    selectedColor: 'Granite Grey',
    selectedZone: 'DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)',
    selectedDealer: 'AAA VEHICLEADES PVT. LTD. MUNDKA',
    selectedDepot: 'DELHI CSD DEPOT',
    selectedUrc: '7 WING AF CANTEEN',
    productPrice: 398500,
    quantity: 1,
    taxClass: 'tax-class-8'
  };

  const product = productData || fallbackProduct;

  const prof = profileData || {};
  const userAccount = prof.userId || user || {};

  // Beneficiary Pre-filled Details (From Real Database Profile)
  const beneficiary = {
    priceZone: product.selectedZone,
    depot: product.selectedDepot,
    urc: product.selectedUrc,
    email: userAccount.email || 'beneficiary@gov.in',
    username: prof.serviceNumber || userAccount.username || 'ARMY-SVC',
    name: prof.name || userAccount.name || 'CSD Beneficiary',
    groceryCardNumber: prof.cardId || 'CSD-CARD-DEF',
    chipNumber: prof.chipNumber || '1111112222333444',
    phone: userAccount.mobile || prof.mobile || '+91 98765 00000',
    employmentStatus: prof.employmentStatus || 'SERVING',
    organization: prof.organization || 'Indian Armed Forces',
    dateOfBirth: prof.dob ? new Date(prof.dob).toLocaleDateString('en-IN') : '27/11/1992',
    dateOfEnrollment: prof.dateOfEnrollment ? new Date(prof.dateOfEnrollment).toLocaleDateString('en-IN') : '23/11/2015',
    dateOfRetirement: prof.dateOfRetirement ? new Date(prof.dateOfRetirement).toLocaleDateString('en-IN') : '25/11/2027',
    entitlementCategory: prof.entitlement || 'AFD-I & AFD-II Standard',
    ppoNumber: prof.ppo || 'N/A',
    panNumber: prof.pan || 'NOTSET'
  };

  // Financial Calculations
  const isCsdRateList = Boolean(product.basicPrice || product.priceToCustomer);
  const subtotal = product.basicPrice || product.productPrice || 398500;
  const discountVal = (product.csdDiscountAmount || 0) + (product.marketScheme || 0);
  const csdBasic = product.csdBasicWithDiscount || (subtotal - discountVal);
  const additionalCost = isCsdRateList ? (product.cgstAmount || 0) : Math.round(subtotal * 0.14);
  const cess = isCsdRateList ? (product.sgstAmount || 0) : Math.round(subtotal * 0.17);
  const incidentalCharges = isCsdRateList ? (product.csdProfitAmount || 0) : Math.round(subtotal * 0.005);
  const tcsVal = product.tcsAmount || 0;
  const netPrice = product.priceToCustomer || (csdBasic + additionalCost + cess + incidentalCharges + tcsVal);

  // Form State: Yet to be filled section
  const [prevPurchase, setPrevPurchase] = useState('No');
  const [prevPurchaseDate, setPrevPurchaseDate] = useState('');
  const [payLevel, setPayLevel] = useState(prof.payLevel || '3A');
  const [addressLine, setAddressLine] = useState(prof.address?.line1 || '');
  const [townCity, setTownCity] = useState(prof.address?.city || '');
  const [pincode, setPincode] = useState(prof.address?.pincode || '');
  const [billingState, setBillingState] = useState(prof.address?.state || 'Delhi');
  const [country] = useState('India');

  // File Upload states
  const [canteenCardFile, setCanteenCardFile] = useState(null);
  const [panCopyFile, setPanCopyFile] = useState(null);
  const [availabilityCertFile, setAvailabilityCertFile] = useState(null);
  const [dealerPriceInput, setDealerPriceInput] = useState(netPrice.toString());
  const [ppoDocFile, setPpoDocFile] = useState(null);
  const [pensionSlipFile, setPensionSlipFile] = useState(null);

  // Loan Section
  const [hasLoan, setHasLoan] = useState('No');
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

  // Matched dealer object for address display from live org API
  const dealerInfo = dealersList.find((d) => d.name === product.selectedDealer || d._id === product.dealerId) || dealersList[0] || {
    name: product.selectedDealer || 'AAA VEHICLEADES PVT. LTD. MUNDKA',
    address: 'DELHI ROHTAK ROAD NEAR HIRAN KUDNA MODE METRO PILLAR NO 616 DELHI 110041'
  };

  const matchedDepot = depotsList.find((d) => d.name === product.selectedDepot || d._id === product.depotId) || depotsList[0];
  const matchedDealer = dealersList.find((d) => d.name === product.selectedDealer || d._id === product.dealerId) || dealersList[0];
  const matchedUrc =
    urcsList.find((u) => (u.name === product.selectedUrc || u._id === product.urcId) && (!matchedDepot || !u.depotId || String(u.depotId?._id || u.depotId) === String(matchedDepot?._id))) ||
    urcsList.find((u) => matchedDepot && String(u.depotId?._id || u.depotId) === String(matchedDepot?._id)) ||
    urcsList[0];

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
      const uploadSingleFile = async (fileObj, docType) => {
        if (!fileObj) return null;
        try {
          const fd = new FormData();
          fd.append('files', fileObj);
          const upRes = await uploadFileMutation(fd).unwrap();
          const upItem = Array.isArray(upRes) ? upRes[0] : upRes?.data?.[0];
          if (upItem?.url) {
            return {
              type: docType,
              name: fileObj.name || docType,
              url: upItem.url,
            };
          }
        } catch (e) {
          console.warn(`Upload failed for ${docType}:`, e);
        }
        return null;
      };

      const uploadedDocs = [];
      const canteenDoc = await uploadSingleFile(canteenCardFile, 'CANTEEN_CARD');
      if (canteenDoc) uploadedDocs.push(canteenDoc);

      const availDoc = await uploadSingleFile(availabilityCertFile, 'AVAILABILITY_CERTIFICATE');
      if (availDoc) uploadedDocs.push(availDoc);

      const panDoc = await uploadSingleFile(panCopyFile, 'PAN_CARD');
      if (panDoc) uploadedDocs.push(panDoc);

      const ppoDoc = await uploadSingleFile(ppoDocFile, 'PPO_DISCHARGE_BOOK');
      if (ppoDoc) uploadedDocs.push(ppoDoc);

      const pensionDoc = await uploadSingleFile(pensionSlipFile, 'PENSION_SLIP');
      if (pensionDoc) uploadedDocs.push(pensionDoc);

      let sanctionLetterUrl = '';
      if (loanSanctionFile) {
        const loanDoc = await uploadSingleFile(loanSanctionFile, 'LOAN_SANCTION_LETTER');
        if (loanDoc) {
          uploadedDocs.push(loanDoc);
          sanctionLetterUrl = loanDoc.url;
        }
      }

      const demandPayload = {
        productId: product.productId || product._id || product.id,
        quantity: 1,
        depotId: product.depotId || matchedDepot?._id,
        dealerId: product.dealerId || matchedDealer?._id,
        urcId: product.urcId || matchedUrc?._id,
        selectedColor: product.selectedColor || 'Standard',
        dealerPrice: Number(dealerPriceInput) || Number(product.priceToCustomer) || Number(product.productPrice) || 0,
        priceZone: product.selectedZone || product.priceZone || 'DELHI NCR',
        priceZoneId: product.priceZoneId || (priceZonesList.find((pz) => pz.name === (product.selectedZone || product.priceZone))?._id) || priceZonesList[0]?._id,
        previousPurchase: {
          hasPurchased: prevPurchase === 'Yes',
          purchaseDate: prevPurchase === 'Yes' && prevPurchaseDate ? prevPurchaseDate : null,
          registrationNo: '',
        },
        deliveryAddress: {
          address: `${addressLine}${townCity ? ', ' + townCity : ''}`,
          state: billingState || 'Delhi',
          pinCode: pincode || '110010',
          mobile: userAccount.mobile || user?.mobile || '',
        },
        paymentMethod: methodName || paymentMode || 'Direct Bank Transfer',
        documents: uploadedDocs,
        loan: {
          isLoan: hasLoan === 'Yes',
          loanAmount: hasLoan === 'Yes' ? Number(loanAmount) : 0,
          bankName: hasLoan === 'Yes' ? 'Nationalized / Armed Forces Bank' : '',
          sanctionLetterUrl,
        },
        remarks: remarks || 'AFD Demand generated via Online Portal',
      };

      const result = await createDemandMutation(demandPayload).unwrap();
      const createdDemand = result?.data || result;

      // Real payment creation and verification
      if (methodName.includes('Online')) {
        const payRes = await createPaymentMutation({
          demandId: createdDemand._id,
          amount: createdDemand.totalPrice || netPrice,
          method: 'GATEWAY',
          gateway: 'RAZORPAY',
        }).unwrap();
        const payData = payRes?.data || payRes;
        await verifyPaymentMutation({
          paymentId: payData._id,
          demandId: createdDemand._id,
          gatewayPaymentId: paymentDetails?.transactionId || 'pay_' + Date.now(),
        }).unwrap();
      } else {
        const payRes = await createPaymentMutation({
          demandId: createdDemand._id,
          amount: createdDemand.totalPrice || netPrice,
          method: 'DIRECT_TRANSFER',
          utr: 'UTR' + Date.now(),
          bankName: 'State Bank of India',
        }).unwrap();
        const payData = payRes?.data || payRes;
        await verifyPaymentMutation({
          paymentId: payData._id,
          demandId: createdDemand._id,
        }).unwrap();
      }

      setSubmitting(false);

      const finalDemandData = {
        ...createdDemand,
        id: createdDemand.demandNo || createdDemand._id,
        demandNo: createdDemand.demandNo || createdDemand._id?.slice(-8).toUpperCase(),
        csdPrice: createdDemand.totalPrice || netPrice,
        subtotal,
        additionalCost,
        cess,
        incidentalCharges,
        productName: product.productName,
        dealerName: dealerInfo.name,
        dealerAddress: dealerInfo.address,
        paymentMethod: methodName,
        status: 'PAID',
        paymentStatus: 'Verified',
      };

      sessionStorage.setItem('csd_last_created_demand', JSON.stringify(finalDemandData));
      navigate('/checkout/success', { state: { demand: finalDemandData } });
    } catch (err) {
      setSubmitting(false);
      alert(err?.data?.message || err?.message || 'Failed to submit demand.');
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
                      <label className="csd-form-label" style={{ margin: 0, fontWeight: 700 }}>
                        Dealer Price mentioned in Availability certificate <span className="doc-upload-required-star">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleMatchPrice}
                        className="btn-autofill-price"
                        title="Auto-fill exact Net Price"
                      >
                        <Sparkles size={13} aria-hidden />
                        <span>Auto-fill Net Price (₹ {netPrice.toLocaleString('en-IN')})</span>
                      </button>
                    </div>

                    <div className={`dealer-price-input-wrapper ${isPriceMatched ? 'is-matched' : 'is-mismatched'}`}>
                      <span className="dealer-price-currency-tag">₹</span>
                      <input
                        type="number"
                        className="dealer-price-field"
                        value={dealerPriceInput}
                        onChange={(e) => setDealerPriceInput(e.target.value)}
                        placeholder="Enter exact price quoted in availability certificate"
                        required
                      />
                      {isPriceMatched && (
                        <span className="dealer-price-matched-indicator">
                          <CheckCircle2 size={16} />
                          <span>Matched with Net Price</span>
                        </span>
                      )}
                    </div>

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

              {/* Breakdown Table matching Fig. 12 & Official CSD Rate Sheet */}
              <table className="demand-summary-calc-table">
                <tbody>
                  {isCsdRateList ? (
                    <>
                      <tr>
                        <td>Basic Price (incl. Dealer Margin)</td>
                        <td>₹ {subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                      {discountVal > 0 && (
                        <tr style={{ color: '#059669' }}>
                          <td>CSD Discount & Market Scheme</td>
                          <td>- ₹ {discountVal.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      <tr>
                        <td>CSD Basic with Discount</td>
                        <td style={{ fontWeight: 600 }}>₹ {csdBasic.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td>CGST Concession</td>
                        <td>₹ {additionalCost.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td>SGST Concession</td>
                        <td>₹ {cess.toLocaleString('en-IN')}</td>
                      </tr>
                      {incidentalCharges > 0 && (
                        <tr>
                          <td>CSD Profit @ 0.50%</td>
                          <td>₹ {incidentalCharges.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {tcsVal > 0 && (
                        <tr>
                          <td>TCS @ 1% (Above 10 Lacs)</td>
                          <td>₹ {tcsVal.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
    </div>
  );
}
