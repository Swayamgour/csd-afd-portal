// Opens Razorpay Checkout for an order created by POST /payments/initiate.
// Signature verification is done server-side (POST /payments/verify); no secrets live in the browser.
let loader;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  if (!loader) {
    loader = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }
  return loader;
}

export async function openRazorpayCheckout({ checkout, prefill }) {
  const ok = await loadRazorpay();
  if (!ok) throw new Error('Could not load the payment gateway. Check your connection and try again.');
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency || 'INR',
      order_id: checkout.gatewayOrderId,
      name: checkout.name || 'CSD AFD Online Portal',
      description: checkout.description,
      prefill,
      theme: { color: '#1e4fd8' },
      handler: (resp) => resolve(resp),
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed.')));
    rzp.open();
  });
}
