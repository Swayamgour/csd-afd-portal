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

  const [checks, setChecks] = useState({
    paymentReceived: demand.paymentStatus === 'Verified' || !!demand.csdPayment,
    purchaseHistory: true,
    icdsOrderGenerated: !!demand.supplyOrderDocs
  });

  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const allChecksSatisfied = checks.paymentReceived && checks.purchaseHistory && checks.icdsOrderGenerated;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isApprove) {
      if (!allChecksSatisfied) {
        setError('All Step 4 mandatory checks must be confirmed prior to issuing the Supply Order.');
        return;
      }
      onConfirm({
        status: 'Supply Order Issued.',
        note: 'Approved by Depot Manager after Step 4 offline verification checks.'
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
              {isApprove ? 'Approve Demand & Issue Supply Order' : 'Reject Demand'}
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
              <strong className="text-brand">{demand.id}</strong> ·{' '}
              <span className="small muted">Item:</span>{' '}
              <strong>{demand.productName}</strong> ·{' '}
              <span className="small muted">Amount:</span>{' '}
              <strong>₹{Number(demand.totalAmount || demand.csdPrice || 0).toLocaleString('en-IN')}</strong>
            </div>

            {isApprove ? (
              <div className="depot-approve-checklist-block">
                <p className="depot-step-instruction">
                  <strong>Step 4: Check the following (Offline process):</strong>
                </p>

                <div className="depot-checklist-item">
                  <input
                    type="checkbox"
                    id="chk-payment"
                    checked={checks.paymentReceived}
                    onChange={(e) => setChecks({ ...checks, paymentReceived: e.target.checked })}
                  />
                  <label htmlFor="chk-payment">
                    1. Payment has been received from the user (Beneficiary / Bank Scroll verified)
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
                    2. Purchase history checked against 5/8-year four-wheeler / two-wheeler quota limits
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
                    <strong>“Supply Order Issued.”</strong> Now, the URC will take the order forward.
                  </span>
                </div>
              </div>
            ) : (
              <div className="depot-reject-block">
                <div className="depot-refund-alert">
                  <AlertTriangle size={18} className="text-danger flex-shrink-0" />
                  <span>
                    The order can be rejected if any checks in Step 4 do not match requirements.{' '}
                    <strong>The payment will be refunded upon rejection.</strong>
                  </span>
                </div>

                <div className="form-group mt-1">
                  <label className="form-label small font-semibold">
                    Rejection Reason / Discrepancy Note:<span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="State reason for rejecting demand (e.g. Quota exhausted, bank payment discrepancy, ICDS mismatch)..."
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
                Approve Demand
              </button>
            ) : (
              <button type="submit" className="btn-depot-action-reject">
                Confirm Rejection & Process Refund
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
