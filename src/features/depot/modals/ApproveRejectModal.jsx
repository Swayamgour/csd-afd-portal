import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApproveDemandMutation, useRejectDemandMutation } from '../../demand/demandApi.js';
import { getErrorMessage } from '../../../utils/apiError.js';
import { depotCanApprove, hasPaymentDetails, hasSupplyOrderDocs, depotCanStage1Approve, upper } from '../../../utils/demandStatus.js';

/**
 * ApproveRejectModal (Depot Manual step 4 & 5.3)
 * Stage 1 (status Created): scrutiny -> Approve enables payment for the beneficiary.
 * Stage 2 (status Processing, after payment): needs payment details + Local Supply Order docs; -> "Supply Order Issued".
 * Reject: refunded if the beneficiary has already paid.
 */
export default function ApproveRejectModal({ isOpen, onClose, demand, mode = 'approve', onDone }) {
  const [approve, { isLoading: approving }] = useApproveDemandMutation();
  const [reject, { isLoading: rejecting }] = useRejectDemandMutation();
  const [checks, setChecks] = useState({ docVerified: false, paymentReceived: false, icdsOrderGenerated: false });
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !demand) return null;

  const isApprove = mode === 'approve';
  const id = demand._id || demand.id;
  const stage1 = depotCanStage1Approve(demand);
  const hasPaid = ['PAID', 'PENDING_VERIFICATION'].includes(upper(demand.paymentStatus));
  const ready = stage1 || depotCanApprove(demand);
  const allChecked = stage1 ? checks.docVerified : checks.docVerified && checks.paymentReceived && checks.icdsOrderGenerated;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isApprove) {
        if (!ready) return setError('Record payment details and upload the Local Supply Order documents first.');
        if (!allChecked) return setError('All mandatory scrutiny checks must be confirmed.');
        await approve({ id, note: stage1 ? 'Approved by Depot after scrutiny. Payment enabled.' : 'Approved by Depot. Supply Order issued to URC.' }).unwrap();
      } else {
        if (rejectReason.trim().length < 3) return setError('Please provide a reason for rejecting this demand.');
        await reject({ id, reason: rejectReason.trim() }).unwrap();
      }
      if (onDone) onDone();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Action failed.'));
    }
  };

  const busy = approving || rejecting;

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-decision-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            {isApprove ? <CheckCircle2 size={20} className="text-green" /> : <XCircle size={20} className="text-danger" />}
            <h3 className="csd-modal-title">{isApprove ? (stage1 ? 'Approve Demand & Enable Payment' : 'Approve & Issue Supply Order') : 'Reject Demand'}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="csd-modal-body">
            <div className="depot-decision-demand-summary">
              <span className="small muted">Demand ID:</span> <strong className="text-brand">{demand.demandNo || id}</strong> ·{' '}
              <span className="small muted">Item:</span> <strong>{demand.productSnapshot?.name || demand.productId?.name || 'Selected Item'}</strong> ·{' '}
              <span className="small muted">Amount:</span> <strong>₹{Number(demand.totalAmount || 0).toLocaleString('en-IN')}</strong>
            </div>

            {isApprove ? (
              <div className="depot-approve-checklist-block">
                <p className="depot-step-instruction"><strong>{stage1 ? 'Step 1 of 2: Scrutiny before payment' : 'Step 2 of 2: Payment verification & Supply Order'}</strong></p>
                {!ready && (
                  <div className="alert-banner warning mb-1 small">
                    Pending before approval:{' '}
                    {[!hasPaymentDetails(demand) && 'Add payment details', !hasSupplyOrderDocs(demand) && 'Upload Supply Order documents'].filter(Boolean).join(' · ')}
                  </div>
                )}
                <div className="depot-checklist-item">
                  <input type="checkbox" id="chk-docs" checked={checks.docVerified} onChange={(e) => setChecks({ ...checks, docVerified: e.target.checked })} />
                  <label htmlFor="chk-docs">1. Documents (Canteen card, PAN, Availability Certificate, KYC) and purchase history verified</label>
                </div>
                {!stage1 && (
                  <>
                    <div className="depot-checklist-item">
                      <input type="checkbox" id="chk-payment" checked={checks.paymentReceived} onChange={(e) => setChecks({ ...checks, paymentReceived: e.target.checked })} />
                      <label htmlFor="chk-payment">2. Payment received in CSD account and matched with beneficiary details</label>
                    </div>
                    <div className="depot-checklist-item">
                      <input type="checkbox" id="chk-icds" checked={checks.icdsOrderGenerated} onChange={(e) => setChecks({ ...checks, icdsOrderGenerated: e.target.checked })} />
                      <label htmlFor="chk-icds">3. Local Supply Order generated from ICDS software and uploaded</label>
                    </div>
                  </>
                )}
                <div className="depot-status-transition-notice">
                  <ShieldCheck size={16} className="text-green flex-shrink-0" />
                  <span>
                    {stage1
                      ? <>On approval the beneficiary is notified and the <strong>payment button is enabled</strong>.</>
                      : <>On approval the status changes to <strong>“Supply Order Issued”</strong> and the URC takes the order forward for delivery.</>}
                  </span>
                </div>
              </div>
            ) : (
              <div className="depot-reject-block">
                <div className="depot-refund-alert">
                  <AlertTriangle size={18} className="text-danger flex-shrink-0" />
                  <span>The order can be rejected if any check does not match. <strong>{hasPaid ? 'The payment will be refunded upon rejection.' : 'No payment has been made yet.'}</strong></span>
                </div>
                <div className="form-field mt-1">
                  <label className="form-label">Rejection Reason:<span className="text-danger">*</span></label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="State reason for rejecting demand..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <div className="alert-banner danger mt-1 small">{error}</div>}
          </div>

          <div className="csd-modal-footer between">
            <button type="button" className="btn-depot-manual-close" onClick={onClose}>CLOSE</button>
            {isApprove ? (
              <button type="submit" className="btn-depot-action-approve" disabled={busy || !ready || !allChecked}>
                {busy ? 'Processing...' : stage1 ? 'Approve & Enable Payment' : 'Approve & Issue Supply Order'}
              </button>
            ) : (
              <button type="submit" className="btn-depot-action-reject" disabled={busy}>
                {busy ? 'Processing...' : 'Confirm Rejection'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
