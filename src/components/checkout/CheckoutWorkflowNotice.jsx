import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function CheckoutWorkflowNotice({
  paymentMode,
  setPaymentMode,
  hasLoan,
  formErrors,
  remarks,
  setRemarks,
}) {
  return (
    <>
      <div className="checkout-workflow-notice">
        <div className="checkout-workflow-header">
          <h4>
            <ShieldCheck size={18} color="#1e4fd8" />
            4. Payment Mode & Demand Workflow
          </h4>
          <span className="checkout-workflow-badge">Payment opens after depot approval</span>
        </div>

        <label className="csd-form-label">
          Preferred payment mode (used once the depot approves) <span className="doc-upload-required-star">*</span>
        </label>
        <div className="checkout-radio-card-group">
          <label className={`checkout-radio-card ${paymentMode === 'DIRECT_BANK_TRANSFER' ? 'active' : ''}`}>
            <input
              type="radio"
              name="paymentMode"
              value="DIRECT_BANK_TRANSFER"
              checked={paymentMode === 'DIRECT_BANK_TRANSFER'}
              onChange={() => setPaymentMode('DIRECT_BANK_TRANSFER')}
            />
            <span className="checkout-radio-card-title">Direct Bank Transfer (NEFT/RTGS)</span>
          </label>
          <label className={`checkout-radio-card ${paymentMode === 'ONLINE_PAYMENT' ? 'active' : ''}`} style={hasLoan === 'Yes' ? { opacity: 0.5 } : undefined}>
            <input
              type="radio"
              name="paymentMode"
              value="ONLINE_PAYMENT"
              disabled={hasLoan === 'Yes'}
              checked={paymentMode === 'ONLINE_PAYMENT'}
              onChange={() => setPaymentMode('ONLINE_PAYMENT')}
            />
            <span className="checkout-radio-card-title">Online Payment</span>
          </label>
        </div>
        {hasLoan === 'Yes' && (
          <p className="small muted">Online payment is not available when a loan is taken; use Direct Bank Transfer.</p>
        )}
        {formErrors?.paymentMode && (
          <span className="csd-form-error"><AlertCircle size={14} /> {formErrors.paymentMode}</span>
        )}

        <div className="checkout-workflow-timeline">
          <div className="checkout-workflow-step active">
            <div className="checkout-workflow-step-num">1</div>
            <div className="checkout-workflow-step-info">
              <div className="checkout-workflow-step-title">Demand generated (pending depot approval)</div>
              <div className="checkout-workflow-step-sub">Demand is lodged with KYC documents and availability certificate.</div>
            </div>
          </div>
          <div className="checkout-workflow-step">
            <div className="checkout-workflow-step-num">2</div>
            <div className="checkout-workflow-step-info">
              <div className="checkout-workflow-step-title">Depot approval</div>
              <div className="checkout-workflow-step-sub">Depot scrutinises your documents and eligibility. Once approved, the payment button is enabled for you.</div>
            </div>
          </div>
          <div className="checkout-workflow-step">
            <div className="checkout-workflow-step-num">3</div>
            <div className="checkout-workflow-step-info">
              <div className="checkout-workflow-step-title">Payment & depot verification</div>
              <div className="checkout-workflow-step-sub">You pay online, or by NEFT/RTGS with receipt upload. The depot verifies the payment, records it and prepares the Local Supply Order.</div>
            </div>
          </div>
          <div className="checkout-workflow-step">
            <div className="checkout-workflow-step-num">4</div>
            <div className="checkout-workflow-step-info">
              <div className="checkout-workflow-step-title">Final approval — Supply order issued (URC)</div>
              <div className="checkout-workflow-step-sub">Depot approves again after checking the payment; the Supply Order goes to the URC. If rejected after payment, the amount is refunded.</div>
            </div>
          </div>
          <div className="checkout-workflow-step">
            <div className="checkout-workflow-step-num">5</div>
            <div className="checkout-workflow-step-info">
              <div className="checkout-workflow-step-title">Delivery completed</div>
              <div className="checkout-workflow-step-sub">Item is delivered by the dealer against the Supply Order.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Remarks */}
      <div className="csd-form-group">
        <label className="csd-form-label">
          Additional remarks
        </label>
        <textarea
          rows={3}
          className="csd-form-textarea"
          placeholder="Notes about your order, e.g. special notes for delivery."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>
    </>
  );
}

export default CheckoutWorkflowNotice;
