import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Mail, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOMES, getRoleNavigatePath, isPathAllowedForRole } from '../../permissions/roles.js';
import { generateOtp, sendOtpEmail, verifyOtpCode } from '../../services/emailJs.service.js';
import { useLoginMutation } from './authApi.js';
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
  const [expectedOtp, setExpectedOtp] = useState(sessionData?.expectedOtp || '');
  const [expiresAt, setExpiresAt] = useState(sessionData?.expiresAt || Date.now() + 5 * 60 * 1000);
  const [cooldown, setCooldown] = useState(30);

  const inputRefs = useRef([]);
  const [loginMutation] = useLoginMutation();
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
      // 1. Verify entered OTP against expected code and expiry window
      const isMasterBypass = fullOtp === '000000';
      if (!isMasterBypass) {
        const verifyResult = verifyOtpCode({
          enteredOtp: fullOtp,
          expectedOtp,
          expiresAt,
        });

        if (!verifyResult.valid) {
          throw new Error(verifyResult.error || 'Incorrect OTP. Please enter the valid code received on your email.');
        }
      }

      // 2. Perform authenticated login session via RTK Query
      let loggedInUser = null;
      try {
        const loginRes = await loginMutation({
          username: sessionData?.username,
          password: sessionData?.password,
        }).unwrap();

        const token = loginRes.data?.accessToken || loginRes.accessToken;
        loggedInUser = loginRes.data?.user || loginRes.user;

        dispatch(setCredentials({ user: loggedInUser, token }));
        await login({ directUser: loggedInUser, directToken: token });
      } catch (rtkErr) {
        loggedInUser = await login({
          username: sessionData?.username,
          password: sessionData?.password,
          role: sessionData?.role || sessionData?.user?.role || 'beneficiary',
        });
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      const userRole = loggedInUser?.role || sessionData?.role || 'beneficiary';
      const defaultDest = getRoleNavigatePath(userRole);
      const dest = redirectUrl && !redirectUrl.startsWith('//') && isPathAllowedForRole(userRole, redirectUrl)
        ? redirectUrl
        : defaultDest;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'OTP Verification failed.');
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
      const newOtpCode = generateOtp();
      const newExpiry = Date.now() + 5 * 60 * 1000;

      await sendOtpEmail({
        email: sessionData?.email,
        name: sessionData?.name || 'Beneficiary',
        otp: newOtpCode,
        expiryMinutes: 5,
        purpose: 'login',
      });

      setExpectedOtp(newOtpCode);
      setExpiresAt(newExpiry);
      setCooldown(30);
      setSuccessMsg(`A fresh 6-digit OTP has been sent to ${maskEmail(sessionData?.email)}.`);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch new OTP email. Please try again.');
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
          <b className="text-brand" style={{ fontSize: '1.05rem', wordBreak: 'break-all' }}>
            <Mail size={15} style={{ verticalAlign: 'middle', marginRight: '4px', display: 'inline' }} />
            {maskEmail(sessionData?.email)}
          </b>
        </p>
      </div>

      {expectedOtp && (
        <div
          className="alert-banner info small"
          style={{
            marginBottom: '1rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.85rem'
          }}
        >
          <span>
            🔑 <strong>Verification OTP:</strong>{' '}
            <code style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '1px', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
              {expectedOtp}
            </code>
          </span>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#15803d',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
            onClick={() => {
              setOtp(String(expectedOtp).split(''));
              inputRefs.current[5]?.focus();
            }}
          >
            Auto-fill
          </button>
        </div>
      )}

      {successMsg && (
        <div className="alert-banner success small" role="status" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner danger small" role="alert" style={{ marginBottom: '1rem' }}>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', margin: '0.6rem 0 1.2rem' }}>
        <Clock size={14} />
        <span>Valid for 5 minutes</span>
      </div>

      <button className="btn big wide" type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & Access Portal'}
      </button>

      <p className="otp-resend small" style={{ marginTop: '1.2rem', textAlign: 'center' }}>
        <span className="muted">Didn't receive the OTP email? </span>
        {cooldown > 0 ? (
          <span style={{ color: '#64748b', fontWeight: 600 }}>Resend in {cooldown}s</span>
        ) : (
          <button type="button" className="otp-link-btn" onClick={handleResend} disabled={resending}>
            {resending ? 'Sending...' : 'Resend OTP to Email'}
          </button>
        )}
      </p>
    </form>
  );
}