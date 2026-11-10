// SBIePay / NDML are redirect gateways: POST /payments/initiate returns
//   checkout: { type: 'FORM_POST', action, fields }
// and the browser must POST those fields to the gateway page. The result comes back to
// /payments/result?paymentNo=..&status=.. (see PaymentResult.jsx) - that status is only a hint,
// the server confirms the real outcome with the gateway.

const PENDING_KEY = 'csd_pending_gateway_payment';

export const isFormPostCheckout = (checkout) => checkout?.type === 'FORM_POST' && !!checkout.action;

export function rememberPendingPayment(info) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...info, at: Date.now() }));
  } catch {
    /* storage can be blocked; the result page still works from the URL */
  }
}

export function readPendingPayment() {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function submitGatewayForm(checkout) {
  if (!isFormPostCheckout(checkout)) throw new Error('Payment gateway returned an invalid checkout. Please try again.');
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkout.action;
  form.style.display = 'none';
  Object.entries(checkout.fields || {}).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export const GATEWAY_LABELS = {
  SBIEPAY: 'SBIePay',
  NDML: 'NSDL / NDML',
  RAZORPAY: 'Razorpay',
  DIRECT_TRANSFER: 'Direct bank transfer',
};

export const gatewayLabel = (g) => GATEWAY_LABELS[String(g || '').toUpperCase()] || g || '—';

// why a gateway cannot be chosen right now
export function gatewayUnavailableText(reason) {
  if (reason === 'GATEWAY_NOT_VERIFIED') return 'Temporarily unavailable (not yet approved for live use).';
  if (reason === 'GATEWAY_NOT_CONFIGURED') return 'Temporarily unavailable.';
  return 'Temporarily unavailable. Please use another option.';
}
