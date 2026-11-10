import React, { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, AlertCircle, Loader2, Landmark } from 'lucide-react';
import Button from './Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useGetPaymentGatewaysQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useMockCompletePaymentMutation,
} from '../../features/payment/paymentApi.js';
import { demandAmount } from '../../utils/demandStatus.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { openRazorpayCheckout } from '../../utils/razorpay.js';
import {
  isFormPostCheckout,
  submitGatewayForm,
  rememberPendingPayment,
  gatewayLabel,
  gatewayUnavailableText,
} from '../../utils/gatewayCheckout.js';

/**
 * Pay a depot-approved demand online.
 *  - Gateways come from GET /payments/gateways (SBIePay / NDML). The beneficiary picks one, we call
 *    POST /payments/initiate {demandId, gateway} and POST the returned FORM_POST checkout to the gateway.
 *    The beneficiary comes back to /payments/result, where the server confirms the outcome with the gateway.
 *  - If no redirect gateway is enabled, the previous provider (Razorpay / mock) flow is used as before.
 * Not available when a loan is availed (Direct Bank Transfer only) - the backend enforces this too.
 */
export default function OnlinePaymentCard({ demand, onCancel, onPaid }) {
  const { user } = useAuth();
  const demandId = demand?._id || demand?.id;
  const amount = demandAmount(demand);
  const hasLoan = Boolean(demand?.loan?.isLoan || demand?.hasLoan);

  const { data: gateways = [], isLoading: loadingGateways, isError: gatewaysError } = useGetPaymentGatewaysQuery();
  const [createPayment] = useCreatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [mockComplete] = useMockCompletePaymentMutation();

  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const usable = gateways.filter((g) => g.available);
  const redirectMode = gateways.length > 0;

  // preselect the only usable gateway
  useEffect(() => {
    if (!selected && usable.length === 1) setSelected(usable[0].gateway);
  }, [usable, selected]);

  const money = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

  const pay = async () => {
    setError('');
    if (redirectMode && !selected) {
      setError('Please choose a payment gateway.');
      return;
    }
    setBusy(true);
    try {
      const init = await createPayment({ demandId, ...(redirectMode ? { gateway: selected } : {}) }).unwrap();

      // SBIePay / NDML: hand the browser over to the bank page
      if (isFormPostCheckout(init.checkout)) {
        rememberPendingPayment({ paymentNo: init.paymentNo, demandId, gateway: init.gateway });
        submitGatewayForm(init.checkout);
        return; // page is leaving; keep the button disabled
      }

      // dev / UAT mock provider
      if (init.checkout?.provider === 'mock') {
        await mockComplete({ gatewayOrderId: init.gatewayOrderId, outcome: 'success' }).unwrap();
        onPaid?.({ paymentNo: init.paymentNo });
        setBusy(false);
        return;
      }

      // Razorpay (previous behaviour)
      const resp = await openRazorpayCheckout({
        checkout: init.checkout,
        prefill: { name: user?.name, email: user?.email, contact: user?.mobile },
      });
      await verifyPayment({
        demandId,
        paymentNo: init.paymentNo,
        gatewayOrderId: resp.razorpay_order_id || init.gatewayOrderId,
        gatewayPaymentId: resp.razorpay_payment_id,
        gatewaySignature: resp.razorpay_signature,
      }).unwrap();
      onPaid?.({ paymentNo: init.paymentNo });
      setBusy(false);
    } catch (err) {
      setError(getErrorMessage(err, err?.message || 'Could not start the payment. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <div className="card" id="online-payment-section" style={{ border: '2px solid var(--color-primary-light, #3b82f6)' }}>
      <div className="card-header between">
        <div>
          <h2 className="card-title flex items-center gap-2">
            <CreditCard size={20} className="text-brand" />
            Pay online
          </h2>
          <p className="card-subtitle">
            Demand {demand?.demandNo || demandId} · {demand?.productSnapshot?.name || demand?.productId?.name || demand?.productName || 'AFD item'}
          </p>
        </div>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={busy}>
            Close
          </Button>
        )}
      </div>

      <div className="card-body">
        <div className="panel p-3 bg-slate-50 border border-slate-200 rounded text-center mb-3">
          <span className="small muted block">Net amount payable</span>
          <p className="h2 text-brand font-bold my-1">{money(amount)}</p>
        </div>

        {hasLoan && (
          <div className="alert-banner warning mb-3 flex items-center gap-2" role="alert">
            <AlertCircle size={18} />
            <span>Online payment can only be used when no loan is availed. Please use Direct Bank Transfer for this demand.</span>
          </div>
        )}

        {error && (
          <div className="alert-banner error mb-3 flex items-center gap-2" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!hasLoan && loadingGateways && (
          <div className="row align-center gap-1 mb-3"><Loader2 size={16} className="spin" /> <span className="small">Loading payment options…</span></div>
        )}

        {!hasLoan && redirectMode && (
          <fieldset className="mb-3" style={{ border: 0, padding: 0 }} disabled={busy}>
            <legend className="small font-semibold mb-2">Choose a payment gateway</legend>
            <div className="flex-col gap-2">
              {gateways.map((g) => (
                <label
                  key={g.gateway}
                  className={`checkout-radio-card ${selected === g.gateway ? 'active' : ''}`}
                  style={g.available ? undefined : { opacity: 0.55, cursor: 'not-allowed' }}
                >
                  <input
                    type="radio"
                    name="payment-gateway"
                    value={g.gateway}
                    checked={selected === g.gateway}
                    disabled={!g.available}
                    onChange={() => setSelected(g.gateway)}
                  />
                  <span className="checkout-radio-card-title row align-center gap-1">
                    <Landmark size={16} aria-hidden /> {g.label || gatewayLabel(g.gateway)}
                  </span>
                  <span className="small muted">
                    {g.available ? 'Net banking, cards and UPI on the bank’s secure page' : gatewayUnavailableText(g.reason)}
                  </span>
                </label>
              ))}
            </div>
            {usable.length === 0 && (
              <p className="small text-danger mt-2">No online gateway is available right now. Please use Direct Bank Transfer.</p>
            )}
          </fieldset>
        )}

        {!hasLoan && gatewaysError && (
          <p className="small muted mb-3">Could not load the gateway list; the default payment provider will be used.</p>
        )}

        <ul className="small muted mb-3" style={{ paddingLeft: '1.1rem' }}>
          <li>You will be taken to the bank&rsquo;s page. Do not press Back or close the window until you return here.</li>
          <li>Pay for a demand only once. If you are charged twice, the extra payment is refunded.</li>
          <li>Never share your OTP or PIN with anyone.</li>
        </ul>

        <div className="flex justify-end gap-2 pt-2 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          )}
          <Button
            variant="primary"
            loading={busy}
            disabled={hasLoan || busy || loadingGateways || (redirectMode && usable.length === 0)}
            onClick={pay}
          >
            {busy ? 'Connecting to the gateway…' : `Pay ${money(amount)}`}
          </Button>
        </div>

        <div className="row align-center gap-1 mt-2 small muted">
          <ShieldCheck size={14} color="#16a34a" /> <span>Payments are confirmed directly with the bank before your demand moves ahead.</span>
        </div>
      </div>
    </div>
  );
}
