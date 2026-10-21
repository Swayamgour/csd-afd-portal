import React from 'react';
import { X, Receipt, Download, CheckCircle2, Building, Calendar, Hash, ArrowDown } from 'lucide-react';

export default function PaymentReceiptModal({ isOpen, onClose, demand }) {
  if (!isOpen || !demand) return null;

  const payment = demand.beneficiaryPayment || {
    bank: demand.loan?.isLoan ? (demand.loan?.bankName || 'Bank Loan / Sanction') : (demand.paymentMethod || 'Direct bank transfer (SBI)'),
    firstAccountHolder: demand.beneficiaryId?.fullName || demand.beneficiaryName || demand.userId?.name || 'Applicant',
    accountNumber: demand.beneficiaryId?.cardId ? `XXXX-XXXX-${demand.beneficiaryId.cardId.slice(-4)}` : 'XXXX-XXXX-9842',
    ifsc: 'SBIN0000691',
    utr: demand.utrNumber || (demand.demandNo ? `UTR-SBI-${demand.demandNo.replace(/\D/g, '')}` : 'UTR-SBI-984210'),
    amountPaid: Number(demand.totalAmount || demand.pricing?.totalPrice || demand.csdPrice || 0),
    dateOfPayment: demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('en-GB') : (demand.indentDate || 'Recent')
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-receipt-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <Receipt size={18} className="text-brand" />
            <h3 className="csd-modal-title">Beneficiary Payment Receipt · {demand.id}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="csd-modal-body">
          <div className="depot-receipt-preview-card">
            <div className="depot-receipt-stamp">
              <CheckCircle2 size={16} className="text-green" /> VERIFIED TREASURY SCROLL
            </div>

            <div className="text-center mb-15">
              <span className="micro muted uppercase font-bold tracking-wide">CANTEEN STORES DEPARTMENT</span>
              <h4 className="m-0 font-bold">CYBER TREASURY PAYMENT VOUCHER</h4>
              <p className="micro muted">Against Demand Indent: <strong>{demand.id}</strong></p>
            </div>

            <div className="depot-receipt-amount-banner">
              <span className="small muted">Amount Paid by Beneficiary:</span>
              <h2 className="text-green font-extrabold m-0">₹{Number(payment.amountPaid || 0).toLocaleString('en-IN')}</h2>
            </div>

            <table className="depot-summary-meta-table mt-15">
              <tbody>
                <tr>
                  <td>Remitting Bank:</td>
                  <td><strong>{payment.bank}</strong></td>
                </tr>
                <tr>
                  <td>First Account Holder:</td>
                  <td><strong>{payment.firstAccountHolder}</strong></td>
                </tr>
                <tr>
                  <td>Account Number:</td>
                  <td><code>{payment.accountNumber}</code></td>
                </tr>
                <tr>
                  <td>IFSC Code:</td>
                  <td><code>{payment.ifsc}</code></td>
                </tr>
                <tr>
                  <td>UTR / Transaction Ref:</td>
                  <td><strong className="text-brand">{payment.utr}</strong></td>
                </tr>
                <tr>
                  <td>Date of Payment:</td>
                  <td>{payment.dateOfPayment}</td>
                </tr>
                <tr>
                  <td>Procurement Item:</td>
                  <td>{demand.productName}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="csd-modal-footer between">
          <button type="button" className="btn-depot-manual-close" onClick={onClose}>
            CLOSE
          </button>
          <a
            href="#download"
            className="btn-depot-action-print"
            onClick={(e) => {
              e.preventDefault();
              window.print();
            }}
          >
            <Download size={16} /> Download Voucher PDF
          </a>
        </div>
      </div>
    </div>
  );
}
