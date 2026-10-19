import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, Clock, RefreshCw, AlertCircle, CheckCircle2, Lock, ArrowRight, X } from 'lucide-react';
import { sendOtpEmail, verifyOtpCode, generateOtp } from '../../services/emailJs.service.js';

/**
 * Dedicated EmailJS OTP Verification Modal
 * Handles:
 * - 6-digit OTP input with automatic focus advance
 * - 5-minute validity window countdown
 * - Resend OTP functionality with cooldown timer
 * - Loading, success, error, and expired states
 * - Clean state reset upon verification
 */
export default function EmailOtpModal({
  isOpen,
  onClose,
  email,
  name,
  initialOtp,
  expectedOtp,
  onVerified,
  onResendOtp,
  isSubmitting = false
}) {
  const effectiveOtp = expectedOtp || initialOtp || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [currentOtp, setCurrentOtp] = useState(effectiveOtp);
  const [expiresAt, setExpiresAt] = useState(Date.now() + 5 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(45); // 45 seconds cooldown
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const inputsRef = useRef([]);

  // Sync initial / expected OTP from parent
  useEffect(() => {
    const code = expectedOtp || initialOtp;
    if (code) {
      setCurrentOtp(code);
      setExpiresAt(Date.now() + 5 * 60 * 1000);
      setTimeLeft(300);
      setIsExpired(false);
      setErrorMessage('');
      setStatusMessage(`Verification OTP sent via EmailJS to ${email}`);
    }
  }, [initialOtp, expectedOtp, email]);

  // Expiry countdown timer (5 minutes)
  useEffect(() => {
    if (!isOpen || isVerified) return;

    const interval = setInterval(() => {
      const remainingMs = expiresAt - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(remainingSec);

      if (remainingSec <= 0) {
        setIsExpired(true);
        setErrorMessage('OTP has expired. Please click "Resend OTP" to generate a new verification code.');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expiresAt, isVerified]);

  // Resend cooldown timer
  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  // Autofocus first input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...digits];

    if (cleaned.length > 1) {
      // Handle paste
      const pasted = cleaned.slice(0, 6).split('');
      pasted.forEach((char, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = char;
        }
      });
      setDigits(newDigits);
      const nextFocus = Math.min(5, index + pasted.length);
      if (inputsRef.current[nextFocus]) {
        inputsRef.current[nextFocus].focus();
      }
    } else {
      newDigits[index] = cleaned;
      setDigits(newDigits);
      if (cleaned && index < 5 && inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    }

    setErrorMessage('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isSending) return;

    setIsSending(true);
    setErrorMessage('');
    setStatusMessage('Generating fresh OTP and transmitting via EmailJS...');

    try {
      if (typeof onResendOtp === 'function') {
        const customResend = await onResendOtp();
        if (customResend && customResend.otp) {
          setCurrentOtp(customResend.otp);
        }
      } else {
        const newOtp = generateOtp();
        const sendResult = await sendOtpEmail({ email, name, otp: newOtp, expiryMinutes: 5 });
        setCurrentOtp(newOtp);
        if (sendResult?.isDevMock) {
          setStatusMessage(`Dev Notice: Fresh OTP generated for ${email}: ${newOtp}`);
        } else {
          setStatusMessage(`Fresh 6-digit verification code sent to ${email}`);
        }
      }

      setExpiresAt(Date.now() + 5 * 60 * 1000);
      setTimeLeft(300);
      setIsExpired(false);
      setResendCooldown(45);
      setDigits(['', '', '', '', '', '']);

      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend OTP via EmailJS. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const enteredCode = digits.join('');

    const validation = verifyOtpCode({
      enteredOtp: enteredCode,
      expectedOtp: currentOtp,
      expiresAt
    });

    if (!validation.valid) {
      setErrorMessage(validation.error);
      if (validation.expired) {
        setIsExpired(true);
      }
      return;
    }

    // OTP Correct!
    setIsVerified(true);
    setErrorMessage('');
    setStatusMessage('✓ Email address verified successfully via EmailJS!');

    try {
      await onVerified(enteredCode);
    } catch (err) {
      setIsVerified(false);
      setErrorMessage(err.message || 'Failed to complete registration. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '520px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e4fd8 100%)',
            color: '#ffffff',
            padding: '1.5rem 1.75rem',
            position: 'relative'
          }}
        >
          {!isSubmitting && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              <X size={18} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '8px',
                display: 'flex'
              }}
            >
              <Mail size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
                Email Verification
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}
              >
                EmailJS OTP Security
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.9, lineHeight: 1.4 }}>
            We have generated a 6-digit verification code and dispatched it to:
          </p>
          <div
            style={{
              marginTop: '0.4rem',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#fef08a',
              wordBreak: 'break-all'
            }}
          >
            {email}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Status / Notice Messages */}
          {statusMessage && !errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                color: '#065f46',
                fontSize: '0.86rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{statusMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '0.86rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* 6-Digit Code Input Boxes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.6rem',
                textAlign: 'center'
              }}
            >
              ENTER 6-DIGIT VERIFICATION CODE
            </label>

            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}
            >
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={idx === 0 ? 6 : 1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isSubmitting || isVerified}
                  style={{
                    width: '46px',
                    height: '54px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    borderRadius: '10px',
                    border: digit
                      ? '2px solid #1e4fd8'
                      : isExpired
                      ? '2px solid #ef4444'
                      : '2px solid #cbd5e1',
                    background: digit ? '#eff6ff' : '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            {/* Countdown & Expiry Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.84rem',
                marginTop: '0.75rem',
                padding: '0 0.5rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isExpired ? '#ef4444' : '#64748b',
                  fontWeight: 600
                }}
              >
                <Clock size={15} />
                <span>
                  {isExpired ? (
                    <strong style={{ color: '#dc2626' }}>Code Expired</strong>
                  ) : (
                    <>Expires in: <strong style={{ color: timeLeft < 60 ? '#e11d48' : '#1e4fd8' }}>{formatTime(timeLeft)}</strong></>
                  )}
                </span>
              </div>

              {/* Resend Action */}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isSending || isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 || isSending ? '#94a3b8' : '#1e4fd8',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: resendCooldown > 0 || isSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '4px 6px'
                }}
              >
                <RefreshCw size={13} className={isSending ? 'spin' : ''} />
                <span>
                  {isSending
                    ? 'Transmitting...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend OTP'}
                </span>
              </button>
            </div>
          </div>

          {/* Workflow Explanation Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              color: '#475569',
              lineHeight: 1.45,
              marginBottom: '1.5rem'
            }}
          >
            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
              Statutory Security Requirement
            </strong>
            Email verification confirms your official contact for supply order sanctions. Once verified, your profile will transition to <span style={{ color: '#b45309', fontWeight: 600 }}>PENDING ADMIN APPROVAL</span> for rank entitlement validation.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel / Edit Form
            </button>

            <button
              type="button"
              onClick={handleVerify}
              disabled={digits.join('').length !== 6 || isSubmitting || isExpired}
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background:
                  digits.join('').length === 6 && !isExpired && !isSubmitting
                    ? 'linear-gradient(135deg, #1e4fd8 0%, #1e3a8a 100%)'
                    : '#94a3b8',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor:
                  digits.join('').length === 6 && !isExpired && !isSubmitting
                    ? 'pointer'
                    : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow:
                  digits.join('').length === 6 && !isExpired
                    ? '0 4px 12px rgba(30, 79, 216, 0.35)'
                    : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Completing Registration...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify OTP & Register</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
