import React, { useState } from 'react';
import { X, CreditCard, Building2, Smartphone, ShieldCheck, Landmark, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export function OnlinePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  demandNo = '30-76510',
  productName = 'MARUTI VITARA BREZZA VXI 1.5L 5MT'
}) {
  const [method, setMethod] = useState('netbanking'); // netbanking, card, emi, banktransfer
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('methods'); // methods, details, success

  if (!isOpen) return null;

  const totalFormatted = Number(amount || 721826).toLocaleString('en-IN');

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('success');
      setTimeout(() => {
        onSuccess({
          paymentMethod: 'Online Payment (Razorpay)',
          transactionId: `pay_${Math.random().toString(36).substring(2, 12)}`,
          amount: amount || 721826,
          paidAt: new Date().toISOString()
        });
      }, 1200);
    }, 1500);
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
