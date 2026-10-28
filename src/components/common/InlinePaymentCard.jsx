import React, { useState } from 'react';
import { Landmark, AlertCircle, CheckCircle2, Upload, FileText } from 'lucide-react';
import Button from './Button.jsx';
import { useUploadFileMutation } from '../../features/beneficiary/beneficiaryApi.js';
import { useSubmitDirectTransferMutation } from '../../features/payment/paymentApi.js';

export default function InlinePaymentCard({ demand, onPaymentSubmitted, onCancel }) {
  const isLoan = Boolean(demand?.hasLoan || demand?.loan?.isLoan);
  const totalAmount = Number(
    demand?.totalAmount ||
    demand?.totalPrice ||
    demand?.csdPrice ||
    demand?.total ||
    demand?.netPrice ||
    demand?.unitPrice ||
    0
  );

  const [selfBank, setSelfBank] = useState('State Bank of India');
  const [selfHolder, setSelfHolder] = useState(demand?.beneficiaryName || demand?.customerName || '');
  const [selfAccount, setSelfAccount] = useState('');
  const [selfIfsc, setSelfIfsc] = useState('');
  const [selfUtr, setSelfUtr] = useState('');
  const [selfAmount, setSelfAmount] = useState(
    isLoan && demand?.loanAmount
      ? (totalAmount - Number(demand.loanAmount)).toString()
      : totalAmount.toString()
  );
  const [selfDate, setSelfDate] = useState(new Date().toISOString().split('T')[0]);

  // Loan Account (if applicable)
  const [loanBank, setLoanBank] = useState('');
  const [loanHolder, setLoanHolder] = useState(demand?.beneficiaryName || demand?.customerName || '');
  const [loanAccount, setLoanAccount] = useState('');
  const [loanIfsc, setLoanIfsc] = useState('');
  const [loanUtr, setLoanUtr] = useState('');
  const [loanAmount, setLoanAmount] = useState(demand?.loanAmount ? String(demand.loanAmount) : '');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Receipt Document
  const [receiptFile, setReceiptFile] = useState(null);
  const [errorAlert, setErrorAlert] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadFileMutation] = useUploadFileMutation();
  const [submitDirectTransfer] = useSubmitDirectTransferMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert('');
    setSuccessMsg('');

    const paidSelf = Number(selfAmount) || 0;
    const paidLoan = isLoan ? (Number(loanAmount) || 0) : 0;
    const combinedPaid = paidSelf + paidLoan;

    if (totalAmount > 0 && combinedPaid < totalAmount) {
      setErrorAlert('Total amount recorded (₹' + combinedPaid.toLocaleString('en-IN') + ') is less than net payable price (₹' + totalAmount.toLocaleString('en-IN') + ').');
      return;
    }

    if (!selfBank || !selfUtr) {
      setErrorAlert('Please fill all mandatory banking fields (Bank Name and UTR Number).');
      return;
    }

    if (isLoan && (!loanBank || !loanUtr)) {
      setErrorAlert('Please fill all required loan banking fields (Bank Name and Loan UTR Number).');
      return;
    }

    setIsSubmitting(true);
    try {
      let receiptUrl = '';
      if (receiptFile) {
        try {
          const fd = new FormData();
          fd.append('files', receiptFile);
          const upRes = await uploadFileMutation(fd).unwrap();
          const item = Array.isArray(upRes) ? upRes[0] : upRes?.data?.[0];
          receiptUrl = item?.url || '';
        } catch (upErr) {
          console.warn('Receipt upload fallback:', upErr);
        }
      }

      const targetDemandId = demand._id || demand.id;
      const remarks = `Direct Bank Transfer UTR: ${selfUtr} (${selfBank}) - ₹${paidSelf}${isLoan ? ` | Loan UTR: ${loanUtr} (${loanBank}) - ₹${paidLoan}` : ''}`;

      await submitDirectTransfer({
        demandId: targetDemandId,
        utrNumber: selfUtr,
        bankName: selfBank,
        depositDate: selfDate,
        remarks,
        receiptUrl: receiptUrl || undefined,
      }).unwrap();

      setSuccessMsg('Payment details successfully recorded. CSD Depot accounts will verify against bank statement.');
      if (onPaymentSubmitted) {
        onPaymentSubmitted({
          demandId: targetDemandId,
          utr: selfUtr,
          bank: selfBank,
          amount: combinedPaid,
        });
      }
    } catch (err) {
      setErrorAlert(err?.data?.message || err?.message || 'Failed to submit payment details.');
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

      <div className="card-body">
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

        <form onSubmit={handleSubmit}>
          {/* Beneficiary Self Account */}
          <div className="section mb-4">
            <h3 className="section-title text-sm uppercase tracking-wider text-slate-700 font-semibold mb-3">
              1. Beneficiary Bank Transfer Details
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Remitting Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India"
                  className="form-control"
                  value={selfBank}
                  onChange={(e) => setSelfBank(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Beneficiary Account Name</label>
                <input
                  type="text"
                  placeholder="Account holder name"
                  className="form-control"
                  value={selfHolder}
                  onChange={(e) => setSelfHolder(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Debit Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 10293847561"
                  className="form-control font-mono"
                  value={selfAccount}
                  onChange={(e) => setSelfAccount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  className="form-control font-mono uppercase"
                  value={selfIfsc}
                  onChange={(e) => setSelfIfsc(e.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank UTR / Transaction No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBIN24012345678"
                  className="form-control font-mono uppercase"
                  value={selfUtr}
                  onChange={(e) => setSelfUtr(e.target.value.toUpperCase())}
                />
                <span className="text-xs text-muted mt-1 block">
                  Mandatory 12-22 digit UTR provided by your bank receipt
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Amount Transferred (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="form-control font-mono"
                  value={selfAmount}
                  onChange={(e) => setSelfAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Date *</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={selfDate}
                  onChange={(e) => setSelfDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Loan Account Section (if applicable) */}
          {isLoan && (
            <div className="section mb-4 pt-3 border-t">
              <h3 className="section-title text-sm uppercase tracking-wider text-slate-700 font-semibold mb-3">
                2. Bank Loan Disbursement Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Financing Bank Name *</label>
                  <input
                    type="text"
                    required={isLoan}
                    placeholder="e.g. Punjab National Bank"
                    className="form-control"
                    value={loanBank}
                    onChange={(e) => setLoanBank(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Account No.</label>
                  <input
                    type="text"
                    placeholder="e.g. LA-9876543210"
                    className="form-control font-mono"
                    value={loanAccount}
                    onChange={(e) => setLoanAccount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Bank UTR / RTGS Ref *</label>
                  <input
                    type="text"
                    required={isLoan}
                    placeholder="e.g. PUNBR5202409876"
                    className="form-control font-mono uppercase"
                    value={loanUtr}
                    onChange={(e) => setLoanUtr(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Amount Disbursed (₹) *</label>
                  <input
                    type="number"
                    required={isLoan}
                    min="1"
                    className="form-control font-mono"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Disbursement Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Challan Receipt Upload */}
          <div className="section mb-4 pt-3 border-t">
            <h3 className="section-title text-sm uppercase tracking-wider text-slate-700 font-semibold mb-2">
              3. Bank Counterfoil / Transfer Receipt
            </h3>
            <p className="text-xs text-muted mb-2">
              Upload stamped bank deposit counterfoil or electronic RTGS/NEFT confirmation slip (PDF, JPG, PNG up to 5MB).
            </p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="form-control text-sm"
              />
              {receiptFile && (
                <span className="text-xs text-success font-medium flex items-center gap-1">
                  <FileText size={14} /> {receiptFile.name}
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
