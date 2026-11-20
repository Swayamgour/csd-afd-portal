import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, FileText, RefreshCw, XCircle } from 'lucide-react';

import { useGetDemandByIdQuery, useResubmitDemandMutation } from '../redux/api/demandApi.js';
import { useUploadFileMutation } from '../redux/api/beneficiaryApi.js';
import { useGetAvailableStatesQuery } from '../redux/api/orgApi.js';
import { INDIAN_STATES, PAY_LEVELS } from '../utils/locations.js';
import { canResubmit, demandAmount, getRejectionReason, upper } from '../utils/demandStatus.js';
import { uploadAndMergeDocuments } from '../utils/uploadDemandDocs.js';
import { getErrorMessage } from '../utils/apiError.js';
import Loader from '../components/common/Loader.jsx';
import CheckoutAdditionalInfoCard from '../components/checkout/CheckoutAdditionalInfoCard.jsx';
import CheckoutWorkflowNotice from '../components/checkout/CheckoutWorkflowNotice.jsx';

const DOC_LABELS = {
  CANTEEN_CARD: 'Canteen Card copy',
  PAN_COPY: 'PAN copy',
  AVAILABILITY_CERTIFICATE: 'Availability certificate',
  PPO_DISCHARGE_BOOK: 'PPO / Discharge Book / Release Order',
  LAST_PENSION_SLIP: 'Last Pension slip',
  LOAN_SANCTION_LETTER: 'Loan Sanction Letter',
};
const REQUIRED_DOCS = ['CANTEEN_CARD', 'PAN_COPY', 'AVAILABILITY_CERTIFICATE'];

const toDateInput = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

/**
 * Beneficiary corrects the form / documents after the depot rejected the demand (with a remark)
 * and sends it back to the depot for approval again.
 */
