import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2,
  RefreshCw, KeyRound, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import AuthArt from '../../pages/AuthArt.jsx';
import { authService } from '../../services/auth.service.js';
import { makeCaptcha } from '../../utils/captcha.js';

function getPasswordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score >= 4 && pw.length >= 8)
    return { label: 'Strong', className: 'pw-strength-strong' };
  if (score >= 3) return { label: 'Medium', className: 'pw-strength-medium' };
  return { label: 'Weak', className: 'pw-strength-weak' };
}

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

export default function PasswordReset() {
  const navigate = useNavigate();

  // 'request' | 'verify' | 'success'
  const [step, setStep] = useState('request');

  // Step 1: Identifier & Captcha
  const [identifier, setIdentifier] = useState('');
  const [cap, setCap] = useState(makeCaptcha);
  const [capIn, setCapIn] = useState('');

  // Step 2: OTP, Password, & Verification
  const [maskedContact, setMaskedContact] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);

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

  // STEP 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const errs = {};
    const cleanId = identifier.trim();

    if (!cleanId) {
      errs.identifier = 'Please enter your registered Email, Mobile number, or User ID.';
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
      const res = await authService.requestPasswordReset({
        identifier: cleanId,
        email: cleanId,
        mobile: cleanId,
      });

      setMaskedContact(res.data?.maskedContact || res.maskedContact || cleanId);
      if (res.data?.devOtp || res.devOtp) {
        setDevOtp(res.data?.devOtp || res.devOtp);
      }
      setStep('verify');
      setCooldown(30);
      setSuccessMsg(`A 6-digit verification code has been dispatched to ${res.data?.maskedContact || res.maskedContact || 'your registered contact'}.`);
    } catch (err) {
      setErrors({ form: err.message || 'Unable to process password reset request. Please check your credentials.' });
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrors({});
    setSuccessMsg('');
    try {
      const res = await authService.requestPasswordReset({
        identifier: identifier.trim(),
        email: identifier.trim(),
        mobile: identifier.trim(),
      });
      setCooldown(30);
      if (res.data?.devOtp || res.devOtp) {
        setDevOtp(res.data?.devOtp || res.devOtp);
      }
      setSuccessMsg(`A fresh 6-digit OTP has been dispatched to ${maskedContact || 'your registered contact'}.`);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to dispatch a fresh OTP. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  // STEP 2: Verify OTP and Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      errs.otp = 'Please enter the complete 6-digit OTP.';
    }

    if (!newPassword) {
      errs.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      errs.newPassword = 'Password must contain uppercase, lowercase letters and a number.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setErrors({});
    try {
      await authService.resetPassword({
        identifier: identifier.trim(),
        mobile: identifier.trim(),
        email: identifier.trim(),
        otp: fullOtp,
        newPassword,
      });

      setStep('success');
    } catch (err) {
      setErrors({ form: err.message || 'Invalid or expired OTP. Please verify and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isRequestDisabled = loading || !identifier.trim() || !capIn.trim();
  const isResetDisabled = loading || otp.join('').length !== 6 || !newPassword || !confirmPassword;
  const pwStrength = getPasswordStrength(newPassword);

  return (
    <div className="wrap auth">
      <AuthArt
        title="Recover Your Account."
        text="Verify your registered email or mobile to set a new secure password."
      />

      {step === 'request' && (
        <form className="panel logincard authcard" onSubmit={handleRequestOtp} noValidate aria-labelledby="rh">
          <div className="between">
            <Link to="/login" className="vli">
              Back to Sign In
            </Link>
            <button type="button" className="circle" aria-label="Go back" onClick={() => navigate('/login')}>
              <ArrowLeft />
            </button>
          </div>

          <h1 id="rh">Forgot Password</h1>
          <p className="reg-warn">
            Enter your registered email address or mobile number to receive a 6-digit OTP verification code.
          </p>

          {errors.form && (
            <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* IDENTIFIER FIELD */}
          <Field id="identifier" label="Registered Email / Mobile / User ID" req err={errors.identifier}>
            <div className="fld">
              <Mail size={18} aria-hidden />
              <input
                id="identifier"
                autoComplete="username"
                placeholder="e.g. officer@gov.in or 9876543210"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier || errors.form) setErrors({});
                }}
                disabled={loading}
                aria-invalid={!!errors.identifier}
              />
            </div>
          </Field>

          {/* CAPTCHA FIELD */}
          <Field id="cap" label="Captcha" req err={errors.cap}>
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
            <span>{loading ? 'Transmitting OTP...' : 'Send Verification OTP'}</span>
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form className="panel logincard authcard" onSubmit={handleResetPassword} noValidate aria-labelledby="vh">
          <div className="between">
            <button
              type="button"
              className="otp-link-btn"
              onClick={() => {
                setStep('request');
                setOtp(['', '', '', '', '', '']);
                setErrors({});
                setSuccessMsg('');
              }}
            >
              ← Change Email / Mobile
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

          <div className="otp-head">
            <div className="shield-icon-circle text-brand">
              <ShieldCheck size={36} />
            </div>
            <h1 id="vh">Verify OTP & Set Password</h1>
            <p className="otp-subtext small">
              Please enter the 6-digit OTP sent to:
              <br />
              <b className="text-brand otp-email-text">
                <Mail size={15} className="inline mr-1" />
                {maskedContact}
              </b>
            </p>
          </div>

          {devOtp && (
            <div className="p-2 mb-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs flex items-center justify-between">
              <span><b>Development OTP:</b> <span className="font-mono tracking-widest text-sm font-bold">{devOtp}</span></span>
              <button
                type="button"
                className="text-blue-600 underline text-xs font-semibold"
                onClick={() => {
                  setOtp(devOtp.split(''));
                  setErrors({});
                }}
              >
                Auto Fill
              </button>
            </div>
          )}

          {successMsg && (
            <div className="alert-banner success small mb-3" role="status">
              <CheckCircle2 size={16} />
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
            <div className="between text-xs mt-1">
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

          {/* NEW PASSWORD FIELD */}
          <Field id="newPassword" label="New Password" req err={errors.newPassword}>
            <div className="fld has-eye">
              <Lock size={18} aria-hidden />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters with Aa & 123"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword || errors.form) setErrors({});
                }}
                disabled={loading}
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                className="eye"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwStrength && (
              <div className={`pw-strength-badge ${pwStrength.className} mt-1`}>
                {pwStrength.label}
              </div>
            )}
          </Field>

          {/* CONFIRM NEW PASSWORD FIELD */}
          <Field id="confirmPassword" label="Confirm New Password" req err={errors.confirmPassword}>
            <div className="fld has-eye">
              <Lock size={18} aria-hidden />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-type your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword || errors.form) setErrors({});
                }}
                disabled={loading}
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                className="eye"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* SUBMIT BUTTON */}
          <button
            className="btn big wide row align-center justify-center gap-1 mt-2"
            type="submit"
            disabled={isResetDisabled}
          >
            {loading && <Loader2 size={18} className="spin" />}
            <span>{loading ? 'Updating Password...' : 'Verify OTP & Set New Password'}</span>
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="panel logincard authcard text-center py-6">
          <div className="mb-3">
            <CheckCircle2 size={54} className="text-emerald-500 mx-auto" />
          </div>
          <h1>Password Reset Complete</h1>
          <p className="text-muted small mb-4">
            Your CSD AFD portal account password has been updated successfully. You can now securely log in with your new password.
          </p>
          <Link to="/login" className="btn big wide primary row align-center justify-center">
            Proceed to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
