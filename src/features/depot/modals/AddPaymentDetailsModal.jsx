import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';

/**
 * AddPaymentDetailsModal (Fig. 5 in CSD Depot Manual)
 * Captures CSD Treasury receipt particulars:
 * OR number, Total Amount Received, Excess Payment, TCS, OR Date,
 * CSD Bank Ref, Beneficiary Account payment, PO Number, PO Date
 */
export default function AddPaymentDetailsModal({ isOpen, onClose, demand, onSave }) {
  if (!isOpen || !demand) return null;

  const existing = demand.csdPayment || {};

  const cleanDemandId = String(demand.demandNo || demand.id || demand._id || '').replace('#', '');

  const [formData, setFormData] = useState({
    orNumber: existing.orNumber || (cleanDemandId ? `OR-${cleanDemandId}` : `OR-${Date.now().toString().slice(-6)}`),
    totalAmountReceived: existing.totalAmountReceived || demand.totalAmount || demand.pricing?.totalPrice || demand.csdPrice || '',
    excessPayment: existing.excessPayment || '',
    tcsCollected: existing.tcsCollected || '',
    orDate: existing.orDate || new Date().toISOString().split('T')[0],
    csdBankRef: existing.csdBankRef || 'CSD-SBI-MUMBAI-MAIN',
    amountFromBeneficiary: existing.amountFromBeneficiary || demand.totalAmount || demand.pricing?.totalPrice || demand.csdPrice || '',
    datePaymentReceived: existing.datePaymentReceived || new Date().toISOString().split('T')[0],
    csdBankRefLoan: existing.csdBankRefLoan || '',
    amountReceivedLoan: existing.amountReceivedLoan || '',
    datePaymentReceivedLoan: existing.datePaymentReceivedLoan || '',
    poNumber: existing.poNumber || (cleanDemandId ? `PO-${cleanDemandId}` : `PO-${Date.now().toString().slice(-6)}`),
    poDate: existing.poDate || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.orNumber.trim()) errs.orNumber = 'OR Number is required';
    if (!formData.totalAmountReceived) errs.totalAmountReceived = 'Total Amount Received is required';
    if (!formData.orDate) errs.orDate = 'OR Date is required';
    if (!formData.csdBankRef.trim()) errs.csdBankRef = 'CSD Bank Reference No is required';
    if (!formData.amountFromBeneficiary) errs.amountFromBeneficiary = 'Amount Received from Beneficiary is required';
    if (!formData.datePaymentReceived) errs.datePaymentReceived = 'Date of Payment Received is required';
    if (!formData.poNumber.trim()) errs.poNumber = 'PO Number is required';
    if (!formData.poDate) errs.poDate = 'PO Date is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave(formData);
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
            <div className="depot-manual-form-grid">
              {/* OR Number */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  OR number:<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`depot-form-input ${errors.orNumber ? 'has-error' : ''}`}
                  value={formData.orNumber}
                  onChange={(e) => handleChange('orNumber', e.target.value)}
                  placeholder="Enter Official Receipt Number"
                />
                {errors.orNumber && <span className="depot-error-msg">{errors.orNumber}</span>}
              </div>

              {/* Total Amount Received */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  Total Amount Received:<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`depot-form-input ${errors.totalAmountReceived ? 'has-error' : ''}`}
                  value={formData.totalAmountReceived}
                  onChange={(e) => handleChange('totalAmountReceived', e.target.value)}
                  placeholder="Total Amount in INR"
                />
                {errors.totalAmountReceived && <span className="depot-error-msg">{errors.totalAmountReceived}</span>}
              </div>

              {/* Excess Payment collected */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  Excess Payment collected (optional):
                </label>
                <input
                  type="number"
                  className="depot-form-input"
                  value={formData.excessPayment}
                  onChange={(e) => handleChange('excessPayment', e.target.value)}
                  placeholder="Excess Amount (if any)"
                />
              </div>

              {/* TCS collected */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  TCS collected (optional):
                </label>
                <input
                  type="number"
                  className="depot-form-input"
                  value={formData.tcsCollected}
                  onChange={(e) => handleChange('tcsCollected', e.target.value)}
                  placeholder="Tax Collected at Source"
                />
              </div>

              {/* OR Date */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  OR Date:<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`depot-form-input ${errors.orDate ? 'has-error' : ''}`}
                  value={formData.orDate}
                  onChange={(e) => handleChange('orDate', e.target.value)}
                />
                {errors.orDate && <span className="depot-error-msg">{errors.orDate}</span>}
              </div>

              {/* CSD Bank Reference No */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  CSD Bank Reference No:<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`depot-form-input ${errors.csdBankRef ? 'has-error' : ''}`}
                  value={formData.csdBankRef}
                  onChange={(e) => handleChange('csdBankRef', e.target.value)}
                  placeholder="CSD Treasury Ref / UTR"
                />
                {errors.csdBankRef && <span className="depot-error-msg">{errors.csdBankRef}</span>}
              </div>

              {/* Amount Received from Beneficiary Account */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  Amount Received (from Beneficiary Account):<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`depot-form-input ${errors.amountFromBeneficiary ? 'has-error' : ''}`}
                  value={formData.amountFromBeneficiary}
                  onChange={(e) => handleChange('amountFromBeneficiary', e.target.value)}
                  placeholder="Amount from beneficiary account"
                />
                {errors.amountFromBeneficiary && <span className="depot-error-msg">{errors.amountFromBeneficiary}</span>}
              </div>

              {/* Date of Payment Received */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  Date of Payment Received:<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`depot-form-input ${errors.datePaymentReceived ? 'has-error' : ''}`}
                  value={formData.datePaymentReceived}
                  onChange={(e) => handleChange('datePaymentReceived', e.target.value)}
                />
                {errors.datePaymentReceived && <span className="depot-error-msg">{errors.datePaymentReceived}</span>}
              </div>

              {/* CSD Bank Reference No (Loan) optional */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  CSD Bank Reference No (Loan) optional:
                </label>
                <input
                  type="text"
                  className="depot-form-input"
                  value={formData.csdBankRefLoan}
                  onChange={(e) => handleChange('csdBankRefLoan', e.target.value)}
                  placeholder="Loan Disbursement Bank Ref"
                />
              </div>

              {/* Amount Received (Loan) optional */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  Amount Received (Loan) optional:
                </label>
                <input
                  type="number"
                  className="depot-form-input"
                  value={formData.amountReceivedLoan}
                  onChange={(e) => handleChange('amountReceivedLoan', e.target.value)}
                  placeholder="Loan Amount (if applicable)"
                />
              </div>

              {/* Date of Payment Received (Loan) optional */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  Date of Payment Received (Loan) optional:
                </label>
                <input
                  type="date"
                  className="depot-form-input"
                  value={formData.datePaymentReceivedLoan}
                  onChange={(e) => handleChange('datePaymentReceivedLoan', e.target.value)}
                />
              </div>

              {/* PO Number */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  PO Number:<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`depot-form-input ${errors.poNumber ? 'has-error' : ''}`}
                  value={formData.poNumber}
                  onChange={(e) => handleChange('poNumber', e.target.value)}
                  placeholder="Purchase Order Number"
                />
                {errors.poNumber && <span className="depot-error-msg">{errors.poNumber}</span>}
              </div>

              {/* PO Date */}
              <div className="depot-form-group">
                <label className="depot-form-label">
                  PO Date:<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`depot-form-input ${errors.poDate ? 'has-error' : ''}`}
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
            <button type="submit" className="btn-depot-manual-submit">
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