export default function ResubmitDemand() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, isError } = useGetDemandByIdQuery(id);
  const demand = raw?.data || raw;

  const [resubmitDemand] = useResubmitDemandMutation();
  const [uploadFile] = useUploadFileMutation();
  const { data: backendStates = [] } = useGetAvailableStatesQuery();

  // ---- form state (prefilled from the rejected demand) ----
  const [prevPurchase, setPrevPurchase] = useState('No');
  const [prevPurchaseDate, setPrevPurchaseDate] = useState('');
  const [payLevel, setPayLevel] = useState('3A');
  const [addressLine, setAddressLine] = useState('');
  const [townCity, setTownCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [billingState, setBillingState] = useState('');
  const [dealerPriceInput, setDealerPriceInput] = useState('');
  const [hasLoan, setHasLoan] = useState('No');
  const [loanAmount, setLoanAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('DIRECT_BANK_TRANSFER');
  const [onlineChannel, setOnlineChannel] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ownAccountCertified, setOwnAccountCertified] = useState(false);
  const [undertakingAccepted, setUndertakingAccepted] = useState(false);
  const [remarks, setRemarks] = useState('');

  const [files, setFiles] = useState({});
  const setFile = (type) => (f) => setFiles((p) => ({ ...p, [type]: f }));

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!demand || hydrated) return;
    const a = demand.deliveryAddress || {};
    setAddressLine(a.address || '');
    setTownCity(a.city || '');
    setPincode(a.pinCode || a.pincode || '');
    setBillingState(a.state || '');
    setPayLevel(demand.payLevel || '3A');
    setPrevPurchase(demand.previousPurchase?.hasPurchased ? 'Yes' : 'No');
    setPrevPurchaseDate(toDateInput(demand.previousPurchase?.purchaseDate));
    setDealerPriceInput(demand.dealerPrice ? String(demand.dealerPrice) : '');
    setHasLoan(demand.loan?.isLoan ? 'Yes' : 'No');
    setLoanAmount(demand.loan?.loanAmount ? String(demand.loan.loanAmount) : '');
    const pm = upper(demand.paymentMethod);
    setPaymentMode(pm === 'ONLINE_PAYMENT' ? 'ONLINE_PAYMENT' : 'DIRECT_BANK_TRANSFER');
    setOnlineChannel(demand.onlinePayment?.channel || '');
    setAccountHolderName(demand.onlinePayment?.accountHolderName || '');
    setRemarks(demand.remarks || '');
    setHydrated(true);
  }, [demand, hydrated]);

  const existingDocs = useMemo(() => {
    const m = {};
    (demand?.documents || []).forEach((d) => { if (d?.type) m[d.type] = d; });
    return m;
  }, [demand]);

  const netPrice = demand ? demandAmount(demand) : 0;
  const enteredDealerPrice = Number(dealerPriceInput) || 0;
  const isPriceMatched = enteredDealerPrice === netPrice && netPrice > 0;
  const rejectionReason = getRejectionReason(demand);
  const demandNo = demand?.demandNo || String(demand?._id || id).slice(-8).toUpperCase();

  if (isLoading) return <Loader label="Loading demand..." />;
  if (isError || !demand) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-card p-5 text-center">
          <AlertCircle size={36} className="text-danger mx-auto mb-2" />
          <h2>Demand could not be loaded</h2>
          <Link to="/demands" className="btn-primary-action inline-flex mx-auto">Back to Demands</Link>
        </div>
      </div>
    );
  }
  if (!canResubmit(demand)) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-card p-5 text-center">
          <AlertCircle size={36} className="text-danger mx-auto mb-2" />
          <h2>This demand cannot be resubmitted</h2>
          <p className="muted">Only rejected demands without a payment can be edited and resubmitted.</p>
          <Link to={`/demands/${encodeURIComponent(id)}`} className="btn-primary-action inline-flex mx-auto">Back to Demand</Link>
        </div>
      </div>
    );
  }

  const hasDoc = (type) => Boolean(files[type] || existingDocs[type]);

  const validate = () => {
    const errs = {};
    if (prevPurchase === 'Yes' && !prevPurchaseDate) errs.prevPurchaseDate = 'Date of last purchase of Ibid item is required.';
    if (!addressLine.trim()) errs.addressLine = 'Address for registration is required.';
    if (!townCity.trim()) errs.townCity = 'Town / City is required.';
    if (!/^\d{6}$/.test(pincode.trim())) errs.pincode = 'Valid 6-digit PIN Code is required.';
    if (!billingState) errs.billingState = 'Please select Billing State.';

    if (!hasDoc('CANTEEN_CARD')) errs.canteenCard = 'Canteen Card copy upload is required.';
    if (!hasDoc('PAN_COPY')) errs.panCopy = 'PAN copy upload is required.';
    if (!hasDoc('AVAILABILITY_CERTIFICATE')) errs.availabilityCert = 'Availability certificate upload is required.';

    if (!enteredDealerPrice) errs.dealerPrice = 'Billing Dealer Price mentioned in Availability certificate is a required field.';
    else if (enteredDealerPrice !== netPrice) errs.dealerPrice = 'Dealer Price and Net Price to be Paid must be the same.';

    if (hasLoan === 'Yes') {
      const l = Number(loanAmount) || 0;
      if (l <= 0) errs.loanAmount = 'Please enter valid loan sanctioned amount.';
      if (l > netPrice) errs.loanAmount = 'Loan amount cannot exceed total net payable price.';
      if (paymentMode !== 'DIRECT_BANK_TRANSFER') errs.paymentMode = 'With a loan, payment must be made by Direct Bank Transfer.';
      if (!hasDoc('LOAN_SANCTION_LETTER')) errs.loanSanction = 'Bank loan sanction letter upload is required.';
    } else if (paymentMode === 'ONLINE_PAYMENT') {
      if (!onlineChannel) errs.onlineChannel = 'Select how the payment will be made.';
      if (onlineChannel === 'NETBANKING_UPI_CHALLAN') {
        if (accountHolderName.trim().length < 3) errs.accountHolderName = 'Name of the first account holder is required.';
        if (!/^\d{9,18}$/.test(bankAccountNumber)) errs.bankAccountNumber = 'Enter a valid bank account number (9-18 digits).';
      }
      if (!ownAccountCertified) errs.ownAccountCertified = 'Please certify that the payment is made from your own account.';
    }
    if (!undertakingAccepted) errs.undertaking = 'You must accept the undertaking to resubmit the demand.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    try {
      const documents = await uploadAndMergeDocuments(uploadFile, demand.documents || [], {
        CANTEEN_CARD: files.CANTEEN_CARD,
        PAN_COPY: files.PAN_COPY,
        AVAILABILITY_CERTIFICATE: files.AVAILABILITY_CERTIFICATE,
        PPO_DISCHARGE_BOOK: files.PPO_DISCHARGE_BOOK,
        LAST_PENSION_SLIP: files.LAST_PENSION_SLIP,
        LOAN_SANCTION_LETTER: files.LOAN_SANCTION_LETTER,
      });
      const sanction = documents.find((d) => d.type === 'LOAN_SANCTION_LETTER');
      const isLoan = hasLoan === 'Yes';
      await resubmitDemand({
        id: demand._id || demand.id || id,
        dealerPrice: enteredDealerPrice,
        payLevel,
        previousPurchase: {
          hasPurchased: prevPurchase === 'Yes',
          purchaseDate: prevPurchase === 'Yes' && prevPurchaseDate ? prevPurchaseDate : null,
          registrationNo: demand.previousPurchase?.registrationNo || '',
        },
        deliveryAddress: {
          ...(demand.deliveryAddress || {}),
          address: addressLine.trim(),
          city: townCity.trim(),
          state: billingState,
          pinCode: pincode.trim(),
        },
        paymentMethod: isLoan ? 'DIRECT_BANK_TRANSFER' : paymentMode,
        documents,
        loan: {
          isLoan,
          loanAmount: isLoan ? Number(loanAmount) : 0,
          bankName: isLoan ? demand.loan?.bankName || 'Nationalized / Armed Forces Bank' : '',
          sanctionLetterUrl: isLoan ? sanction?.url || '' : '',
        },
        onlinePayment:
          !isLoan && paymentMode === 'ONLINE_PAYMENT'
            ? {
                channel: onlineChannel,
                accountHolderName: onlineChannel === 'NETBANKING_UPI_CHALLAN' ? accountHolderName.trim() : undefined,
                bankAccountNumber: onlineChannel === 'NETBANKING_UPI_CHALLAN' ? bankAccountNumber : undefined,
                ownAccountCertified,
              }
            : undefined,
        undertakingAccepted,
        remarks: remarks || undefined,
      }).unwrap();
      navigate(`/demands/${encodeURIComponent(demand._id || demand.id || id)}`, { replace: true });
    } catch (err) {
      setSubmitError(getErrorMessage(err, err?.message || 'Failed to resubmit demand.'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const uploadedList = Object.keys(DOC_LABELS).filter((t) => existingDocs[t]);

  return (
    <div className="checkout-page-container">
      <Link to={`/demands/${encodeURIComponent(id)}`} className="checkout-breadcrumb-link inline-flex align-center gap-1 mb-2">
        <ArrowLeft size={16} /> Back to Demand
      </Link>

      <div className="checkout-header-section">
        <h1 className="checkout-page-heading">Edit &amp; Resubmit Demand #{demandNo}</h1>
        <p className="checkout-page-subheading">
          Correct the details / documents the depot asked for and send the demand back for approval.
        </p>
      </div>

      <div className="csd-alert-banner danger mb-4">
        <XCircle size={20} className="alert-banner-icon" />
        <div>
          <strong>Rejected by depot</strong>
          <p className="mb-0 text-xs">Reason / remark: {rejectionReason || 'No remark was provided by the depot.'}</p>
        </div>
      </div>

      {submitError && (
        <div className="csd-alert-banner danger mb-4" role="alert">
          <AlertCircle size={20} className="alert-banner-icon" />
          <span>{submitError}</span>
        </div>
      )}

      {uploadedList.length > 0 && (
        <div className="checkout-card mb-4">
          <div className="checkout-card-header">
            <div className="checkout-card-title"><FileText size={18} /> <span>Documents already submitted</span></div>
            <p className="csd-form-helper-text">Upload a new file below only for the documents you want to replace.</p>
          </div>
          <ul className="resubmit-doc-list">
            {uploadedList.map((t) => (
              <li key={t}>
                <strong>{DOC_LABELS[t]}</strong>{' '}
                {existingDocs[t].url ? <a href={existingDocs[t].url} target="_blank" rel="noreferrer">{existingDocs[t].name || 'View'}</a> : existingDocs[t].name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="checkout-left-column">
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
            country="India"
            canteenCardFile={files.CANTEEN_CARD || null}
            setCanteenCardFile={setFile('CANTEEN_CARD')}
            panCopyFile={files.PAN_COPY || null}
            setPanCopyFile={setFile('PAN_COPY')}
            availabilityCertFile={files.AVAILABILITY_CERTIFICATE || null}
            setAvailabilityCertFile={setFile('AVAILABILITY_CERTIFICATE')}
            dealerPriceInput={dealerPriceInput}
            setDealerPriceInput={setDealerPriceInput}
            handleMatchPrice={() => setDealerPriceInput(String(netPrice))}
            isPriceMatched={isPriceMatched}
            netPrice={netPrice}
            enteredDealerPrice={enteredDealerPrice}
            ppoDocFile={files.PPO_DISCHARGE_BOOK || null}
            setPpoDocFile={setFile('PPO_DISCHARGE_BOOK')}
            pensionSlipFile={files.LAST_PENSION_SLIP || null}
            setPensionSlipFile={setFile('LAST_PENSION_SLIP')}
            hasLoan={hasLoan}
            setHasLoan={setHasLoan}
            loanAmount={loanAmount}
            setLoanAmount={setLoanAmount}
            loanSanctionFile={files.LOAN_SANCTION_LETTER || null}
            setLoanSanctionFile={setFile('LOAN_SANCTION_LETTER')}
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

          <button type="submit" className="btn-submit-demand" disabled={submitting || !isPriceMatched}>
            <RefreshCw size={16} /> {submitting ? 'Resubmitting...' : 'Resubmit Demand for Depot Approval'}
          </button>
          {!isPriceMatched && (
            <p className="csd-form-error-text error-text-center">
              ⚠ Dealer Price must match the Net Price (₹ {Number(netPrice).toLocaleString('en-IN')}).
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
