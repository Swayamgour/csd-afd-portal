import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

import { useCreateDemandMutation } from '../redux/api/demandApi.js';
import { useGetMyProfileQuery, useUploadFileMutation } from '../redux/api/beneficiaryApi.js';
import { useGetDepotsQuery, useGetDealersQuery, useGetUrcsQuery, useGetPriceZonesQuery, useGetAvailableStatesQuery } from '../redux/api/orgApi.js';
import { INDIAN_STATES, PAY_LEVELS } from '../utils/locations.js';
import CheckoutBreadcrumbs from '../components/checkout/CheckoutBreadcrumbs.jsx';
import CheckoutBeneficiaryCard from '../components/checkout/CheckoutBeneficiaryCard.jsx';
import CheckoutAdditionalInfoCard from '../components/checkout/CheckoutAdditionalInfoCard.jsx';
import CheckoutWorkflowNotice from '../components/checkout/CheckoutWorkflowNotice.jsx';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary.jsx';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profileData } = useGetMyProfileQuery();
  const [createDemandMutation, { isLoading: isCreatingDemand }] = useCreateDemandMutation();
  const [uploadFileMutation] = useUploadFileMutation();

  const { data: backendStates = [] } = useGetAvailableStatesQuery();
  const { data: priceZonesList = [] } = useGetPriceZonesQuery();
  const { data: depotsList = [] } = useGetDepotsQuery();
  const { data: dealersList = [] } = useGetDealersQuery();
  const { data: urcsList = [] } = useGetUrcsQuery();

  // Load product selection strictly from location state or sessionStorage
  const [productData] = useState(() => {
    if (location.state?.productData) return location.state.productData;
    const saved = sessionStorage.getItem('csd_checkout_product');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const product = productData;

  const isPendingApproval = user?.role === 'BENEFICIARY' && (
    profileData?.verificationStatus === 'PENDING' ||
    user?.verificationStatus === 'PENDING' ||
    user?.status === 'Pending' ||
    user?.status === 'PENDING'
  );

  const prof = profileData || {};
  const userAccount = prof.userId || user || {};

  // Beneficiary Pre-filled Details (From Real Database Profile)
  const beneficiary = {
    priceZone: product?.selectedZone || '',
    depot: product?.selectedDepot || '',
    urc: product?.selectedUrc || '',
    email: userAccount.email || '',
    username: prof.serviceNumber || userAccount.username || '',
    name: prof.name || userAccount.name || '',
    groceryCardNumber: prof.cardId || '',
    chipNumber: prof.chipNumber || '',
    phone: userAccount.mobile || prof.mobile || '',
    employmentStatus: prof.employmentStatus || 'SERVING',
    organization: prof.organization || 'Indian Armed Forces',
    dateOfBirth: prof.dob ? new Date(prof.dob).toLocaleDateString('en-IN') : '',
    dateOfEnrollment: prof.dateOfEnrollment ? new Date(prof.dateOfEnrollment).toLocaleDateString('en-IN') : '',
    dateOfRetirement: prof.dateOfRetirement ? new Date(prof.dateOfRetirement).toLocaleDateString('en-IN') : '',
    entitlementCategory: prof.entitlement || 'AFD-I & AFD-II Standard',
    ppoNumber: prof.ppo || '',
    panNumber: prof.pan || ''
  };

  // Financial Calculations
  const isCsdRateList = Boolean(product?.basicPrice || product?.priceToCustomer);
  // subtotal = Sale Price (or Base Price when there is no sale price); GST / incidental / TCS are added on it
  const subtotal = product?.basicPrice || product?.productPrice || 0;
  const additionalCost = isCsdRateList ? (product?.cgstAmount || 0) : Math.round(subtotal * 0.14);
  const cess = isCsdRateList ? (product?.sgstAmount || 0) : Math.round(subtotal * 0.17);
  const incidentalCharges = isCsdRateList ? (product?.csdProfitAmount || 0) : Math.round(subtotal * 0.005);
  const tcsVal = product?.tcsAmount || 0;
  const netPrice = product?.priceToCustomer || (subtotal + additionalCost + cess + incidentalCharges + tcsVal);

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
  const [dealerPriceInput, setDealerPriceInput] = useState('');
  const [ppoDocFile, setPpoDocFile] = useState(null);
  const [pensionSlipFile, setPensionSlipFile] = useState(null);

  // Payment mode (manual: Online Payment only when no loan; Direct Bank Transfer otherwise)
  const [paymentMode, setPaymentMode] = useState('DIRECT_BANK_TRANSFER');

  // Online payment details (asked only when no loan + Online Payment)
  const [onlineChannel, setOnlineChannel] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ownAccountCertified, setOwnAccountCertified] = useState(false);
  const [undertakingAccepted, setUndertakingAccepted] = useState(false);

  // Loan Section
  const [hasLoan, setHasLoan] = useState('No');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanSanctionFile, setLoanSanctionFile] = useState(null);

  // Remarks & Submission states
  const [remarks, setRemarks] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If no product in state or session, show clean empty state
  if (!product) {
    return (
      <div className="checkout-page-container text-center py-5">
        <div className="checkout-card p-5 text-center">
          <AlertCircle size={40} className="text-danger mx-auto mb-2" />
          <h2>No Product Selected for Checkout</h2>
          <p className="muted mb-4">Please select a product and procurement specification from the catalogue before proceeding.</p>
          <Link to="/products" className="btn-primary-action inline-flex mx-auto">
            Browse Catalogue
          </Link>
        </div>
      </div>
    );
  }

  // Fig. 16, 17, 18: Price validation between Dealer Price and Net Price
  const enteredDealerPrice = Number(dealerPriceInput) || 0;
  const isPriceMatched = enteredDealerPrice === netPrice;

  // Matched dealer object for address display from live org API
  const dealerInfo = dealersList.find((d) => d.name === product.selectedDealer || d._id === product.dealerId) || dealersList[0] || {
    name: product.selectedDealer || 'Authorized Dealer',
    address: 'CSD Authorized Dealer Address'
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

    if (isPendingApproval) {
      alert('Your account is pending approval. Demand generation is unavailable until approval.');
      return false;
    }

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
    if (!['DIRECT_BANK_TRANSFER', 'ONLINE_PAYMENT'].includes(paymentMode)) errs.paymentMode = 'Select a payment mode.';

    // Dealer Price Validation (Fig. 16 & 18)
    if (!dealerPriceInput || enteredDealerPrice === 0) {
      errs.dealerPrice = 'Billing Dealer Price mentioned in Availability certificate is a required field.';
    } else if (enteredDealerPrice !== netPrice) {
      errs.dealerPrice = 'Dealer Price and Net Price to be Paid must be the same.';
    }

    // Online payment details (only when no loan and Online Payment is chosen)
    if (hasLoan !== 'Yes' && paymentMode === 'ONLINE_PAYMENT') {
      if (!onlineChannel) errs.onlineChannel = 'Select how the payment will be made.';
      if (onlineChannel === 'NETBANKING_UPI_CHALLAN') {
        if (accountHolderName.trim().length < 3) errs.accountHolderName = 'Name of the first account holder is required.';
        if (!/^\d{9,18}$/.test(bankAccountNumber)) errs.bankAccountNumber = 'Enter a valid bank account number (9-18 digits).';
      }
      if (!ownAccountCertified) errs.ownAccountCertified = 'Please certify that the payment is made from your own account.';
    }
    if (!undertakingAccepted) errs.undertaking = 'You must accept the undertaking to submit the demand.';

    // Loan Validation
    if (hasLoan === 'Yes') {
      const lAmt = Number(loanAmount) || 0;
      if (lAmt <= 0) errs.loanAmount = 'Please enter valid loan sanctioned amount.';
      if (lAmt > netPrice) errs.loanAmount = 'Loan amount cannot exceed total net payable price.';
      if (paymentMode !== 'DIRECT_BANK_TRANSFER') errs.paymentMode = 'With a loan, payment must be made by Direct Bank Transfer.';
      if (!loanSanctionFile) errs.loanSanction = 'Bank loan sanction letter upload is required.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateCheckoutForm()) {
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    await executeDemandSubmission();
  };

  const executeDemandSubmission = async () => {
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
          throw new Error(`Upload failed for ${fileObj.name || docType}. Please retry.`);
        }
        throw new Error(`Upload failed for ${fileObj.name || docType}. Please retry.`);
      };

      const uploadedDocs = [];
      const canteenDoc = await uploadSingleFile(canteenCardFile, 'CANTEEN_CARD');
      if (canteenDoc) uploadedDocs.push(canteenDoc);

      const availDoc = await uploadSingleFile(availabilityCertFile, 'AVAILABILITY_CERTIFICATE');
      if (availDoc) uploadedDocs.push(availDoc);

      const panDoc = await uploadSingleFile(panCopyFile, 'PAN_COPY');
      if (panDoc) uploadedDocs.push(panDoc);

      const ppoDoc = await uploadSingleFile(ppoDocFile, 'PPO_DISCHARGE_BOOK');
      if (ppoDoc) uploadedDocs.push(ppoDoc);

      const pensionDoc = await uploadSingleFile(pensionSlipFile, 'LAST_PENSION_SLIP');
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
        dealerPrice: Number(dealerPriceInput),
        payLevel,
        priceZone: product.selectedZone || product.priceZone || product.selectedState || 'DELHI NCR',
        priceZoneId: product.priceZoneId || (priceZonesList.find((pz) => pz.name === (product.selectedZone || product.priceZone))?._id) || priceZonesList[0]?._id,
        state: product.selectedState || product.state || undefined,
        previousPurchase: {
          hasPurchased: prevPurchase === 'Yes',
          purchaseDate: prevPurchase === 'Yes' && prevPurchaseDate ? prevPurchaseDate : null,
          registrationNo: '',
        },
        deliveryAddress: {
          address: addressLine.trim(),
          city: townCity.trim(),
          state: billingState,
          pinCode: pincode.trim(),
          country,
          mobile: userAccount.mobile || user?.mobile || '',
        },
        paymentMethod: hasLoan === 'Yes' ? 'DIRECT_BANK_TRANSFER' : paymentMode,
        documents: uploadedDocs,
        loan: {
          isLoan: hasLoan === 'Yes',
          loanAmount: hasLoan === 'Yes' ? Number(loanAmount) : 0,
          bankName: hasLoan === 'Yes' ? 'Nationalized / Armed Forces Bank' : '',
          sanctionLetterUrl,
        },
        onlinePayment:
          hasLoan !== 'Yes' && paymentMode === 'ONLINE_PAYMENT'
            ? {
                channel: onlineChannel,
                accountHolderName: onlineChannel === 'NETBANKING_UPI_CHALLAN' ? accountHolderName.trim() : undefined,
                bankAccountNumber: onlineChannel === 'NETBANKING_UPI_CHALLAN' ? bankAccountNumber : undefined,
                ownAccountCertified,
              }
            : undefined,
        undertakingAccepted,
        remarks: remarks || undefined,
      };

      const result = await createDemandMutation(demandPayload).unwrap();
      const createdDemand = result?.data || result;

      setSubmitting(false);

      const finalDemandData = {
        ...createdDemand,
        id: createdDemand.demandNo || createdDemand._id,
        demandNo: createdDemand.demandNo || createdDemand._id?.slice(-8).toUpperCase(),
        csdPrice: createdDemand.totalAmount || createdDemand.totalPrice || netPrice,
        subtotal,
        additionalCost,
        cess,
        incidentalCharges,
        productName: product.productName,
        dealerName: dealerInfo.name,
        dealerAddress: dealerInfo.address,
        paymentMethod: demandPayload.paymentMethod,
        status: createdDemand.status || 'CREATED',
        paymentStatus: createdDemand.paymentStatus || 'UNPAID',
      };

      sessionStorage.setItem('csd_last_created_demand', JSON.stringify(finalDemandData));
      navigate('/checkout/success', { state: { demand: finalDemandData } });
    } catch (err) {
      setSubmitting(false);
      alert(err?.data?.error?.message || err?.data?.message || err?.message || 'Failed to submit demand.');
    }
  };

  return (
    <div className="checkout-page-container">
      <CheckoutBreadcrumbs />

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
          {/* LEFT COLUMN: Beneficiary details, required KYC documents & workflow */}
          <div className="checkout-left-column">
            <CheckoutBeneficiaryCard
              product={product}
              beneficiary={beneficiary}
            />

            <CheckoutAdditionalInfoCard
              prevPurchase={prevPurchase}
              setPrevPurchase={setPrevPurchase}
              prevPurchaseDate={prevPurchaseDate}
              setPrevPurchaseDate={setPrevPurchaseDate}
              payLevel={payLevel}
              setPayLevel={setPayLevel}
              payLevels={PAY_LEVELS}
              addressLine={addressLine}
              setAddressLine={setAddressLine}
              townCity={townCity}
              setTownCity={setTownCity}
              pincode={pincode}
              setPincode={setPincode}
              billingState={billingState}
              setBillingState={setBillingState}
              statesList={backendStates.length > 0 ? backendStates.map((s) => s.state || s) : INDIAN_STATES}
              country={country}
              canteenCardFile={canteenCardFile}
              setCanteenCardFile={setCanteenCardFile}
              panCopyFile={panCopyFile}
              setPanCopyFile={setPanCopyFile}
              availabilityCertFile={availabilityCertFile}
              setAvailabilityCertFile={setAvailabilityCertFile}
              dealerPriceInput={dealerPriceInput}
              setDealerPriceInput={setDealerPriceInput}
              handleMatchPrice={handleMatchPrice}
              isPriceMatched={isPriceMatched}
              netPrice={netPrice}
              enteredDealerPrice={enteredDealerPrice}
              ppoDocFile={ppoDocFile}
              setPpoDocFile={setPpoDocFile}
              pensionSlipFile={pensionSlipFile}
              setPensionSlipFile={setPensionSlipFile}
              hasLoan={hasLoan}
              setHasLoan={setHasLoan}
              loanAmount={loanAmount}
              setLoanAmount={setLoanAmount}
              loanSanctionFile={loanSanctionFile}
              setLoanSanctionFile={setLoanSanctionFile}
              setPaymentMode={setPaymentMode}
              formErrors={formErrors}
            />

            <CheckoutWorkflowNotice
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
              hasLoan={hasLoan}
              formErrors={formErrors}
              remarks={remarks}
              setRemarks={setRemarks}
              onlineChannel={onlineChannel}
              setOnlineChannel={setOnlineChannel}
              accountHolderName={accountHolderName}
              setAccountHolderName={setAccountHolderName}
              bankAccountNumber={bankAccountNumber}
              setBankAccountNumber={setBankAccountNumber}
              ownAccountCertified={ownAccountCertified}
              setOwnAccountCertified={setOwnAccountCertified}
              undertakingAccepted={undertakingAccepted}
              setUndertakingAccepted={setUndertakingAccepted}
            />
          </div>

          {/* RIGHT COLUMN: Payment Details / Summary */}
          <CheckoutOrderSummary
            product={product}
            dealerInfo={dealerInfo}
            isCsdRateList={isCsdRateList}
            subtotal={subtotal}
            additionalCost={additionalCost}
            cess={cess}
            incidentalCharges={incidentalCharges}
            tcsVal={tcsVal}
            netPrice={netPrice}
            isPriceMatched={isPriceMatched}
            submitting={submitting}
            isPendingApproval={isPendingApproval}
          />
        </div>
      </form>
    </div>
  );
}
