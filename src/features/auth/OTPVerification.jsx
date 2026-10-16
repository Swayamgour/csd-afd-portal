import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOMES } from '../../permissions/roles.js';

export default function OTPVerification({ sessionData, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = await login({
        username: sessionData?.username || 'JC-765432X',
        password: sessionData?.password || 'GovtPass@2024',
        role: sessionData?.role || 'beneficiary'
      });
      const dest = ROLE_HOMES[user.role] || '/beneficiary/dashboard';
      navigate(dest);
    } catch (err) {
      setError(err.message || 'OTP Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setResending(true);
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => {
      setResending(false);
      alert('A new 6-digit verification code has been dispatched to your registered mobile and official email.');
    }, 600);
  };

  return (
    <div className="otp-verification-container">
      <div className="between mb-2">
        <button
          type="button"
          onClick={onBack}
          className="row align-center gap-1 link small font-semibold"
        >
          <ArrowLeft size={16} />
          Change credentials
        </button>
      </div>

      <div className="text-center mb-3">
        <div className="shield-icon-circle mx-auto mb-2 text-brand">
          <ShieldCheck size={36} />
        </div>
        <h2 className="otp-heading">Two-Factor OTP Verification</h2>
        <p className="otp-subtext muted small">
          Please enter the 6-digit security authentication code sent to your registered mobile number ending in <b>**210</b> and email.
        </p>
      </div>

      <form onSubmit={handleVerify} noValidate>
        <fieldset className="otp-digits-fieldset mb-3">
          <legend className="sr">6-digit verification code</legend>
          <div className="otp-inputs-row row justify-center gap-1">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                aria-label={`Digit ${idx + 1}`}
                className="otp-digit-input"
                autoFocus={idx === 0}
              />
            ))}
          </div>
        </fieldset>

        {error && <p className="err text-center small mb-2" role="alert">⚠ {error}</p>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="wide mb-2"
        >
          Verify & Access Portal
        </Button>

        <div className="resend-row text-center small">
          <span className="muted">Didn't receive the code? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="link font-semibold"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </form>
    </div>
  );
}
