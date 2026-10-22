import React from 'react';
import { X, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

export function EligibilityModal({
  isOpen,
  onClose,
  onContinue,
  eligibilityResult,
  product
}) {
  if (!isOpen) return null;

  const isEligible = eligibilityResult?.eligible;
  const reason = eligibilityResult?.reason || 'Eligibility check completed.';
  const type = eligibilityResult?.type;

  return (
    <div className="csd-modal-backdrop" onClick={onClose}>
      <div className="csd-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`csd-modal-header ${isEligible ? 'eligibility-header-eligible' : 'eligibility-header-ineligible'}`}>
          <div className="row align-center gap-1">
            {isEligible ? (
              <CheckCircle2 size={22} color="#16a34a" />
            ) : (
              <ShieldAlert size={22} color="#e11d48" />
            )}
            <h3 className="csd-modal-title">
              Eligibility Validation
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

        {/* Body matching Fig. 9 and Fig. 11 */}
        <div className="csd-modal-body eligibility-body-center">
          {isEligible ? (
            <div>
              <div className="eligibility-icon-circle-eligible">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="eligibility-title-success">
                Entitlement Verified
              </h4>
              <p className="eligibility-text-success">
                {reason}
              </p>
              {eligibilityResult?.details && (
                <div className="eligibility-details-box">
                  <div className="between eligibility-meta-row">
                    <span>Entitlement Category:</span>
                    <strong>{eligibilityResult.details.entitlementCategory}</strong>
                  </div>
                  <div className="between">
                    <span>Applicable Price Cap:</span>
                    <strong>₹ {eligibilityResult.details.ceiling?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="eligibility-icon-circle-ineligible">
                <AlertCircle size={32} />
              </div>
              <h4 className="eligibility-heading-ineligible">
                Entitlement Requirement Not Met
              </h4>
              {Array.isArray(eligibilityResult?.reasons) && eligibilityResult.reasons.length > 0 ? (
                <div className="eligibility-reasons-box">
                  {eligibilityResult.reasons.map((r, idx) => (
                    <div key={idx} className="eligibility-reason-item">
                      • {r.message || r.code}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="eligibility-reason-ineligible">
                  {reason}
                </p>
              )}
              <p className="eligibility-text-sub eligibility-text-mt">
                Defence Ministry policy regulates vehicle entitlement according to pay level, minimum service years, and quota frequency.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="csd-modal-footer eligibility-footer-split">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm row align-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>Back to Product</span>
          </button>

          {isEligible && (
            <button
              type="button"
              onClick={onContinue}
              className="btn btn-primary btn-sm row align-center gap-1"
            >
              <span>Continue to Checkout</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EligibilityModal;
