import React, { useState } from 'react';
import { Landmark, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import Button from './Button.jsx';
import { useUploadFileMutation } from '../../redux/api/beneficiaryApi.js';
import { useSubmitDirectTransferMutation } from '../../redux/api/paymentApi.js';

export default function InlinePaymentCard({ demand, onPaymentSubmitted, onCancel }) {
  const isLoan = Boolean(demand?.hasLoan || demand?.loan?.isLoan);
  const demandLoanAmount = Number(demand?.loan?.loanAmount || demand?.loanAmount || 0);
  const totalAmount = Number(
    demand?.totalAmount ||
    demand?.totalPrice ||
    demand?.csdPrice ||
    demand?.total ||
    demand?.netPrice ||
    demand?.unitPrice ||
    0
  );

  const [selfBank, setSelfBank] = useState('');
  const [selfHolder, setSelfHolder] = useState(demand?.beneficiaryName || demand?.customerName || '');
  const [selfAccount, setSelfAccount] = useState('');
  const [selfIfsc, setSelfIfsc] = useState('');
  const [selfUtr, setSelfUtr] = useState('');
  const [selfAmount, setSelfAmount] = useState(
    isLoan && demandLoanAmount
      ? (totalAmount - demandLoanAmount).toString()
      : totalAmount.toString()
  );
  const [selfDate, setSelfDate] = useState(new Date().toISOString().split('T')[0]);

  // Loan Account (if applicable)
  const [loanBank, setLoanBank] = useState('');
  const [loanHolder, setLoanHolder] = useState(demand?.beneficiaryName || demand?.customerName || '');
  const [loanAccount, setLoanAccount] = useState('');
  const [loanIfsc, setLoanIfsc] = useState('');
  const [loanUtr, setLoanUtr] = useState('');
  const [loanAmount, setLoanAmount] = useState(demandLoanAmount ? String(demandLoanAmount) : '');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Receipt Document
  const [receiptFile, setReceiptFile] = useState(null);
  const [errorAlert, setErrorAlert] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [uploadFileMutation] = useUploadFileMutation();
  const [submitDirectTransfer] = useSubmitDirectTransferMutation();

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const errs = {};
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    // 1. Remitting Bank Name
    if (!selfBank.trim()) {
      errs.selfBank = 'Remitting Bank Name is required';
    } else if (selfBank.trim().length < 2) {
      errs.selfBank = 'Please enter a valid bank name (min 2 characters)';
    }

    // 2. Name of First Account Holder
    if (!selfHolder.trim()) {
      errs.selfHolder = 'Name of First Account Holder is required';
    } else if (selfHolder.trim().length < 2) {
      errs.selfHolder = 'Please enter full account holder name';
    }

    // 3. Bank Account Number
    const accDigits = selfAccount.trim();
    if (!accDigits) {
      errs.selfAccount = 'Bank Account Number is required';
    } else if (!/^\d{5,20}$/.test(accDigits)) {
      errs.selfAccount = 'Account Number must contain only digits (5 to 20 digits)';
    }

    // 4. Bank IFSC Code
    const ifscVal = selfIfsc.trim().toUpperCase();
    if (!ifscVal) {
      errs.selfIfsc = 'Bank IFSC Code is required';
    } else if (!ifscRegex.test(ifscVal)) {
      errs.selfIfsc = 'Invalid IFSC code (e.g. SBIN0001234 - 11 characters, 5th character must be 0)';
    }

    // 5. Bank UTR / Transaction No.
    const utrVal = selfUtr.trim().toUpperCase();
    if (!utrVal) {
      errs.selfUtr = 'Bank UTR / Transaction No. is required';
    } else if (utrVal.length < 8 || utrVal.length > 25) {
      errs.selfUtr = 'UTR must be between 8 and 25 alphanumeric characters';
    } else if (!/^[A-Z0-9]+$/.test(utrVal)) {
      errs.selfUtr = 'UTR should contain only letters and numbers (no spaces or symbols)';
    }

    // 6. Amount Transferred
    const selfAmtNum = Number(selfAmount);
    if (!selfAmount || isNaN(selfAmtNum) || selfAmtNum <= 0) {
      errs.selfAmount = 'Please enter a valid transfer amount greater than 0';
    }

    // 7. Transfer Date
    if (!selfDate) {
      errs.selfDate = 'Transfer Date is required';
    } else {
      const d = new Date(selfDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (d > today) {
        errs.selfDate = 'Transfer Date cannot be in the future';
      }
    }

    // 8. Loan details validation
    if (isLoan) {
      if (!loanBank.trim()) {
        errs.loanBank = 'Financing Bank Name is required';
      }
      if (!loanHolder.trim()) {
        errs.loanHolder = 'Loan Account Holder Name is required';
      }
      const loanAccDigits = loanAccount.trim();
      if (!loanAccDigits) {
        errs.loanAccount = 'Loan Account Number is required';
      } else if (loanAccDigits.length < 5) {
        errs.loanAccount = 'Loan Account Number must be at least 5 characters';
      }
      const loanIfscVal = loanIfsc.trim().toUpperCase();
      if (!loanIfscVal) {
        errs.loanIfsc = 'Loan Bank IFSC is required';
      } else if (!ifscRegex.test(loanIfscVal)) {
        errs.loanIfsc = 'Invalid Loan IFSC code (e.g. PUNB0123456)';
      }
      const loanUtrVal = loanUtr.trim().toUpperCase();
      if (!loanUtrVal) {
        errs.loanUtr = 'Loan UTR / RTGS Ref is required';
      } else if (loanUtrVal.length < 8 || loanUtrVal.length > 25) {
        errs.loanUtr = 'Loan UTR must be between 8 and 25 alphanumeric characters';
      }
      const loanAmtNum = Number(loanAmount);
      if (!loanAmount || isNaN(loanAmtNum) || loanAmtNum <= 0) {
        errs.loanAmount = 'Please enter a valid loan disbursement amount';
      }
      if (!loanDate) {
        errs.loanDate = 'Disbursement Date is required';
      }
    }

    // 9. Combined amount check vs total payable
    const paidSelf = Number(selfAmount) || 0;
    const paidLoan = isLoan ? (Number(loanAmount) || 0) : 0;
    const combinedPaid = paidSelf + paidLoan;
    if (totalAmount > 0 && combinedPaid < totalAmount) {
      errs.combinedAmount = `Total recorded amount (₹${combinedPaid.toLocaleString('en-IN')}) is less than net payable price (₹${totalAmount.toLocaleString('en-IN')}).`;
    }

    // 10. Receipt Document Upload
    if (!receiptFile) {
      errs.receiptFile = 'Payment receipt upload is mandatory';
    } else {
      const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
      const ext = receiptFile.name?.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(ext)) {
        errs.receiptFile = 'Only PDF, JPG, JPEG, or PNG files are supported';
      } else if (receiptFile.size > 5 * 1024 * 1024) {
        errs.receiptFile = 'File size exceeds 5MB limit';
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert('');
    setSuccessMsg('');

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      if (formErrors.combinedAmount) {
        setErrorAlert(formErrors.combinedAmount);
      } else {
        setErrorAlert('Please check the form and fix the highlighted fields in red.');
      }
      return;
    }
    setErrors({});

    const paidSelf = Number(selfAmount) || 0;
    const paidLoan = isLoan ? (Number(loanAmount) || 0) : 0;
    const combinedPaid = paidSelf + paidLoan;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('files', receiptFile);
      const upRes = await uploadFileMutation(fd).unwrap();
      const item = Array.isArray(upRes) ? upRes[0] : upRes?.data?.[0] || upRes?.[0];
      const receiptUrl = item?.url;
      if (!receiptUrl) throw new Error('Receipt upload failed. Please try again.');

      const targetDemandId = demand._id || demand.id;
      const account = (bank, holder, acc, ifsc, utr, amt, date) => ({
        bankName: bank.trim(),
        accountHolder: holder.trim(),
        accountNumber: acc.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        utrNumber: utr.trim().toUpperCase(),
        amountPaid: Number(amt),
        paymentDate: date,
      });

      await submitDirectTransfer({
        demandId: targetDemandId,
        receiptUrl,
        self: account(selfBank, selfHolder, selfAccount, selfIfsc, selfUtr, selfAmount, selfDate),
        ...(isLoan ? { loan: account(loanBank, loanHolder, loanAccount, loanIfsc, loanUtr, loanAmount, loanDate) } : {}),
      }).unwrap();

      setSuccessMsg('Payment details submitted successfully! The depot will now verify the payment.');
      if (onPaymentSubmitted) {
        onPaymentSubmitted({
          demandId: targetDemandId,
          utr: selfUtr.toUpperCase(),
          bank: selfBank,
          amount: combinedPaid,
        });
      }
    } catch (err) {
      setErrorAlert(err?.data?.error?.message || err?.data?.message || err?.message || 'Failed to submit payment details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" id="payment-section" style={{ border: '2px solid var(--color-primary-light, #3b82f6)' }}>
      <div className="card-header between">
        <div>
          <h2 className="card-title flex items-center gap-2">
            <Landmark size={20} className="text-brand" />
            Upload Payment Details & Bank Transfer UTR
          </h2>
          <p className="card-subtitle">
            Transfer funds from entitled beneficiary bank account directly to CSD AFD account and record UTR
          </p>
        </div>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Close
          </Button>
        )}
      </div>

      <div className="card-body text-left">
        {errorAlert && (
          <div className="alert-banner error mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorAlert}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner success mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="text-left">
          {/* Beneficiary Self Account */}
          <div className="section mb-4 text-left">
            <h3 className="section-title text-sm uppercase tracking-wider text-slate-700 font-semibold mb-3 text-left">
              1. Beneficiary Bank Transfer Details
            </h3>
            <div className="form-grid text-left">
              <div className="form-group">
                <label className="form-label">Remitting Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India"
                  className={`form-control ${errors.selfBank ? 'has-error' : ''}`}
                  value={selfBank}
                  onChange={(e) => {
                    setSelfBank(e.target.value);
                    clearError('selfBank');
                  }}
                />
                {errors.selfBank && (
                  <span className="form-error-text">
                    <AlertCircle size={13} /> {errors.selfBank}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Name of First Account Holder *</label>
                <input
                  type="text"
                  placeholder="Account holder name"
                  className={`form-control ${errors.selfHolder ? 'has-error' : ''}`}
                  value={selfHolder}
                  onChange={(e) => {
                    setSelfHolder(e.target.value);
                    clearError('selfHolder');
                  }}
                />
                {errors.selfHolder && (
                  <span className="form-error-text">
                    <AlertCircle size={13} /> {errors.selfHolder}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Bank Account Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 10293847561"
                  className={`form-control font-mono ${errors.selfAccount ? 'has-error' : ''}`}
                  value={selfAccount}
                  onChange={(e) => {
                    setSelfAccount(e.target.value.replace(/\D/g, ''));
                    clearError('selfAccount');
                  }}
                />
                {errors.selfAccount && (
                  <span className="form-error-text">
                    <AlertCircle size={13} /> {errors.selfAccount}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Bank IFSC Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                  className={`form-control font-mono uppercase ${errors.selfIfsc ? 'has-error' : ''}`}
                  value={selfIfsc}
                  onChange={(e) => {
                    setSelfIfsc(e.target.value.toUpperCase());
                    clearError('selfIfsc');
                  }}
                />
                {errors.selfIfsc && (
                  <span className="form-error-text">
                    <AlertCircle size={13} /> {errors.selfIfsc}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Bank UTR / Transaction No. *</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN24012345678"
                  maxLength={25}
                  className={`form-control font-mono uppercase ${errors.selfUtr ? 'has-error' : ''}`}
                  value={selfUtr}
                  onChange={(e) => {
                    setSelfUtr(e.target.value.toUpperCase());
                    clearError('selfUtr');
                  }}
                />
                {errors.selfUtr ? (
                  <span className="form-error-text">
                    <AlertCircle size={13} /> {errors.selfUtr}
                  </span>
                ) : (
                  <span className="text-xs text-muted mt-1 block text-left">
                    Mandatory 12-22 digit UTR provided by your bank receipt
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Amount Transferred (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className={`form-control font-mono ${errors.selfAmount ? 'has-error' : ''}`}
                  value={selfAmount}
                  onChange={(e) => {
                    setSelfAmount(e.target.value);
                    clearError('selfAmount');
                  }}
                />
                {errors.selfAmount && (
                  <span className="form-error-text">
                    <AlertCircle size={13} /> {errors.selfAmount}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Date *</label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className={`form-control ${errors.selfDate ? 'has-error' : ''}`}
                  value={selfDate}
                  onChange={(e) => {
                    setSelfDate(e.target.value);
                    clearError('selfDate');
                  }}
                />
                {errors.selfDate && (
                  <span className="form-error-text">
                    <AlertCircle size={13} /> {errors.selfDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Loan Account Section (if applicable) */}
          {isLoan && (
            <div className="section mb-4 pt-3 border-t text-left">
              <h3 className="section-title text-sm uppercase tracking-wider text-slate-700 font-semibold mb-3 text-left">
                2. Bank Loan Disbursement Details
              </h3>
              <div className="form-grid text-left">
                <div className="form-group">
                  <label className="form-label">Financing Bank Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Punjab National Bank"
                    className={`form-control ${errors.loanBank ? 'has-error' : ''}`}
                    value={loanBank}
                    onChange={(e) => {
                      setLoanBank(e.target.value);
                      clearError('loanBank');
                    }}
                  />
                  {errors.loanBank && (
                    <span className="form-error-text">
                      <AlertCircle size={13} /> {errors.loanBank}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Account Holder Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.loanHolder ? 'has-error' : ''}`}
                    value={loanHolder}
                    onChange={(e) => {
                      setLoanHolder(e.target.value);
                      clearError('loanHolder');
                    }}
                  />
                  {errors.loanHolder && (
                    <span className="form-error-text">
                      <AlertCircle size={13} /> {errors.loanHolder}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Bank IFSC *</label>
                  <input
                    type="text"
                    placeholder="e.g. PUNB0123456"
                    maxLength={11}
                    className={`form-control font-mono uppercase ${errors.loanIfsc ? 'has-error' : ''}`}
                    value={loanIfsc}
                    onChange={(e) => {
                      setLoanIfsc(e.target.value.toUpperCase());
                      clearError('loanIfsc');
                    }}
                  />
                  {errors.loanIfsc && (
                    <span className="form-error-text">
                      <AlertCircle size={13} /> {errors.loanIfsc}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Account No. *</label>
                  <input
                    type="text"
                    placeholder="e.g. LA-9876543210"
                    className={`form-control font-mono ${errors.loanAccount ? 'has-error' : ''}`}
                    value={loanAccount}
                    onChange={(e) => {
                      setLoanAccount(e.target.value);
                      clearError('loanAccount');
                    }}
                  />
                  {errors.loanAccount && (
                    <span className="form-error-text">
                      <AlertCircle size={13} /> {errors.loanAccount}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Bank UTR / RTGS Ref *</label>
                  <input
                    type="text"
                    placeholder="e.g. PUNBR5202409876"
                    maxLength={25}
                    className={`form-control font-mono uppercase ${errors.loanUtr ? 'has-error' : ''}`}
                    value={loanUtr}
                    onChange={(e) => {
                      setLoanUtr(e.target.value.toUpperCase());
                      clearError('loanUtr');
                    }}
                  />
                  {errors.loanUtr && (
                    <span className="form-error-text">
                      <AlertCircle size={13} /> {errors.loanUtr}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Amount Disbursed (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className={`form-control font-mono ${errors.loanAmount ? 'has-error' : ''}`}
                    value={loanAmount}
                    onChange={(e) => {
                      setLoanAmount(e.target.value);
                      clearError('loanAmount');
                    }}
                  />
                  {errors.loanAmount && (
                    <span className="form-error-text">
                      <AlertCircle size={13} /> {errors.loanAmount}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Disbursement Date *</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className={`form-control ${errors.loanDate ? 'has-error' : ''}`}
                    value={loanDate}
                    onChange={(e) => {
                      setLoanDate(e.target.value);
                      clearError('loanDate');
                    }}
                  />
                  {errors.loanDate && (
                    <span className="form-error-text">
                      <AlertCircle size={13} /> {errors.loanDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Challan Receipt Upload */}
          <div className="section mb-4 pt-3 border-t text-left">
            <h3 className="section-title text-sm uppercase tracking-wider text-slate-700 font-semibold mb-2 text-left">
              3. Bank Transfer Receipt *
            </h3>
            <p className="text-xs text-muted mb-2 text-left">
              Upload stamped bank deposit counterfoil or electronic RTGS/NEFT confirmation slip (PDF, JPG, PNG up to 5MB).
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setReceiptFile(file);
                    clearError('receiptFile');
                  }}
                  className={`form-control text-sm ${errors.receiptFile ? 'has-error' : ''}`}
                />
                {receiptFile && !errors.receiptFile && (
                  <span className="text-xs text-success font-medium flex items-center gap-1 flex-shrink-0">
                    <FileText size={14} /> {receiptFile.name}
                  </span>
                )}
              </div>
              {errors.receiptFile && (
                <span className="form-error-text">
                  <AlertCircle size={13} /> {errors.receiptFile}
                </span>
              )}
            </div>
          </div>

          <div className="card-footer form-actions pt-3 border-t flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Submit Bank Transfer Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
