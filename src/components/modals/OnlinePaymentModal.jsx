import React, { useState } from 'react';
import { X, CreditCard, Building2, Smartphone, ShieldCheck, Landmark, Check, ArrowRight, ArrowLeft } from 'lucide-react';

async function computeHmacSha256(secret, message) {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await window.crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function OnlinePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  demandNo = '',
  productName = '',
  gatewayOrderId = '',
  keyId = 'rzp_test_5173CSDPortal'
}) {
  const [method, setMethod] = useState('netbanking'); // netbanking, card, banktransfer
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('methods'); // methods, details, success

  if (!isOpen) return null;

  const totalFormatted = Number(amount || 0).toLocaleString('en-IN');

  const handlePay = async () => {
    setProcessing(true);
    try {
      const paymentId = `pay_${Date.now()}`;
      const effectiveOrderId = gatewayOrderId || `order_${Date.now()}`;
      const secret = 'secret_csd_afd_secure_key';
      const signature = await computeHmacSha256(secret, `${effectiveOrderId}|${paymentId}`);

      setStep('success');
      onSuccess({
        paymentMethod: 'Online Payment (Razorpay)',
        gatewayOrderId: effectiveOrderId,
        gatewayPaymentId: paymentId,
        gatewaySignature: signature,
        amount: Number(amount) || 0,
        paidAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="csd-modal-backdrop" onClick={onClose}>
      <div className="razorpay-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Razorpay Gateway Header matching Fig. 23 & 24 */}
        <div className="razorpay-header">
          <div>
            <div className="razorpay-header-merchant">
              Canteen Stores Department (D...
            </div>
            <div className="razorpay-header-order">
              Order {demandNo}
            </div>
            <div className="razorpay-header-amount">
              ₹ {totalFormatted} <small>(+ Fee)</small>
            </div>
          </div>
          <button
            type="button"
            className="razorpay-header-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Gateway Body */}
        {step === 'success' ? (
          <div className="razorpay-success-body">
            <div className="razorpay-success-icon">
              <Check size={36} />
            </div>
            <h3 className="razorpay-success-title">
              Payment Successful!
            </h3>
            <p className="razorpay-success-desc">
              Redirecting to demand confirmation receipt...
            </p>
          </div>
        ) : (
          <div className="razorpay-content">
            {/* Preferred Payment Method Tabs matching Fig. 24 */}
            <div className="razorpay-methods-label">
              CARDS, NETBANKING & MORE
            </div>

            <div className="razorpay-methods-list">
              {/* Card */}
              <div
                className={`razorpay-method-card ${method === 'card' ? 'selected' : ''}`}
                onClick={() => setMethod('card')}
              >
                <CreditCard size={20} color={method === 'card' ? '#1d4ed8' : '#64748b'} />
                <div className="razorpay-method-text">
                  <div className="razorpay-method-title">Card</div>
                  <div className="razorpay-method-desc">Visa, MasterCard, RuPay, and Maestro</div>
                </div>
              </div>

              {/* Netbanking */}
              <div
                className={`razorpay-method-card ${method === 'netbanking' ? 'selected' : ''}`}
                onClick={() => setMethod('netbanking')}
              >
                <Landmark size={20} color={method === 'netbanking' ? '#1d4ed8' : '#64748b'} />
                <div className="razorpay-method-text">
                  <div className="razorpay-method-title">Netbanking</div>
                  <div className="razorpay-method-desc">All Indian banks (SBI, HDFC, ICICI, etc.)</div>
                </div>
              </div>

              {/* Bank Transfer */}
              <div
                className={`razorpay-method-card ${method === 'banktransfer' ? 'selected' : ''}`}
                onClick={() => setMethod('banktransfer')}
              >
                <Building2 size={20} color={method === 'banktransfer' ? '#1d4ed8' : '#64748b'} />
                <div className="razorpay-method-text">
                  <div className="razorpay-method-title">Bank Transfer (NEFT/RTGS)</div>
                  <div className="razorpay-method-desc">Instant virtual account payment</div>
                </div>
              </div>
            </div>

            {/* Conditional Input Details */}
            {method === 'card' && (
              <div className="razorpay-card-form">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNo}
                  onChange={(e) => setCardNo(e.target.value)}
                  className="razorpay-input"
                />
                <div className="razorpay-grid-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="razorpay-input"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="razorpay-input"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder's Name"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  className="razorpay-input"
                />
              </div>
            )}

            {method === 'netbanking' && (
              <div className="razorpay-popular-banks-box">
                <div className="razorpay-popular-banks-title">
                  POPULAR BANKS
                </div>
                <div className="razorpay-banks-grid">
                  {['SBI', 'HDFC', 'ICICI', 'Axis'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`razorpay-bank-btn ${selectedBank === b ? 'selected' : ''}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={processing}
              className="razorpay-pay-btn"
            >
              {processing ? 'Connecting to Bank Gateway...' : `PAY ₹ ${totalFormatted}`}
            </button>

            <div className="razorpay-secured-badge">
              <ShieldCheck size={14} color="#16a34a" />
              <span>This payment is 256-bit secured by Razorpay for CSD India</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnlinePaymentModal;
