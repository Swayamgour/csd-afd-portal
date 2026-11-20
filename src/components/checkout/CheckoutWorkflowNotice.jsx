import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function CheckoutWorkflowNotice({
  paymentMode,
  setPaymentMode,
  hasLoan,
  formErrors,
  remarks,
  setRemarks,
  onlineChannel,
  setOnlineChannel,
  accountHolderName,
  setAccountHolderName,
  bankAccountNumber,
  setBankAccountNumber,
  ownAccountCertified,
  setOwnAccountCertified,
  undertakingAccepted,
  setUndertakingAccepted,
}) {
  // Online-payment details are asked only when no loan is taken and Online Payment is chosen
  const showOnlineDetails = hasLoan !== 'Yes' && paymentMode === 'ONLINE_PAYMENT';
  const needsAccountDetails = showOnlineDetails && onlineChannel === 'NETBANKING_UPI_CHALLAN';

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

        {showOnlineDetails && (
          <div className="checkout-online-details">
            <label className="csd-form-label">
              Payment made through <span className="doc-upload-required-star">*</span>
            </label>
            <div className="checkout-radio-card-group">
              <label className={`checkout-radio-card ${onlineChannel === 'NETBANKING_UPI_CHALLAN' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="onlineChannel"
                  value="NETBANKING_UPI_CHALLAN"
                  checked={onlineChannel === 'NETBANKING_UPI_CHALLAN'}
                  onChange={() => setOnlineChannel('NETBANKING_UPI_CHALLAN')}
                />
                <span className="checkout-radio-card-title">Netbanking / UPI / E-Challan</span>
              </label>
              <label className={`checkout-radio-card ${onlineChannel === 'CARD' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="onlineChannel"
                  value="CARD"
                  checked={onlineChannel === 'CARD'}
                  onChange={() => setOnlineChannel('CARD')}
                />
                <span className="checkout-radio-card-title">Credit / Debit Card</span>
              </label>
            </div>
            {formErrors?.onlineChannel && (
              <span className="csd-form-error"><AlertCircle size={14} /> {formErrors.onlineChannel}</span>
            )}

            {needsAccountDetails && (
              <>
                <div className="csd-form-group">
                  <label className="csd-form-label" htmlFor="accountHolderName">
                    Name of the first account holder <span className="doc-upload-required-star">*</span>
                  </label>
                  <input
                    id="accountHolderName"
                    type="text"
                    className={`csd-form-input ${formErrors?.accountHolderName ? 'has-error' : ''}`}
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    autoComplete="off"
                  />
                  {formErrors?.accountHolderName && (
                    <span className="csd-form-error"><AlertCircle size={14} /> {formErrors.accountHolderName}</span>
                  )}
                </div>
                <div className="csd-form-group">
                  <label className="csd-form-label" htmlFor="bankAccountNumber">
                    Bank Account Number <span className="doc-upload-required-star">*</span>
                  </label>
                  <input
                    id="bankAccountNumber"
                    type="text"
                    inputMode="numeric"
                    maxLength={18}
                    className={`csd-form-input ${formErrors?.bankAccountNumber ? 'has-error' : ''}`}
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                    autoComplete="off"
                  />
                  {formErrors?.bankAccountNumber && (
                    <span className="csd-form-error"><AlertCircle size={14} /> {formErrors.bankAccountNumber}</span>
                  )}
                </div>
              </>
            )}

            <label className="checkout-check-row">
              <input
                type="checkbox"
                checked={ownAccountCertified}
                onChange={(e) => setOwnAccountCertified(e.target.checked)}
              />
              <span>
                This is to certify that online payment is being made from my own account.{' '}
                <span className="doc-upload-required-star">*</span>
              </span>
            </label>
            {formErrors?.ownAccountCertified && (
              <span className="csd-form-error"><AlertCircle size={14} /> {formErrors.ownAccountCertified}</span>
            )}

            <div className="checkout-gateway-box">
              <strong>Pay Gov Payment Gateway</strong>
              <div className="small muted">Pay by Razorpay - Cards, Netbanking, Wallet &amp; UPI</div>
              <div className="small muted">The payment link is enabled after the depot approves your demand.</div>
            </div>
          </div>
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

      <div className="csd-form-group">
        <label className="checkout-check-row">
          <input
            type="checkbox"
            checked={undertakingAccepted}
            onChange={(e) => setUndertakingAccepted(e.target.checked)}
          />
          <span>
            I accept an undertaking that in case details provided by me are found to be incorrect, I will be liable
            for disciplinary action (serving) / CSD facility will be withdrawn (ESM).{' '}
            <span className="doc-upload-required-star">*</span>
          </span>
        </label>
        {formErrors?.undertaking && (
          <span className="csd-form-error"><AlertCircle size={14} /> {formErrors.undertaking}</span>
        )}
      </div>
    </>
  );
}

export default CheckoutWorkflowNotice;
