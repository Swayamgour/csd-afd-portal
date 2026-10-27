import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowLeft, Loader2, RefreshCw, KeyRound, CheckCircle2, AlertCircle, Clock, ShieldCheck, User
} from 'lucide-react';
import AuthArt from '../../pages/AuthArt.jsx';
import { authService } from '../../services/auth.service.js';
import { makeCaptcha } from '../../utils/captcha.js';

function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && <span aria-hidden> *</span>}
      </label>
      {children}
      {hint && <p className="small hint">{hint}</p>}
      <p className="err" role={err ? 'alert' : undefined}>
        {err && `⚠ ${err}`}
      </p>
    </div>
  );
}

export default function ForgotUsername() {
  const navigate = useNavigate();

  // 'request' | 'verify' | 'success'
  const [step, setStep] = useState('request');

  // Step 1: Email & Captcha
  const [email, setEmail] = useState('');
  const [cap, setCap] = useState(makeCaptcha);
  const [capIn, setCapIn] = useState('');

  // Step 2: OTP Verification
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);

  // Step 3: Success Result
  const [recoveredUsername, setRecoveredUsername] = useState('');

  // Common Feedback
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const otpInputRefs = useRef([]);

  const refreshCaptcha = () => {
    setCap(makeCaptcha());
    setCapIn('');
  };

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (step !== 'verify' || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Handle OTP digit box changes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (errors.otp || errors.form) {
      setErrors((prev) => {
        const u = { ...prev };
        delete u.otp;
        delete u.form;
        return u;
      });
    }

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
      otpInputRefs.current[5]?.focus();
      if (errors.otp || errors.form) {
        setErrors((prev) => {
          const u = { ...prev };
          delete u.otp;
          delete u.form;
          return u;
        });
      }
    }
  };

  // STEP 1: Request OTP with registered email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const errs = {};
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      errs.email = 'Please enter your registered Email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!capIn.trim()) {
      errs.cap = 'Enter the captcha text.';
    } else if (capIn.trim() !== cap) {
      errs.cap = 'Captcha does not match. Try again.';
      refreshCaptcha();
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setErrors({});
    try {
      const res = await authService.requestForgotUsername({ email: cleanEmail });
      const targetMasked = res.data?.maskedEmail || res.maskedEmail || cleanEmail;
      setMaskedEmail(targetMasked);
      if (res.data?.devOtp || res.devOtp) {
        setDevOtp(res.data?.devOtp || res.devOtp);
      }
      setStep('verify');
      setCooldown(30);
      setSuccessMsg(`A 6-digit verification code has been dispatched to ${targetMasked}.`);
    } catch (err) {
      setErrors({ form: err.message || 'Unable to process your request. Please check your registered email.' });
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrors({});
    setSuccessMsg('');
    try {
      const res = await authService.requestForgotUsername({ email: email.trim().toLowerCase() });
      setCooldown(30);
      if (res.data?.devOtp || res.devOtp) {
        setDevOtp(res.data?.devOtp || res.devOtp);
      }
      setSuccessMsg(`A fresh 6-digit verification code has been dispatched to ${maskedEmail || email}.`);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to dispatch a fresh OTP. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  // STEP 2: Verify OTP & dispatch username to email
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits of the OTP.' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await authService.verifyForgotUsername({
        email: email.trim().toLowerCase(),
        otp: fullOtp
      });
      const username = res.data?.username || res.username || '';
      setRecoveredUsername(username);
      setStep('success');
    } catch (err) {
      setErrors({ form: err.message || 'Invalid or expired OTP. Please check the code and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isRequestDisabled = loading || !email.trim() || !capIn.trim();
  const isVerifyDisabled = loading || otp.join('').length !== 6;

  return (
    <div className="wrap auth">
      <AuthArt
        title="Recover Your Username"
        text="Verify your registered email address with OTP to receive your Username and account credentials."
      />

      {/* STEP 1: ENTER REGISTERED EMAIL & CAPTCHA */}
      {step === 'request' && (
        <form className="panel logincard authcard" onSubmit={handleRequestOtp} noValidate aria-labelledby="uh">
          <div className="between">
            <Link to="/login" className="vli">
              ← Back to Sign In
            </Link>
            <button type="button" className="circle" aria-label="Go back" onClick={() => navigate('/login')}>
              <ArrowLeft />
            </button>
          </div>

          <h1 id="uh">Forgot Username</h1>
          <p className="reg-warn" style={{ color: 'var(--brand)', background: '#f0f7ff', border: '1px solid #bfdbfe', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            Enter your registered email address. We will verify it with a 6-digit OTP code before sending your Username.
          </p>

          {errors.form && (
            <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* EMAIL FIELD */}
          <Field id="emailInput" label="Registered Email Address" req err={errors.email}>
            <div className="fld">
              <Mail size={18} aria-hidden />
              <input
                id="emailInput"
                type="email"
                autoComplete="email"
                placeholder="e.g. officer@gov.in or yourname@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.form) setErrors({});
                }}
                disabled={loading}
                aria-invalid={!!errors.email}
              />
            </div>
          </Field>

          {/* CAPTCHA FIELD */}
          <Field id="cap" label="Security Captcha" req err={errors.cap}>
            <div className="captcha-row">
              <span
                className="captcha-img"
                aria-label={`Captcha ${cap.split('').join(' ')}`}
              >
                {cap}
              </span>
              <button
                type="button"
                className="icon sm"
                aria-label="Refresh captcha"
                onClick={refreshCaptcha}
                disabled={loading}
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="fld">
              <KeyRound size={18} aria-hidden />
              <input
                id="cap"
                autoComplete="off"
                maxLength={5}
                placeholder="Type the captcha text displayed above"
                value={capIn}
                onChange={(e) => {
                  setCapIn(e.target.value);
                  if (errors.cap || errors.form) {
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.cap;
                      delete updated.form;
                      return updated;
                    });
                  }
                }}
                disabled={loading}
                aria-invalid={!!errors.cap}
              />
            </div>
          </Field>

          {/* SUBMIT BUTTON */}
          <button
            className="btn big wide row align-center justify-center gap-1 mt-2"
            type="submit"
            disabled={isRequestDisabled}
          >
            {loading && <Loader2 size={18} className="spin" />}
            <span>{loading ? 'Validating Email...' : 'Send Verification OTP'}</span>
          </button>
        </form>
      )}

      {/* STEP 2: VERIFY OTP & DISPATCH USERNAME */}
      {step === 'verify' && (
        <form className="panel logincard authcard" onSubmit={handleVerifyOtp} noValidate aria-labelledby="vh">
          <div className="between">
            <button
              type="button"
              className="text-brand font-semibold text-xs hover:underline cursor-pointer bg-transparent border-0 p-0"
              onClick={() => {
                setStep('request');
                setOtp(['', '', '', '', '', '']);
                setErrors({});
                setSuccessMsg('');
              }}
            >
              ← Change Email
            </button>
            <button
              type="button"
              className="circle"
              aria-label="Go back"
              onClick={() => setStep('request')}
            >
              <ArrowLeft />
            </button>
          </div>

          <h1 id="vh">Verify Security OTP</h1>
          <p className="reg-warn" style={{ color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            A 6-digit OTP has been dispatched to <strong>{maskedEmail}</strong>. Verify OTP to receive your registered Username on this email.
          </p>

          {/* DEV OTP HELPER FOR EASY TESTING */}
          {devOtp && (
            <div className="p-2 mb-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <strong>Dev OTP:</strong> {devOtp}
              </span>
              <button
                type="button"
                className="text-blue-600 underline font-semibold cursor-pointer"
                onClick={() => {
                  setOtp(devOtp.split(''));
                  setErrors({});
                }}
              >
                Auto-fill
              </button>
            </div>
          )}

          {successMsg && (
            <div className="alert-banner success small mb-3" role="status">
              <span>{successMsg}</span>
            </div>
          )}

          {errors.form && (
            <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* 6-DIGIT OTP FIELD */}
          <div className="fgrp">
            <label>
              6-Digit Security OTP <span aria-hidden>*</span>
            </label>
            <div className="otp-inputs-row" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-digit-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  disabled={loading}
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>
            <p className="err" role={errors.otp ? 'alert' : undefined}>
              {errors.otp && `⚠ ${errors.otp}`}
            </p>
            <div className="between text-xs mt-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted">
                {cooldown > 0 ? (
                  <>
                    <Clock size={12} className="inline mr-1" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  'Did not receive OTP?'
                )}
              </span>
              <button
                type="button"
                className="text-brand font-semibold hover:underline cursor-pointer disabled:opacity-50"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            className="btn big wide row align-center justify-center gap-1 mt-2"
            type="submit"
            disabled={isVerifyDisabled}
          >
            {loading && <Loader2 size={18} className="spin" />}
            <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Send Username'}</span>
          </button>
        </form>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION & USERNAME SENT */}
      {step === 'success' && (
        <div className="panel logincard authcard text-center py-6">
          <div className="mb-3">
            <CheckCircle2 size={56} className="text-emerald-500 mx-auto" style={{ color: '#10b981', margin: '0 auto' }} />
          </div>

          <h1 style={{ marginBottom: '0.5rem' }}>Username Sent to Your Email!</h1>
          <p className="text-muted small mb-3" style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Your CSD AFD Portal Username has been successfully sent to your registered email:
            <br />
            <strong style={{ color: '#1e293b' }}>{email}</strong>
          </p>

          {recoveredUsername && (
            <div
              className="panel p-3 my-3 text-center"
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '1rem',
                margin: '1.2rem 0'
              }}
            >
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                Your Registered Username / User ID
              </span>
              <strong style={{ fontSize: '1.5rem', color: '#14532d', letterSpacing: '0.05em' }}>
                {recoveredUsername}
              </strong>
            </div>
          )}

          <p className="small text-muted mb-4" style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Please check your inbox (and spam folder) for the confirmation email. You can now proceed to log in with this Username.
          </p>

          <Link
            to="/login"
            className="btn big wide primary row align-center justify-center gap-1"
            style={{ display: 'flex', textDecoration: 'none' }}
          >
            <User size={18} />
            <span>Proceed to Sign In</span>
          </Link>
        </div>
      )}
    </div>
  );
}
