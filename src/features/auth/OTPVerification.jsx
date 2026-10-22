import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Mail, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleNavigatePath, isPathAllowedForRole } from '../../permissions/roles.js';
import { useLoginMutation, useSendOtpMutation } from './authApi.js';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice.js';

function maskEmail(email) {
  if (!email) return 'your registered email';
  const parts = email.split('@');
  if (parts.length < 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  const visibleStart = name.slice(0, 2);
  const visibleEnd = name.slice(-1);
  const maskedMiddle = '*'.repeat(Math.max(3, name.length - 3));
  return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
}

export default function OTPVerification({ sessionData, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  const inputRefs = useRef([]);
  const [loginMutation] = useLoginMutation();
  const [sendOtpMutation] = useSendOtpMutation();
  const dispatch = useDispatch();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      setError('');
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
    setSuccessMsg('');

    try {
      // Backend validates hash, checks attempts, checks expiry, and consumes the OTP
      const loginRes = await loginMutation({
        username: sessionData?.username,
        password: sessionData?.password,
        otp: fullOtp,
      }).unwrap();

      const token = loginRes.data?.accessToken || loginRes.accessToken;
      const loggedInUser = loginRes.data?.user || loginRes.user;

      if (!token || !loggedInUser) {
        throw new Error('Authentication response is missing credentials.');
      }

      dispatch(setCredentials({ user: loggedInUser, token }));
      await login({ authenticatedUser: loggedInUser, authenticatedToken: token });

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      const userRole = loggedInUser?.role || sessionData?.role || 'beneficiary';
      const defaultDest = getRoleNavigatePath(userRole);
      const dest = redirectUrl && !redirectUrl.startsWith('//') && isPathAllowedForRole(userRole, redirectUrl)
        ? redirectUrl
        : defaultDest;
      navigate(dest, { replace: true });
    } catch (err) {
      const errMsg = err?.data?.message || err?.message || 'OTP Verification failed. Please check the code.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError('');
    setSuccessMsg('');
    setOtp(['', '', '', '', '', '']);

    try {
      await sendOtpMutation({
        target: sessionData?.username,
        purpose: 'LOGIN',
      }).unwrap();

      setCooldown(30);
      setSuccessMsg(`A fresh 6-digit OTP has been dispatched to ${maskEmail(sessionData?.maskedEmail || sessionData?.email)}.`);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to dispatch new OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <form className="panel logincard authcard" onSubmit={handleVerify} noValidate aria-labelledby="oh">
      <div className="between">
        <button type="button" className="otp-link-btn" onClick={onBack}>
          ← Change credentials
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
          Please enter the 6-digit authentication code sent to your registered email address:
          <br />
          <b className="text-brand otp-email-text">
            <Mail size={15} className="inline mr-1" />
            {maskEmail(sessionData?.maskedEmail || sessionData?.email)}
          </b>
        </p>
      </div>

      {successMsg && (
        <div className="alert-banner success small mb-3" role="status">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner danger small mb-3" role="alert">
          <span>⚠ {error}</span>
        </div>
      )}

      <fieldset className="otp-digits-fieldset">
        <legend className="sr">6-digit verification code</legend>
        <div className="otp-inputs-row" onPaste={handlePaste}>
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

      <div className="otp-timer-info">
        <Clock size={14} />
        <span>Valid for 10 minutes</span>
      </div>

      <button className="btn big wide" type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & Access Portal'}
      </button>

      <p className="otp-resend small otp-resend-row">
        <span className="muted">Didn't receive the OTP email? </span>
        {cooldown > 0 ? (
          <span className="otp-cooldown-text">Resend in {cooldown}s</span>
        ) : (
          <button type="button" className="otp-link-btn" onClick={handleResend} disabled={resending}>
            {resending ? 'Sending...' : 'Resend OTP to Email'}
          </button>
        )}
      </p>
    </form>
  );
}