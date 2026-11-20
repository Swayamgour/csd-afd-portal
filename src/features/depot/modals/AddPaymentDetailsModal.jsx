import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';

/**
 * AddPaymentDetailsModal (Fig. 5 in CSD Depot Manual)
 * Captures CSD Treasury receipt particulars:
 * OR number, Total Amount Received, Excess Payment, TCS, OR Date,
 * CSD Bank Ref, Beneficiary Account payment, PO Number, PO Date
 */
export default function AddPaymentDetailsModal({ isOpen, onClose, demand, onSave, saving = false, serverError = '' }) {
  const getAutoValues = (d) => {
    if (!d) return {};

    const pd = d.paymentDetails || {};
    const payment = d.latestPayment || d.payments?.[0] || {};
    const transfer = payment.transferDetails || d.transferDetails || {};
    const self = transfer?.self || {};
    const loan = transfer?.loan || {};
    const isLoanDemand = Boolean(d?.hasLoan || d?.loan?.isLoan || d?.loanAmount);

    const today = new Date().toISOString().split('T')[0];

    const totalAmt = Number(
      d.totalAmount ||
      d.totalPrice ||
      d.csdPrice ||
      d.netPrice ||
      d.unitPrice ||
      payment.amount ||
      0
    );

    const loanAmt = Number(
      d.loan?.loanAmount ||
      d.loanAmount ||
      loan.amountPaid ||
      0
    );

    const selfAmt = self.amountPaid != null
      ? Number(self.amountPaid)
      : (isLoanDemand && loanAmt > 0 && totalAmt > loanAmt
          ? totalAmt - loanAmt
          : totalAmt);

    const orDateVal = pd.orDate ? pd.orDate.split('T')[0] : today;
    const poDateVal = pd.poDate ? pd.poDate.split('T')[0] : today;

    const paymentDateVal = pd.paymentDate
      ? pd.paymentDate.split('T')[0]
      : (self.paymentDate
          ? self.paymentDate.split('T')[0]
          : (payment.paidAt
              ? payment.paidAt.split('T')[0]
              : today));

    const loanPaymentDateVal = pd.loanPaymentDate
      ? pd.loanPaymentDate.split('T')[0]
      : (loan.paymentDate
          ? loan.paymentDate.split('T')[0]
          : (isLoanDemand ? today : ''));

    const poNumVal = pd.poNumber || d.poNumber || d.supplyOrderNumber || (d.demandNumber ? `PO-${d.demandNumber}` : '');

    return {
      orNumber: pd.orNumber || '',
      totalAmountReceived: pd.totalAmountReceived ? String(pd.totalAmountReceived) : (totalAmt ? String(totalAmt) : ''),
      excessPayment: pd.excessPayment !== undefined ? String(pd.excessPayment) : '',
      tcsCollected: pd.tcsCollected !== undefined ? String(pd.tcsCollected) : '',
      orDate: orDateVal,
      csdBankRef: pd.bankRefNumber || self.utrNumber || payment.gatewayTxnId || '',
      amountFromBeneficiary: pd.amountReceivedBeneficiary ? String(pd.amountReceivedBeneficiary) : (selfAmt ? String(selfAmt) : ''),
      datePaymentReceived: paymentDateVal,
      csdBankRefLoan: pd.loanBankRefNumber || loan.utrNumber || '',
      amountReceivedLoan: pd.loanAmountReceived ? String(pd.loanAmountReceived) : (loanAmt ? String(loanAmt) : ''),
      datePaymentReceivedLoan: loanPaymentDateVal,
      poNumber: poNumVal,
      poDate: poDateVal,
    };
  };

  const [formData, setFormData] = useState({
    orNumber: '',
    totalAmountReceived: '',
    excessPayment: '',
    tcsCollected: '',
    orDate: '',
    csdBankRef: '',
    amountFromBeneficiary: '',
    datePaymentReceived: '',
    csdBankRefLoan: '',
    amountReceivedLoan: '',
    datePaymentReceivedLoan: '',
    poNumber: '',
    poDate: '',
  });
  const [errors, setErrors] = useState({});
  const [autoFilledBadge, setAutoFilledBadge] = useState(false);

  useEffect(() => {
    if (isOpen && demand) {
      const auto = getAutoValues(demand);
      setFormData(auto);
      setErrors({});
      setAutoFilledBadge(true);
    }
  }, [isOpen, demand]);

  if (!isOpen || !demand) return null;

  const payment = demand.latestPayment || demand.payments?.[0] || {};
  const transfer = payment.transferDetails || demand.transferDetails || {};
  const receiptUrl = transfer.receiptUrl || demand.receiptUrl || demand.paymentDetails?.receiptUrl || payment.receiptUrl;

  const handleAutoFill = () => {
    const auto = getAutoValues(demand);
    setFormData(auto);
    setErrors({});
    setAutoFilledBadge(true);
  };

  const handleChange = (field, val) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'amountFromBeneficiary' || field === 'amountReceivedLoan') {
        const bAmt = Number(field === 'amountFromBeneficiary' ? val : prev.amountFromBeneficiary) || 0;
        const lAmt = Number(field === 'amountReceivedLoan' ? val : prev.amountReceivedLoan) || 0;
        if (bAmt > 0 || lAmt > 0) {
          updated.totalAmountReceived = String(bAmt + lAmt);
        }
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = formData;
    const errs = {};
    if (!f.orNumber.trim()) errs.orNumber = 'OR Number is required';
    if (!(Number(f.totalAmountReceived) > 0)) errs.totalAmountReceived = 'Total Amount Received is required';
    if (!f.orDate) errs.orDate = 'OR Date is required';
    if (!f.csdBankRef.trim()) errs.csdBankRef = 'CSD Bank Reference No is required';
    if (!(Number(f.amountFromBeneficiary) > 0)) errs.amountFromBeneficiary = 'Amount Received from Beneficiary is required';
    if (!f.datePaymentReceived) errs.datePaymentReceived = 'Date of Payment Received is required';
    if (!f.poNumber.trim()) errs.poNumber = 'PO Number is required';
    if (!f.poDate) errs.poDate = 'PO Date is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      orNumber: f.orNumber.trim(),
      totalAmountReceived: Number(f.totalAmountReceived),
      orDate: f.orDate,
      bankRefNumber: f.csdBankRef.trim(),
      amountReceivedBeneficiary: Number(f.amountFromBeneficiary),
      paymentDate: f.datePaymentReceived,
      poNumber: f.poNumber.trim(),
      poDate: f.poDate,
    };
    if (f.excessPayment !== '') payload.excessPayment = Number(f.excessPayment);
    if (f.tcsCollected !== '') payload.tcsCollected = Number(f.tcsCollected);
    if (f.csdBankRefLoan && f.csdBankRefLoan.trim()) payload.loanBankRefNumber = f.csdBankRefLoan.trim();
    if (f.amountReceivedLoan !== '' && Number(f.amountReceivedLoan) > 0) payload.loanAmountReceived = Number(f.amountReceivedLoan);
    if (f.datePaymentReceivedLoan) payload.loanPaymentDate = f.datePaymentReceivedLoan;

    onSave(payload);
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" style={{ overflowY: 'auto', padding: '1rem' }}>
      <div
        className="csd-modal-container depot-payment-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div className="csd-modal-header between" style={{ flexShrink: 0, padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div className="row align-center gap-1">
            <FileText size={18} className="text-brand" />
            <h3 className="csd-modal-title">Add payment Details</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="depot-payment-modal-form"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          <div
            className="csd-modal-body depot-payment-modal-body"
            style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(90vh - 130px)', padding: '1.25rem 1.5rem' }}
          >
            {serverError && <div className="alert-banner error mb-2">{serverError}</div>}

            {/* Auto-fill notification & Receipt quick-link */}
            <div
              style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: '#0369a1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={15} style={{ color: '#0284c7' }} />
                <span>
                  <strong>Auto-fetched:</strong> Values pre-populated from Demand &amp; Beneficiary transfer submission.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {receiptUrl && (
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#0284c7',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    View Receipt <ExternalLink size={12} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleAutoFill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: '#ffffff',
                    border: '1px solid #7dd3fc',
                    borderRadius: '5px',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.76rem',
                    color: '#0369a1',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  title="Re-populate all details from demand"
                >
                  <RefreshCw size={11} /> Re-fill
                </button>
              </div>
            </div>

            <div className="depot-manual-form-grid">
              {/* OR Number */}
              <div className="form-field">
                <label className="form-label">
                  OR number:<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.orNumber ? 'has-error' : ''}`}
                  value={formData.orNumber}
                  onChange={(e) => handleChange('orNumber', e.target.value)}
                  placeholder="Enter Official Receipt Number"
                  autoFocus
                />
                {errors.orNumber && <span className="depot-error-msg">{errors.orNumber}</span>}
              </div>

              {/* Total Amount Received */}
              <div className="form-field">
                <label className="form-label">
                  Total Amount Received:<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.totalAmountReceived ? 'has-error' : ''}`}
                  value={formData.totalAmountReceived}
                  onChange={(e) => handleChange('totalAmountReceived', e.target.value)}
                  placeholder="Total Amount in INR"
                />
                {errors.totalAmountReceived && <span className="depot-error-msg">{errors.totalAmountReceived}</span>}
              </div>

              {/* Excess Payment collected */}
              <div className="form-field">
                <label className="form-label">
                  Excess Payment collected (optional):
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.excessPayment}
                  onChange={(e) => handleChange('excessPayment', e.target.value)}
                  placeholder="Excess Amount (if any)"
                />
              </div>

              {/* TCS collected */}
              <div className="form-field">
                <label className="form-label">
                  TCS collected (optional):
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.tcsCollected}
                  onChange={(e) => handleChange('tcsCollected', e.target.value)}
                  placeholder="Tax Collected at Source"
                />
              </div>

              {/* OR Date */}
              <div className="form-field">
                <label className="form-label">
                  OR Date:<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.orDate ? 'has-error' : ''}`}
                  value={formData.orDate}
                  onChange={(e) => handleChange('orDate', e.target.value)}
                />
                {errors.orDate && <span className="depot-error-msg">{errors.orDate}</span>}
              </div>

              {/* CSD Bank Reference No */}
              <div className="form-field">
                <label className="form-label">
                  CSD Bank Reference No:<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.csdBankRef ? 'has-error' : ''}`}
                  value={formData.csdBankRef}
                  onChange={(e) => handleChange('csdBankRef', e.target.value.toUpperCase())}
                  placeholder="CSD Treasury Ref / UTR"
                />
                {errors.csdBankRef && <span className="depot-error-msg">{errors.csdBankRef}</span>}
              </div>

              {/* Amount Received from Beneficiary Account */}
              <div className="form-field">
                <label className="form-label">
                  Amount Received (from Beneficiary Account):<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.amountFromBeneficiary ? 'has-error' : ''}`}
                  value={formData.amountFromBeneficiary}
                  onChange={(e) => handleChange('amountFromBeneficiary', e.target.value)}
                  placeholder="Amount from beneficiary account"
                />
                {errors.amountFromBeneficiary && <span className="depot-error-msg">{errors.amountFromBeneficiary}</span>}
              </div>

              {/* Date of Payment Received */}
              <div className="form-field">
                <label className="form-label">
                  Date of Payment Received:<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.datePaymentReceived ? 'has-error' : ''}`}
                  value={formData.datePaymentReceived}
                  onChange={(e) => handleChange('datePaymentReceived', e.target.value)}
                />
                {errors.datePaymentReceived && <span className="depot-error-msg">{errors.datePaymentReceived}</span>}
              </div>

              {/* CSD Bank Reference No (Loan) optional */}
              <div className="form-field">
                <label className="form-label">
                  CSD Bank Reference No (Loan) optional:
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.csdBankRefLoan}
                  onChange={(e) => handleChange('csdBankRefLoan', e.target.value.toUpperCase())}
                  placeholder="Loan Disbursement Bank Ref"
                />
              </div>

              {/* Amount Received (Loan) optional */}
              <div className="form-field">
                <label className="form-label">
                  Amount Received (Loan) optional:
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.amountReceivedLoan}
                  onChange={(e) => handleChange('amountReceivedLoan', e.target.value)}
                  placeholder="Loan Amount (if applicable)"
                />
              </div>

              {/* Date of Payment Received (Loan) optional */}
              <div className="form-field">
                <label className="form-label">
                  Date of Payment Received (Loan) optional:
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.datePaymentReceivedLoan}
                  onChange={(e) => handleChange('datePaymentReceivedLoan', e.target.value)}
                />
              </div>

              {/* PO Number */}
              <div className="form-field">
                <label className="form-label">
                  PO Number:<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.poNumber ? 'has-error' : ''}`}
                  value={formData.poNumber}
                  onChange={(e) => handleChange('poNumber', e.target.value)}
                  placeholder="Purchase Order Number"
                />
                {errors.poNumber && <span className="depot-error-msg">{errors.poNumber}</span>}
              </div>

              {/* PO Date */}
              <div className="form-field">
                <label className="form-label">
                  PO Date:<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.poDate ? 'has-error' : ''}`}
                  value={formData.poDate}
                  onChange={(e) => handleChange('poDate', e.target.value)}
                />
                {errors.poDate && <span className="depot-error-msg">{errors.poDate}</span>}
              </div>
            </div>
          </div>

          <div
            className="csd-modal-footer depot-manual-footer-center"
            style={{ flexShrink: 0, padding: '0.85rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}
          >
            <button type="button" className="btn-depot-manual-close" onClick={onClose}>
              CLOSE
            </button>
            <button type="submit" className="btn-depot-manual-submit" disabled={saving}>
              {saving ? "SAVING..." : "SUBMIT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
