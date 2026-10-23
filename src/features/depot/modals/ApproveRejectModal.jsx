import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * ApproveRejectModal
 * Implements Step 4 & Step 5.3 of CSD Depot Manual:
 * - Offline verification checks
 * - Status transition to "Supply Order Issued."
 * - Rejection with refund notice
 */
export default function ApproveRejectModal({ isOpen, onClose, demand, mode = 'approve', onConfirm }) {
  if (!isOpen || !demand) return null;

  const isApprove = mode === 'approve';

  const statusUpper = (demand.status || '').toUpperCase();
  const isPrePayment = statusUpper === 'CREATED' || (!demand.paymentStatus || demand.paymentStatus === 'UNPAID');

  const [checks, setChecks] = useState({
    docVerified: true,
    purchaseHistory: true,
    paymentReceived: !isPrePayment,
    icdsOrderGenerated: !isPrePayment,
  });

  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const allChecksSatisfied = isPrePayment
    ? checks.docVerified && checks.purchaseHistory
    : checks.paymentReceived && checks.purchaseHistory && checks.icdsOrderGenerated;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isApprove) {
      if (!allChecksSatisfied) {
        setError('All mandatory scrutiny checks must be confirmed prior to proceeding.');
        return;
      }
      onConfirm({
        status: isPrePayment ? 'APPROVED' : 'Supply Order Issued.',
        note: isPrePayment
          ? 'Demand approved by Depot Officer. Sanction granted; beneficiary may now proceed with payment.'
          : 'Payment verified and Local Supply Order issued by Depot Manager.'
      });
    } else {
      if (!rejectReason.trim()) {
        setError('Please provide a reason for rejecting this demand.');
        return;
      }
      onConfirm({
        status: 'Rejected',
        reason: rejectReason.trim()
      });
    }
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-decision-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            {isApprove ? (
              <CheckCircle2 size={20} className="text-green" />
            ) : (
              <XCircle size={20} className="text-danger" />
            )}
            <h3 className="csd-modal-title">
              {isApprove
                ? (isPrePayment ? 'Approve Demand & Unlock Beneficiary Payment' : 'Verify Payment & Issue Supply Order')
                : 'Reject Demand'}
            </h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="csd-modal-body">
            <div className="depot-decision-demand-summary">
              <span className="small muted">Demand ID:</span>{' '}
              <strong className="text-brand">{demand.demandNo || demand.id}</strong> ·{' '}
              <span className="small muted">Item:</span>{' '}
              <strong>{demand.productName || demand.productId?.name || demand.productSnapshot?.name || 'Selected Item'}</strong> ·{' '}
              <span className="small muted">Amount:</span>{' '}
              <strong>₹{Number(demand.totalAmount || demand.pricing?.totalPrice || demand.csdPrice || 0).toLocaleString('en-IN')}</strong>
            </div>

            {isApprove ? (
              <div className="depot-approve-checklist-block">
                <p className="depot-step-instruction">
                  <strong>
                    {isPrePayment
                      ? 'Step 1 of 2: Pre-Payment Scrutiny Checks'
                      : 'Step 2 of 2: Payment Verification & Supply Order Checks'}
                  </strong>
                </p>

                {isPrePayment ? (
                  <>
                    <div className="depot-checklist-item">
                      <input
                        type="checkbox"
                        id="chk-docs"
                        checked={checks.docVerified}
                        onChange={(e) => setChecks({ ...checks, docVerified: e.target.checked })}
                      />
                      <label htmlFor="chk-docs">
                        1. Availability Certificate, Canteen Smartcard, and KYC documents verified
                      </label>
                    </div>

                    <div className="depot-checklist-item">
                      <input
                        type="checkbox"
                        id="chk-history-pre"
                        checked={checks.purchaseHistory}
                        onChange={(e) => setChecks({ ...checks, purchaseHistory: e.target.checked })}
                      />
                      <label htmlFor="chk-history-pre">
                        2. Purchase history checked against 5/8-year four-wheeler / two-wheeler quota limits
                      </label>
                    </div>

                    <div className="depot-status-transition-notice">
                      <ShieldCheck size={16} className="text-green flex-shrink-0" />
                      <span>
                        Upon Approval, the demand status changes to <strong>“APPROVED”</strong>. The beneficiary will be notified and their payment link / UTR upload button will be activated.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="depot-checklist-item">
                      <input
                        type="checkbox"
                        id="chk-payment"
                        checked={checks.paymentReceived}
                        onChange={(e) => setChecks({ ...checks, paymentReceived: e.target.checked })}
                      />
                      <label htmlFor="chk-payment">
                        1. Payment has been received from the user (Beneficiary UTR / Bank Scroll verified)
                      </label>
                    </div>

                    <div className="depot-checklist-item">
                      <input
                        type="checkbox"
                        id="chk-history"
                        checked={checks.purchaseHistory}
                        onChange={(e) => setChecks({ ...checks, purchaseHistory: e.target.checked })}
                      />
                      <label htmlFor="chk-history">
                        2. Purchase quota re-verified against official CSD records
                      </label>
                    </div>

                    <div className="depot-checklist-item">
                      <input
                        type="checkbox"
                        id="chk-icds"
                        checked={checks.icdsOrderGenerated}
                        onChange={(e) => setChecks({ ...checks, icdsOrderGenerated: e.target.checked })}
                      />
                      <label htmlFor="chk-icds">
                        3. Generation of Local Supply Order from existing ICDS software used in Depots
                      </label>
                    </div>

                    <div className="depot-status-transition-notice">
                      <ShieldCheck size={16} className="text-green flex-shrink-0" />
                      <span>
                        Upon Approval, the status of the order will change to{' '}
                        <strong>“Supply Order Issued.”</strong> Now, the URC will take the order forward for delivery.
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="depot-reject-block">
                <div className="depot-refund-alert">
                  <AlertTriangle size={18} className="text-danger flex-shrink-0" />
                  <span>
                    The order can be rejected if scrutiny checks do not match statutory requirements.{' '}
                    <strong>{isPrePayment ? 'Demand will be cancelled.' : 'The payment will be refunded upon rejection.'}</strong>
                  </span>
                </div>

                <div className="form-group mt-1">
                  <label className="form-label small font-semibold">
                    Rejection Reason / Discrepancy Note:<span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="State reason for rejecting demand (e.g. Quota exhausted, document discrepancy, pricing mismatch)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <div className="alert-banner danger mt-1 small">{error}</div>}
          </div>

          <div className="csd-modal-footer between">
            <button type="button" className="btn-depot-manual-close" onClick={onClose}>
              CLOSE
            </button>
            {isApprove ? (
              <button
                type="submit"
                className="btn-depot-action-approve"
                disabled={!allChecksSatisfied}
              >
                {isPrePayment ? 'Approve Demand & Enable Payment' : 'Verify Payment & Issue Supply Order'}
              </button>
            ) : (
              <button type="submit" className="btn-depot-action-reject">
                Confirm Rejection
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
