import React, { useState } from 'react';
import { X, ShieldCheck, Landmark } from 'lucide-react';

export function DemandConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  demandSummary,
  loading = false
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [showBankInstructions, setShowBankInstructions] = useState(false);

  if (!isOpen || !demandSummary) return null;

  const {
    productName,
    sku,
    color,
    dealerName,
    depot,
    urc,
    priceZone,
    netPrice,
    paymentMethod
  } = demandSummary;

  const isDirectBankTransfer = paymentMethod === 'Direct Bank Transfer';

  const handleFinalSubmit = () => {
    if (isDirectBankTransfer) {
      setShowBankInstructions(true);
    } else {
      onConfirm();
    }
  };

  const handleBankInstructionsProceed = () => {
    setShowBankInstructions(false);
    onConfirm();
  };

  return (
    <div className="csd-modal-backdrop" onClick={onClose}>
      <div className="csd-modal-window" onClick={(e) => e.stopPropagation()}>
        {!showBankInstructions ? (
          // Standard Demand Confirmation
          <>
            <div className="csd-modal-header modal-navy-header">
              <div className="row align-center gap-1">
                <ShieldCheck size={20} color="#f59e0b" />
                <h3 className="csd-modal-title">
                  Confirm Demand Submission
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="csd-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="csd-modal-body">
              <div className="confirm-summary-box">
                <h4 className="confirm-summary-title">
                  {productName}
                </h4>
                <div className="confirm-summary-grid">
                  <div>SKU: <strong>{sku}</strong></div>
                  <div>Color: <strong>{color || 'Standard'}</strong></div>
                  <div>Price Zone: <strong>{priceZone}</strong></div>
                  <div>Depot: <strong>{depot}</strong></div>
                  <div className="confirm-grid-span-2">URC: <strong>{urc}</strong></div>
                  <div className="confirm-grid-span-2">Dealer: <strong>{dealerName}</strong></div>
                </div>
              </div>

              <div className="confirm-net-price-box mb-1">
                <div>
                  <span className="confirm-net-amount-title">
                    Net Amount to be Paid
                  </span>
                  <div className="confirm-net-amount-val">
                    ₹ {Number(netPrice).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="confirm-mode-meta">
                  <span>Payment Mode</span>
                  <div>
                    {paymentMethod}
                  </div>
                </div>
              </div>

              <div className="confirm-disclaimer-box">
                <label className="row align-start gap-1 pointer confirm-disclaimer-label">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="confirm-disclaimer-checkbox"
                  />
                  <span className="confirm-disclaimer-text">
                    I confirm that the information provided above is correct. I understand that false declarations will lead to disciplinary/statutory action under Defence Services rules.
                  </span>
                </label>
              </div>
            </div>

            <div className="csd-modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!confirmed || loading}
                className="btn btn-primary btn-sm font-bold btn-confirm-submit"
              >
                {loading ? 'Submitting...' : 'Submit Demand'}
              </button>
            </div>
          </>
        ) : (
          // Direct Bank Transfer Instruction Pop-up matching PDF Fig. 19
          <>
            <div className="csd-modal-header modal-navy-header">
              <div className="row align-center gap-1">
                <Landmark size={20} color="#60a5fa" />
                <h3 className="csd-modal-title">
                  CHECKOUT · Direct Bank Transfer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBankInstructions(false)}
                className="csd-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="csd-modal-body bank-info-body">
              <p className="bank-info-p-header">
                Please deposit payment in account of <strong>Canteen Store Department Public Funds</strong>:
              </p>

              <div className="bank-info-table-box">
                <div className="bank-info-grid">
                  <span className="bank-info-label-muted">Bank Name:</span>
                  <strong>PUNJAB NATIONAL BANK</strong>

                  <span className="bank-info-label-muted">Account Name:</span>
                  <strong>Canteen Store Department Public Funds</strong>

                  <span className="bank-info-label-muted">IFSC Code:</span>
                  <strong className="bank-info-ifsc-val">PUNB0011200</strong>

                  <span className="bank-info-label-muted">Bank Account:</span>
                  <strong className="bank-info-acc-val">112002100027493</strong>

                  <span className="bank-info-label-muted">Total Payable:</span>
                  <strong className="bank-info-price-val">₹ {Number(netPrice).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <p className="bank-info-p-footer">
                Click <strong>Menu/Recent Demand</strong> link and upload payment receipt, payment details and submit demand to Depot for further processing.
              </p>
            </div>

            <div className="csd-modal-footer">
              <button
                type="button"
                onClick={() => setShowBankInstructions(false)}
                className="btn btn-outline btn-sm"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleBankInstructionsProceed}
                className="btn btn-primary btn-sm font-bold bank-btn-ok"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DemandConfirmationModal;
