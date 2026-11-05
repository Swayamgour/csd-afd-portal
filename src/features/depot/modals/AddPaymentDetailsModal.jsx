import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';

/**
 * AddPaymentDetailsModal (Fig. 5 in CSD Depot Manual)
 * Captures CSD Treasury receipt particulars:
 * OR number, Total Amount Received, Excess Payment, TCS, OR Date,
 * CSD Bank Ref, Beneficiary Account payment, PO Number, PO Date
 */
export default function AddPaymentDetailsModal({ isOpen, onClose, demand, onSave, saving = false, serverError = '' }) {
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

  if (!isOpen || !demand) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
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
    if (f.csdBankRefLoan.trim()) payload.loanBankRefNumber = f.csdBankRefLoan.trim();
    if (f.amountReceivedLoan !== '') payload.loanAmountReceived = Number(f.amountReceivedLoan);
    if (f.datePaymentReceivedLoan) payload.loanPaymentDate = f.datePaymentReceivedLoan;

    onSave(payload);
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-payment-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <FileText size={18} className="text-brand" />
            <h3 className="csd-modal-title">Add payment Details</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="csd-modal-body">
            {serverError && <div className="alert-banner error mb-2">{serverError}</div>}
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
                  onChange={(e) => handleChange('csdBankRef', e.target.value)}
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
                  onChange={(e) => handleChange('csdBankRefLoan', e.target.value)}
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

          <div className="csd-modal-footer depot-manual-footer-center">
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
