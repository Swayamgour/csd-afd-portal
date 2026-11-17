import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function CheckoutOrderSummary({
  product,
  dealerInfo,
  isCsdRateList,
  subtotal,
  discountVal,
  csdBasic,
  additionalCost,
  cess,
  incidentalCharges,
  tcsVal,
  netPrice,
  isPriceMatched,
  submitting,
  isPendingApproval,
}) {
  return (
    <div className="checkout-summary-sticky">
      <div className="checkout-card">
        <div className="demand-summary-header">
          <h3 className="demand-summary-title">Your demand</h3>
        </div>

        {/* Product Info */}
        <div className="demand-product-info-box">
          <div className="demand-summary-product-name">
            {product?.productName}
          </div>
          <div className="checkout-spec-pill-group">
            <span className="checkout-spec-pill">{product?.sku}</span>
            <span className="checkout-spec-pill badge-green-pill">
              {product?.taxClass || 'tax-class-8'}
            </span>
          </div>
        </div>

        {/* Color & Dealer Specification */}
        <div className="demand-summary-dealer-box">
          <div className="demand-summary-meta-line">
            Color: <strong>{product?.selectedColor || 'GRANITE GREY'}</strong>
          </div>
          <div className="demand-summary-meta-line">
            Dealer Name: <strong>{dealerInfo?.name}</strong>
          </div>
          <div className="demand-summary-meta-line">
            Dealer Address: <span className="text-muted">{dealerInfo?.address}</span>
          </div>
          <div className="checkout-form-row-2 row-mt-xs">
            <div className="demand-summary-meta-line">
              Depot: <strong>{product?.selectedDepot}</strong>
            </div>
            <div className="demand-summary-meta-line">
              URC: <strong>{product?.selectedUrc}</strong>
            </div>
          </div>
        </div>

        {/* Breakdown Table matching Fig. 12 & Official CSD Rate Sheet */}
        <table className="demand-summary-calc-table">
          <tbody>
            {isCsdRateList ? (
              <>
                <tr>
                  <td>Basic Price (incl. Dealer Margin)</td>
                  <td>₹ {Number(subtotal || 0).toLocaleString('en-IN')}</td>
                </tr>
                {discountVal > 0 && (
                  <tr className="row-discount-positive">
                    <td>CSD Discount & Market Scheme</td>
                    <td>- ₹ {Number(discountVal || 0).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td>CSD Basic with Discount</td>
                  <td className="font-semibold">₹ {Number(csdBasic || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>CGST Concession</td>
                  <td>₹ {Number(additionalCost || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>SGST Concession</td>
                  <td>₹ {Number(cess || 0).toLocaleString('en-IN')}</td>
                </tr>
                {incidentalCharges > 0 && (
                  <tr>
                    <td>CSD Profit @ 0.50%</td>
                    <td>₹ {Number(incidentalCharges || 0).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {tcsVal > 0 && (
                  <tr>
                    <td>TCS @ 1% (Above 10 Lacs)</td>
                    <td>₹ {Number(tcsVal || 0).toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </>
            ) : (
              <>
                <tr>
                  <td>Subtotal</td>
                  <td>₹ {Number(subtotal || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Additional Cost (14%)</td>
                  <td>₹ {Number(additionalCost || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Cess (17%)</td>
                  <td>₹ {Number(cess || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Incidental Charges (0.5%)</td>
                  <td>₹ {Number(incidentalCharges || 0).toLocaleString('en-IN')}</td>
                </tr>
              </>
            )}
            <tr className="demand-summary-net-row">
              <td>
                <div>Net Price to be Paid</div>
                <small className="summary-detail-sub">Inclusive of all Taxes and Levies</small>
              </td>
              <td className="demand-summary-net-price">
                ₹ {Number(netPrice || 0).toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={!isPriceMatched || submitting || isPendingApproval}
          className={`btn-submit-demand ${isPendingApproval ? 'btn-disabled-login' : ''}`}
          title={
            isPendingApproval
              ? 'Your account is pending approval. Demand generation is unavailable until approval.'
              : undefined
          }
        >
          {submitting
            ? 'Generating Demand...'
            : isPendingApproval
            ? 'ACCOUNT APPROVAL PENDING'
            : 'Submit Demand for Depot Approval'}
        </button>

        <div className="text-center mt-2">
          <span
            className="checkout-spec-pill badge-green-pill"
            style={{ display: 'inline-flex', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}
          >
            ✓ No Payment Required at Checkout
          </span>
        </div>

        {isPendingApproval && (
          <p className="csd-form-error-text error-text-center mt-2">
            ⚠ Your account is pending approval. Demand generation is unavailable until approval.
          </p>
        )}

        {!isPriceMatched && !isPendingApproval && (
          <p className="csd-form-error-text error-text-center">
            ⚠ Please match Dealer Price with Net Price to proceed.
          </p>
        )}
      </div>

      {/* Statutory Security Seal */}
      <div className="csd-alert-banner info">
        <ShieldCheck size={20} color="var(--color-success)" flexShrink={0} />
        <span className="text-xs-clean">
          Statutory AFD Portal: All allocations are protected by Armed Forces HQ guidelines. No dealer handling
          charges allowed.
        </span>
      </div>
    </div>
  );
}

export default CheckoutOrderSummary;
