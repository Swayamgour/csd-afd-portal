import React from 'react';
import { FileText, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { DocumentUpload } from '../common/DocumentUpload.jsx';

export function CheckoutAdditionalInfoCard({
  prevPurchase,
  setPrevPurchase,
  prevPurchaseDate,
  setPrevPurchaseDate,
  payLevel,
  setPayLevel,
  payLevels,
  addressLine,
  setAddressLine,
  townCity,
  setTownCity,
  pincode,
  setPincode,
  billingState,
  setBillingState,
  statesList,
  country,
  canteenCardFile,
  setCanteenCardFile,
  panCopyFile,
  setPanCopyFile,
  availabilityCertFile,
  setAvailabilityCertFile,
  dealerPriceInput,
  setDealerPriceInput,
  handleMatchPrice,
  isPriceMatched,
  netPrice,
  enteredDealerPrice,
  ppoDocFile,
  setPpoDocFile,
  pensionSlipFile,
  setPensionSlipFile,
  hasLoan,
  setHasLoan,
  loanAmount,
  setLoanAmount,
  loanSanctionFile,
  setLoanSanctionFile,
  setPaymentMode,
  formErrors,
}) {
  return (
    <div className="checkout-card">
      <div className="checkout-card-header">
        <div className="checkout-card-title">
          <FileText size={20} color="#d97706" />
          <span>Additional Required Information</span>
        </div>
        <p className="csd-form-helper-text">
          User will have to upload the documents and requested data. No serving document should be uploaded until specified.
        </p>
      </div>

      <div className="checkout-form-stack">
        {/* Previous Purchase Question (Fig. 15 & 18) */}
        <div className="dealer-price-validation-box">
          <label className="csd-form-label">
            Did you purchase AFD1 item (same category) earlier from CSD? <span className="doc-upload-required-star">*</span>
          </label>
          <div className="checkout-radio-card-group">
            <label className={`checkout-radio-card ${prevPurchase === 'Yes' ? 'active' : ''}`}>
              <input
                type="radio"
                name="prevPurchase"
                value="Yes"
                checked={prevPurchase === 'Yes'}
                onChange={() => setPrevPurchase('Yes')}
              />
              <span className="checkout-radio-card-title">Yes</span>
            </label>
            <label className={`checkout-radio-card ${prevPurchase === 'No' ? 'active' : ''}`}>
              <input
                type="radio"
                name="prevPurchase"
                value="No"
                checked={prevPurchase === 'No'}
                onChange={() => setPrevPurchase('No')}
              />
              <span className="checkout-radio-card-title">No</span>
            </label>
          </div>

          {prevPurchase === 'Yes' && (
            <div className="previous-purchase-date-box">
              <label className="csd-form-label">
                Date of last purchase of Ibid item <span className="doc-upload-required-star">*</span>
              </label>
              <input
                type="date"
                className={`csd-form-input ${formErrors?.prevPurchaseDate ? 'has-error' : ''}`}
                value={prevPurchaseDate}
                onChange={(e) => setPrevPurchaseDate(e.target.value)}
                required={prevPurchase === 'Yes'}
              />
              <p className="csd-form-helper-text">
                Notice: As per CSD rules, four-wheelers may only be purchased once in 5 to 8 years depending on service entitlement.
              </p>
              {formErrors?.prevPurchaseDate && (
                <span className="csd-form-error-text">
                  <AlertCircle size={14} /> {formErrors.prevPurchaseDate}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pay Level (Fig. 15) */}
        <div className="csd-form-group">
          <label className="csd-form-label">
            Pay Level <span className="doc-upload-required-star">*</span>
          </label>
          <select
            value={payLevel}
            onChange={(e) => setPayLevel(e.target.value)}
            className="csd-form-select"
          >
            {(payLevels || []).map((pl) => (
              <option key={pl.value} value={pl.value}>
                {pl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Registration Address (Fig. 15) */}
        <div className="csd-form-group">
          <label className="csd-form-label">
            Address for registration <span className="doc-upload-required-star">*</span>
          </label>
          <input
            type="text"
            className={`csd-form-input ${formErrors?.addressLine ? 'has-error' : ''}`}
            placeholder="House number and street name"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            required
          />
          {formErrors?.addressLine && (
            <span className="csd-form-error-text">
              <AlertCircle size={14} /> {formErrors.addressLine}
            </span>
          )}
        </div>

        {/* Town/City, Pincode, Billing State, Country */}
        <div className="checkout-form-row-2">
          <div className="csd-form-group">
            <label className="csd-form-label">
              Town / City <span className="doc-upload-required-star">*</span>
            </label>
            <input
              type="text"
              className={`csd-form-input ${formErrors?.townCity ? 'has-error' : ''}`}
              placeholder="e.g. New Delhi"
              value={townCity}
              onChange={(e) => setTownCity(e.target.value)}
              required
            />
          </div>

          <div className="csd-form-group">
            <label className="csd-form-label">
              Pin code <span className="doc-upload-required-star">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              className={`csd-form-input ${formErrors?.pincode ? 'has-error' : ''}`}
              placeholder="e.g. 110010"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="csd-form-group">
            <label className="csd-form-label">
              Billing State <span className="doc-upload-required-star">*</span>
            </label>
            <select
              value={billingState}
              onChange={(e) => setBillingState(e.target.value)}
              className={`csd-form-select ${formErrors?.billingState ? 'has-error' : ''}`}
            >
              {(statesList || []).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="csd-form-group">
            <label className="csd-form-label">
              Country <span className="doc-upload-required-star">*</span>
            </label>
            <input
              type="text"
              value={country}
              disabled
              className="csd-form-input bg-slate-muted"
            />
          </div>
        </div>

        {/* Mandatory Document Uploads */}
        <div className="checkout-docs-section">
          <h4 className="checkout-docs-title">
            Statutory Documents & Certificates
          </h4>

          <DocumentUpload
            label="Canteen Card"
            required
            file={canteenCardFile}
            onFileSelect={setCanteenCardFile}
            onFileRemove={() => setCanteenCardFile(null)}
            error={formErrors?.canteenCard}
            helperText="Upload scanned copy of valid CSD Smart Grocery / Liquor Card (PDF, JPG, PNG)"
          />

          <DocumentUpload
            label="PAN copy"
            required
            file={panCopyFile}
            onFileSelect={setPanCopyFile}
            onFileRemove={() => setPanCopyFile(null)}
            error={formErrors?.panCopy}
            helperText="Upload official self-attested Permanent Account Number card copy"
          />

          <DocumentUpload
            label="Availability certificate"
            required
            file={availabilityCertFile}
            onFileSelect={setAvailabilityCertFile}
            onFileRemove={() => setAvailabilityCertFile(null)}
            error={formErrors?.availabilityCert}
            helperText="Upload official Availability Certificate signed and stamped by authorized CSD Dealer"
          />

          {/* Dealer Price Mentioned in Availability Certificate */}
          <div className="dealer-price-validation-box">
            <div className="dealer-price-header-row">
              <label className="csd-form-label label-clean-bold">
                Dealer Price mentioned in Availability certificate <span className="doc-upload-required-star">*</span>
              </label>
              <button
                type="button"
                onClick={handleMatchPrice}
                className="btn-autofill-price"
                title="Auto-fill exact Net Price"
              >
                <Sparkles size={13} aria-hidden />
                <span>Auto-fill Net Price (₹ {Number(netPrice || 0).toLocaleString('en-IN')})</span>
              </button>
            </div>

            <div className={`dealer-price-input-wrapper ${isPriceMatched ? 'is-matched' : 'is-mismatched'}`}>
              <span className="dealer-price-currency-tag">₹</span>
              <input
                type="number"
                className="dealer-price-field"
                value={dealerPriceInput}
                onChange={(e) => setDealerPriceInput(e.target.value)}
                placeholder="Enter exact price quoted in availability certificate"
                required
              />
              {isPriceMatched && (
                <span className="dealer-price-matched-indicator">
                  <CheckCircle2 size={16} />
                  <span>Matched with Net Price</span>
                </span>
              )}
            </div>

            {!isPriceMatched && (
              <div className="price-mismatch-alert-banner">
                <AlertCircle size={16} flexShrink={0} />
                <span>
                  <strong>Dealer Price and Net Price to be Paid must be the same.</strong> Net Price: ₹{Number(netPrice || 0).toLocaleString('en-IN')}, Dealer Price: ₹{Number(enteredDealerPrice || 0).toLocaleString('en-IN')}.
                </span>
              </div>
            )}
          </div>

          {/* Optional for ESM / Pensioners */}
          <div className="checkout-form-row-2">
            <DocumentUpload
              label="PPO / Discharge Book / Release Order"
              file={ppoDocFile}
              onFileSelect={setPpoDocFile}
              onFileRemove={() => setPpoDocFile(null)}
              helperText="Required for Ex-Servicemen (ESM) applicants"
            />

            <DocumentUpload
              label="Last Pension slip"
              file={pensionSlipFile}
              onFileSelect={setPensionSlipFile}
              onFileRemove={() => setPensionSlipFile(null)}
              helperText="Required for Ex-Servicemen (ESM) applicants"
            />
          </div>
        </div>

        {/* Loan Section */}
        <div className="dealer-price-validation-box">
          <label className="csd-form-label">
            Have you taken loan? <span className="doc-upload-required-star">*</span>
          </label>
          <div className="checkout-radio-card-group">
            <label className={`checkout-radio-card ${hasLoan === 'Yes' ? 'active' : ''}`}>
              <input
                type="radio"
                name="hasLoan"
                value="Yes"
                checked={hasLoan === 'Yes'}
                onChange={() => {
                  setHasLoan('Yes');
                  setPaymentMode('DIRECT_BANK_TRANSFER');
                }}
              />
              <span className="checkout-radio-card-title">Yes</span>
            </label>
            <label className={`checkout-radio-card ${hasLoan === 'No' ? 'active' : ''}`}>
              <input
                type="radio"
                name="hasLoan"
                value="No"
                checked={hasLoan === 'No'}
                onChange={() => setHasLoan('No')}
              />
              <span className="checkout-radio-card-title">No</span>
            </label>
          </div>

          {hasLoan === 'Yes' && (
            <div className="previous-purchase-date-box">
              <div className="csd-form-group">
                <label className="csd-form-label">
                  Loan Amount <span className="doc-upload-required-star">*</span>
                </label>
                <input
                  type="number"
                  className={`csd-form-input ${formErrors?.loanAmount ? 'has-error' : ''}`}
                  placeholder="e.g. 500000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required={hasLoan === 'Yes'}
                />
                {formErrors?.loanAmount && (
                  <span className="csd-form-error-text">
                    <AlertCircle size={14} /> {formErrors.loanAmount}
                  </span>
                )}
              </div>

              <DocumentUpload
                label="Loan Sanction Letter"
                required
                file={loanSanctionFile}
                onFileSelect={setLoanSanctionFile}
                onFileRemove={() => setLoanSanctionFile(null)}
                error={formErrors?.loanSanction}
                helperText="Upload official sanction letter from nationalized / scheduled commercial bank"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutAdditionalInfoCard;
