import React, { useState } from 'react';
import { X, Landmark, AlertCircle, CheckCircle2, Upload, FileText } from 'lucide-react';
import { DocumentUpload } from '../common/DocumentUpload.jsx';

export function PaymentDetailsModal({
  isOpen,
  onClose,
  onSubmitPayment,
  onSubmitSuccess,
  demand,
  loading = false
}) {
  const isLoan = Boolean(demand?.hasLoan || demand?.loan?.isLoan);
  const totalAmount = Number(demand?.totalAmount || demand?.totalPrice || demand?.csdPrice || demand?.total || demand?.netPrice || demand?.unitPrice || 0);

  // Beneficiary Self Account
  const [selfBank, setSelfBank] = useState('');
  const [selfHolder, setSelfHolder] = useState(demand?.beneficiaryName || '');
  const [selfAccount, setSelfAccount] = useState('');
  const [selfIfsc, setSelfIfsc] = useState('');
  const [selfUtr, setSelfUtr] = useState('');
  const [selfAmount, setSelfAmount] = useState(isLoan ? (totalAmount - (demand?.loanAmount || 0)).toString() : totalAmount.toString());
  const [selfDate, setSelfDate] = useState(new Date().toISOString().split('T')[0]);

  // Loan Account (if applicable)
  const [loanBank, setLoanBank] = useState('');
  const [loanHolder, setLoanHolder] = useState(demand?.beneficiaryName || '');
  const [loanAccount, setLoanAccount] = useState('');
  const [loanIfsc, setLoanIfsc] = useState('');
  const [loanUtr, setLoanUtr] = useState('');
  const [loanAmount, setLoanAmount] = useState(demand?.loanAmount ? demand.loanAmount.toString() : '');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Receipt Document
  const [receiptFile, setReceiptFile] = useState(null);

  const [errorAlert, setErrorAlert] = useState('');

  if (!isOpen || !demand) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorAlert('');

    const paidSelf = Number(selfAmount) || 0;
    const paidLoan = isLoan ? (Number(loanAmount) || 0) : 0;
    const combinedPaid = paidSelf + paidLoan;

    // Fig. 22 Validation: Total amount paid is less than price of the item.
    if (combinedPaid < totalAmount) {
      setErrorAlert('Total amount paid is less than price of the item. Payment details can not be uploaded.');
      return;
    }

    if (!selfBank || !selfAccount || !selfIfsc || !selfUtr) {
      setErrorAlert('Please fill all required banking fields (Bank Name, Account, IFSC, UTR).');
      return;
    }

    if (isLoan && (!loanBank || !loanAccount || !loanIfsc || !loanUtr)) {
      setErrorAlert('Please fill all required loan banking fields (Bank Name, Account, IFSC, UTR).');
      return;
    }

    const callback = onSubmitSuccess || onSubmitPayment;
    if (callback) {
      callback({
      demandId: demand._id || demand.id,
      selfAccount: {
        bank: selfBank,
        holder: selfHolder,
        account: selfAccount,
        ifsc: selfIfsc,
        utr: selfUtr,
        amount: paidSelf,
        date: selfDate
      },
      loanAccount: isLoan ? {
        bank: loanBank,
        holder: loanHolder,
        account: loanAccount,
        ifsc: loanIfsc,
        utr: loanUtr,
        amount: paidLoan,
        date: loanDate
      } : null,
      receiptFile,
      totalPaid: combinedPaid,
      updatedStatus: 'Processing'
    });
    }
  };

  return (
    <div
      className="csd-modal-backdrop"
      onClick={onClose}
    >
      <div
        className={`csd-modal-window ${isLoan ? 'large' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="csd-modal-header">
          <div className="modal-header-with-icon">
            <Landmark size={20} color="#1e4fd8" />
            <h3 className="csd-modal-title">
              Details of Payment made to CSD
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="csd-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="csd-modal-body">
          {/* Target Amount Banner */}
          <div className="confirm-net-price-box mb-1">
            <div>
              <span className="price-box-title">DEMAND ITEM PRICE</span>
              <div className="price-box-amount">
                ₹ {totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="price-box-meta">
              Demand No: <strong>{demand.id}</strong><br />
              Product: <strong>{demand.productName || 'Four-Wheeler'}</strong>
            </div>
          </div>

          <form id="payment-details-form" onSubmit={handleSubmit}>
            <div className={isLoan ? 'checkout-form-row-2' : ''}>
              {/* Column 1: Payment from Beneficiary Self Account (Fig. 21) */}
              <div className="beneficiary-field-box bg-white">
                <div className="account-type-badge">
                  Payment from Beneficiary Self Account
                </div>

                <div className="checkout-form-stack">
                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Name of Bank: <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="csd-form-input"
                      placeholder="e.g. State Bank of India"
                      value={selfBank}
                      onChange={(e) => setSelfBank(e.target.value)}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Name of First Account Holder: <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="csd-form-input"
                      value={selfHolder}
                      onChange={(e) => setSelfHolder(e.target.value)}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Bank Account Number: <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="csd-form-input"
                      placeholder="e.g. 10293847561"
                      value={selfAccount}
                      onChange={(e) => setSelfAccount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      IFSC Code: <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="csd-form-input"
                      placeholder="e.g. SBIN0001234"
                      value={selfIfsc}
                      onChange={(e) => setSelfIfsc(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      UTR Number: <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="csd-form-input"
                      placeholder="e.g. CMS2024101490218"
                      value={selfUtr}
                      onChange={(e) => setSelfUtr(e.target.value)}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Amount paid: <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="number"
                      className="csd-form-input"
                      value={selfAmount}
                      onChange={(e) => setSelfAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="csd-form-group">
                    <label className="csd-form-label">
                      Date of Payment: <span className="doc-upload-required-star">*</span>
                    </label>
                    <input
                      type="date"
                      className="csd-form-input"
                      value={selfDate}
                      onChange={(e) => setSelfDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Payment from loan account (if loan availed) */}
              {isLoan && (
                <div className="beneficiary-field-box bg-white">
                  <div className="account-type-badge">
                    Payment from loan account
                  </div>

                  <div className="checkout-form-stack">
                    <div className="csd-form-group">
                      <label className="csd-form-label">
                        Name of bank: <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="csd-form-input"
                        placeholder="e.g. HDFC Bank Ltd."
                        value={loanBank}
                        onChange={(e) => setLoanBank(e.target.value)}
                        required
                      />
                    </div>

                    <div className="csd-form-group">
                      <label className="csd-form-label">
                        Name of First Account holder: <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="csd-form-input"
                        value={loanHolder}
                        onChange={(e) => setLoanHolder(e.target.value)}
                        required
                      />
                    </div>

                    <div className="csd-form-group">
                      <label className="csd-form-label">
                        Bank Account Number: <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="csd-form-input"
                        value={loanAccount}
                        onChange={(e) => setLoanAccount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="csd-form-group">
                      <label className="csd-form-label">
                        IFSC Code: <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="csd-form-input"
                        value={loanIfsc}
                        onChange={(e) => setLoanIfsc(e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    <div className="csd-form-group">
                      <label className="csd-form-label">
                        UTR Number: <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="csd-form-input"
                        value={loanUtr}
                        onChange={(e) => setLoanUtr(e.target.value)}
                        required
                      />
                    </div>

                    <div className="csd-form-group">
                      <label className="csd-form-label">
                        Amount paid: <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="number"
                        className="csd-form-input"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="csd-form-group">
                      <label className="csd-form-label">
                        Date of Payment: <span className="doc-upload-required-star">*</span>
                      </label>
                      <input
                        type="date"
                        className="csd-form-input"
                        value={loanDate}
                        onChange={(e) => setLoanDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Receipt Upload */}
            <div className="mt-125">
              <DocumentUpload
                label="Bank Payment Receipt / Cyber Treasury Counterfoil"
                required
                file={receiptFile}
                onFileSelect={setReceiptFile}
                onFileRemove={() => setReceiptFile(null)}
                helperText="Upload official stamped bank challan or cyber NEFT/RTGS transaction PDF/JPG"
              />
            </div>

            {/* Fig. 22 Alert */}
            {errorAlert && (
              <div className="csd-alert-banner error mt-1">
                <AlertCircle size={16} flexShrink={0} />
                <span>{errorAlert}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer buttons matching Fig. 21 / 22 */}
        <div className="csd-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-action btn-modal-close"
          >
            CLOSE
          </button>
          <button
            type="submit"
            form="payment-details-form"
            className="btn-modal-submit-red"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'SUBMIT'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailsModal;
