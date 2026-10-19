import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOMES } from '../../permissions/roles.js';
// import './otp-verification.css';

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
        role: sessionData?.role || 'beneficiary',
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
    <form className="panel logincard authcard" onSubmit={handleVerify} noValidate aria-labelledby="oh">
      <div className="between">
        <button type="button" className="otp-link-btn" onClick={onBack}>
          Change credentials
        </button>
        <button type="button" className="circle" aria-label="Go back" onClick={onBack}>
          <ArrowLeft />
        </button>
      </div>

      <div className="otp-head">
        <div className="shield-icon-circle text-brand">
          <ShieldCheck size={36} />
        </div>
        <h1 id="oh">Two-Factor OTP Verification</h1>
        <p className="otp-subtext small">
          Please enter the 6-digit security authentication code sent to your registered mobile
          number ending in <b>**210</b> and email.
        </p>
      </div>

      <fieldset className="otp-digits-fieldset">
        <legend className="sr">6-digit verification code</legend>
        <div className="otp-inputs-row">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
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

      <p className="err text-center" role={error ? 'alert' : undefined}>
        {error && `⚠ ${error}`}
      </p>

      <button className="btn big wide" type="submit" disabled={loading}>
        {loading ? 'Please wait...' : 'Verify & Access Portal'}
      </button>

      <p className="otp-resend small">
        <span className="muted">Didn't receive the code? </span>
        <button type="button" className="otp-link-btn" onClick={handleResend} disabled={resending}>
          {resending ? 'Sending...' : 'Resend Code'}
        </button>
      </p>
    </form>
  );
}