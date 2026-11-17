import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import PriceLock from "../PriceLock.jsx";
import { inr } from "../../data/utils.js";

export function ProductBuyBox({
  p,
  id,
  isAuthenticated,
  isPendingApproval,
  color,
  setColor,
  checkoutErrors,
  availableStates,
  selectedState,
  handleStateChange,
  availableDealers,
  selectedDealerId,
  handleDealerChange,
  loadingDealers,
  currentDealer,
  setDealerModalOpen,
  availableDepots,
  selectedDepotId,
  handleDepotChange,
  loadingDepots,
  availableUrcs,
  selectedUrcId,
  handleUrcChange,
  loadingUrcs,
  currentUrc,
  setUrcModalOpen,
  loadingStatePrice,
  fetchingStatePrice,
  statePricing,
  checkingEligibility,
  handleCheckoutClick,
}) {
  return (
    <div className="pdp-spec-form">
      {/* Color Dropdown (only when the server provides colours) */}
      {p?.colors?.length > 0 && (
        <div>
          <label className="form-label font-semibold pdp-form-label">
            Color <span className="pdp-req-star">*</span>
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className={`select-input pdp-form-select ${checkoutErrors?.color ? "has-error" : ""}`}
          >
            <option value="">-- Select Color --</option>
            {p.colors.map((cName) => {
              const co = (p.colorObjs || []).find((x) => x.name === cName);
              const showPrice =
                isAuthenticated && p.colorPricing === "PER_COLOR" && co?.price;
              return (
                <option key={cName} value={cName}>
                  {cName}
                  {showPrice
                    ? ` - ₹${Number(co.price).toLocaleString("en-IN")}`
                    : ""}
                </option>
              );
            })}
          </select>
          {checkoutErrors?.color && (
            <span className="micro text-danger pdp-error-text">
              {checkoutErrors.color}
            </span>
          )}
        </div>
      )}

      {/* State Dropdown + Dynamic Count */}
      <div>
        <div className="between pdp-form-label">
          <label className="form-label font-semibold pdp-form-label-inline">
            State <span className="pdp-req-star">*</span>
          </label>
          <span className="badge pdp-count-badge">
            Count: {availableStates?.length || 0}
          </span>
        </div>
        <select
          value={selectedState || ""}
          onChange={(e) => handleStateChange(e.target.value)}
          className={`select-input pdp-form-select ${checkoutErrors?.state ? "has-error" : ""}`}
        >
          <option value="">-- Select State --</option>
          {(availableStates || []).map((st) => {
            const stName = st?.state || st;
            return (
              <option key={stName} value={stName}>
                {stName}
              </option>
            );
          })}
        </select>
        {checkoutErrors?.state && (
          <span className="micro text-danger pdp-error-text">
            {checkoutErrors.state}
          </span>
        )}
      </div>

      {/* Dealer Dropdown + View Dealer Button */}
      <div>
        <label className="form-label font-semibold pdp-form-label">
          Dealer <span className="pdp-req-star">*</span>
        </label>
        <div className="pdp-input-action-row">
          <select
            value={selectedDealerId || ""}
            onChange={(e) => handleDealerChange(e.target.value)}
            disabled={!selectedState}
            className={`select-input pdp-form-select pdp-input-flex-1 ${checkoutErrors?.dealer ? "has-error" : ""}`}
          >
            <option value="">
              {!selectedState
                ? "-- Select State First --"
                : "-- Select Dealer --"}
            </option>
            {(availableDealers || []).map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.city || d.state || ""})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setDealerModalOpen(true)}
            disabled={!currentDealer}
            className="btn-view-dealer"
          >
            View Dealer
          </button>
        </div>
        {selectedState &&
          !loadingDealers &&
          availableDealers?.length === 0 && (
            <p className="micro text-danger mt-1">
              No authorized dealer available for this product in {selectedState}.
            </p>
          )}
        {checkoutErrors?.dealer && (
          <span className="micro text-danger pdp-error-text">
            {checkoutErrors.dealer}
          </span>
        )}
      </div>

      {/* Depot Dropdown */}
      <div>
        <label className="form-label font-semibold pdp-form-label">
          Depot <span className="pdp-req-star">*</span>
        </label>
        <select
          value={selectedDepotId || ""}
          onChange={(e) => handleDepotChange(e.target.value)}
          disabled={!selectedState || !selectedDealerId}
          className={`select-input pdp-form-select ${checkoutErrors?.depot ? "has-error" : ""}`}
        >
          <option value="">
            {!selectedState
              ? "-- Select State First --"
              : !selectedDealerId
                ? "-- Select Dealer First --"
                : "-- Select Depot --"}
          </option>
          {(availableDepots || []).map((dep) => (
            <option key={dep._id} value={dep._id}>
              {dep.name} ({dep.city || dep.state || ""})
            </option>
          ))}
        </select>
        {selectedDealerId &&
          !loadingDepots &&
          availableDepots?.length === 0 && (
            <p className="micro text-danger mt-1">
              No depot is linked to this dealer in {selectedState}.
            </p>
          )}
        {checkoutErrors?.depot && (
          <span className="micro text-danger pdp-error-text">
            {checkoutErrors.depot}
          </span>
        )}
      </div>

      {/* URC Dropdown + View URC Button */}
      <div>
        <label className="form-label font-semibold pdp-form-label">
          URC <span className="pdp-req-star">*</span>
        </label>
        <div className="pdp-input-action-row">
          <select
            value={selectedUrcId || ""}
            onChange={(e) => handleUrcChange(e.target.value)}
            disabled={!selectedDepotId}
            className={`select-input pdp-form-select pdp-input-flex-1 ${checkoutErrors?.urc ? "has-error" : ""}`}
          >
            <option value="">
              {!selectedDepotId
                ? "-- Select Depot First --"
                : "-- Select URC --"}
            </option>
            {(availableUrcs || []).map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} {u.city ? `(${u.city})` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setUrcModalOpen(true)}
            disabled={!currentUrc}
            className="btn-view-urc"
          >
            View URC
          </button>
        </div>
        {selectedDepotId && !loadingUrcs && availableUrcs?.length === 0 && (
          <p className="micro text-danger mt-1">
            No URC available for the selected depot.
          </p>
        )}
        {checkoutErrors?.urc && (
          <span className="micro text-danger pdp-error-text">
            {checkoutErrors.urc}
          </span>
        )}
      </div>

      {/* State-wise Concessional Price Display matching Official CSD Price List */}
      {!isAuthenticated ? (
        <PriceLock block />
      ) : (
        <div className="pdp-price-box pdp-rate-sheet-box">
          <div className="between align-center mb-1">
            <span className="small font-bold pdp-rate-customer-label">
              {selectedState
                ? `State Price (${selectedState}):`
                : "State Price:"}
            </span>
            <div className="h3 font-bold text-brand pdp-price-amount">
              {!selectedState ? (
                <span className="micro text-muted font-normal">
                  Select State to view price
                </span>
              ) : loadingStatePrice || fetchingStatePrice ? (
                <span className="micro text-muted font-normal">
                  Loading price...
                </span>
              ) : statePricing ? (
                inr(statePricing.unitPrice || statePricing.totalAmount)
              ) : (
                <span className="micro text-danger font-normal">
                  State price not available
                </span>
              )}
            </div>
          </div>

          {checkoutErrors?.price && (
            <p className="micro text-danger mb-2">{checkoutErrors.price}</p>
          )}

          {selectedState && statePricing ? (
            <div className="csd-official-rate-sheet pdp-official-breakdown">
              <div className="pdp-breakdown-title">
                📋 Official CSD Rate Breakdown (INDEX NO:{" "}
                {p.indexNo || p.sku})
              </div>
              <div className="between py-1 pdp-breakdown-row">
                <span className="muted">
                  Basic Price (incl. Dealer Margin):
                </span>
                <span>
                  ₹{" "}
                  {Number(statePricing.basicPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
              {Number(statePricing.taxAmount || 0) > 0 && (
                <div className="between py-1 pdp-breakdown-row">
                  <span className="muted">
                    Concessional Taxes (GST / Statutory):
                  </span>
                  <span>
                    + ₹{" "}
                    {Number(statePricing.taxAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {Number(statePricing.csdProfitAmount || 0) > 0 && (
                <div className="between py-1 pdp-breakdown-row">
                  <span className="muted">CSD Profit Margin:</span>
                  <span>
                    + ₹{" "}
                    {Number(statePricing.csdProfitAmount).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              )}
              {Number(statePricing.tcsAmount || 0) > 0 && (
                <div className="between py-1 pdp-breakdown-row">
                  <span className="muted">TCS (if applicable):</span>
                  <span>
                    + ₹ {Number(statePricing.tcsAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="micro muted mt-1 pt-1 pdp-dealer-ref-note">
                State: {selectedState} | Source:{" "}
                {statePricing.priceSource || "STATE"}
              </div>
            </div>
          ) : !selectedState ? (
            <div className="micro muted pdp-price-subtext">
              Please select a State to view state-wise concessional CSD
              ex-showroom price.
            </div>
          ) : (
            <div className="micro text-danger pdp-price-subtext">
              State price is not available for this product in {selectedState}.
            </div>
          )}
        </div>
      )}

      {/* Login Required Notice */}
      {!isAuthenticated && (
        <div className="pdp-login-notice">
          <div className="pdp-notice-inner">
            <div className="pdp-notice-text-wrap">
              <Lock size={16} className="pdp-notice-icon" />
              <span>
                <strong>Login Required:</strong> Please log in to unlock
                checkout and generate demand.
              </span>
            </div>
            <Link
              to={`/login?redirect=${encodeURIComponent(`/products/${id}`)}`}
              className="pdp-notice-login-link"
            >
              Login Now <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Pending Approval Notice */}
      {isAuthenticated && isPendingApproval && (
        <div className="pdp-pending-notice">
          <div className="pdp-pending-title">
            <AlertCircle size={16} /> Account Pending Admin Approval
          </div>
          Your account is pending admin approval. You can view products, but
          demand generation will be available after your account is approved by
          the administrator.
        </div>
      )}

      {/* Official CHECKOUT CTA */}
      <button
        type="button"
        onClick={handleCheckoutClick}
        disabled={!isAuthenticated || checkingEligibility || isPendingApproval}
        className={`btn-checkout-cta ${!isAuthenticated || isPendingApproval ? "btn-checkout-disabled" : ""}`}
        title={
          !isAuthenticated
            ? "Please login to proceed with checkout"
            : isPendingApproval
              ? "Your account is pending admin approval. Demand generation will be available after your account is approved by the administrator."
              : undefined
        }
      >
        {!isAuthenticated ? (
          <span className="btn-checkout-content">
            <Lock size={16} /> LOGIN TO CHECKOUT
          </span>
        ) : isPendingApproval ? (
          "DEMAND GENERATION DISABLED (APPROVAL PENDING)"
        ) : checkingEligibility ? (
          "VERIFYING ELIGIBILITY..."
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
}

export default ProductBuyBox;
