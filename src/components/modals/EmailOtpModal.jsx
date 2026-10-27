import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, Clock, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';

/**
 * Dedicated CSD Email OTP Verification Modal
 * Integrated with Portal Design System and CSS Root Variables
 */
export default function EmailOtpModal({
  isOpen,
  onClose,
  email,
  name,
  onVerified,
  onResendOtp,
  isSubmitting = false
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [expiresAt, setExpiresAt] = useState(Date.now() + 5 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(45); // 45 seconds cooldown
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(`Verification OTP sent to ${email}`);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const inputsRef = useRef([]);

  // Reset expiry window on modal open
  useEffect(() => {
    if (isOpen) {
      setExpiresAt(Date.now() + 5 * 60 * 1000);
      setTimeLeft(300);
      setIsExpired(false);
      setIsVerified(false);
      setDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setStatusMessage(`Verification OTP sent to ${email}`);
    }
  }, [isOpen, email]);

  // Expiry countdown timer (5 minutes)
  useEffect(() => {
    if (!isOpen || isVerified) return;

    const interval = setInterval(() => {
      const remainingMs = expiresAt - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(remainingSec);

      if (remainingSec <= 0) {
        setIsExpired(true);
        setErrorMessage('OTP has expired. Please click "Resend OTP" to request a new verification code.');
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
    const cleaned = value.replace(/\D/g, '');

    // If 6 or more digits typed or pasted into box
    if (cleaned.length >= 6) {
      const chars = cleaned.slice(0, 6).split('');
      const newDigits = ['', '', '', '', '', ''];
      chars.forEach((char, idx) => {
        newDigits[idx] = char;
      });
      setDigits(newDigits);
      if (inputsRef.current[5]) {
        inputsRef.current[5].focus();
        inputsRef.current[5].select();
      }
      setErrorMessage('');
      return;
    }

    const newDigits = [...digits];

    if (cleaned.length === 2) {
      // User typed a new digit while input already had a digit -> take the newest digit
      const latestChar = cleaned.slice(-1);
      newDigits[index] = latestChar;
      setDigits(newDigits);
      if (index < 5 && inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
        inputsRef.current[index + 1].select();
      }
    } else if (cleaned.length === 1) {
      newDigits[index] = cleaned;
      setDigits(newDigits);
      if (index < 5 && inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
        inputsRef.current[index + 1].select();
      }
    } else {
      newDigits[index] = '';
      setDigits(newDigits);
    }

    setErrorMessage('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Clear current digit
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0 && inputsRef.current[index - 1]) {
        // If current is already empty, move to previous and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputsRef.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
      inputsRef.current[index - 1]?.select();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
      inputsRef.current[index + 1]?.select();
    } else if (e.key === 'Delete') {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pastedText) return;

    const chars = pastedText.slice(0, 6).split('');
    const newDigits = ['', '', '', '', '', ''];
    chars.forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setDigits(newDigits);
    const nextFocus = Math.min(5, chars.length);
    if (inputsRef.current[nextFocus]) {
      inputsRef.current[nextFocus].focus();
      inputsRef.current[nextFocus].select();
    }
    setErrorMessage('');
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
    setStatusMessage('Requesting fresh OTP from backend...');

    try {
      if (typeof onResendOtp === 'function') {
        await onResendOtp();
      }
      setStatusMessage(`Fresh 6-digit verification code sent to ${email}`);
      setExpiresAt(Date.now() + 5 * 60 * 1000);
      setTimeLeft(300);
      setIsExpired(false);
      setResendCooldown(45);
      setDigits(['', '', '', '', '', '']);

      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const enteredCode = digits.join('');

    if (enteredCode.length !== 6 || !/^\d{6}$/.test(enteredCode)) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    if (isExpired) {
      setErrorMessage('OTP has expired. Please click "Resend OTP" to request a new code.');
      return;
    }

    setErrorMessage('');
    try {
      await onVerified(enteredCode);
      setIsVerified(true);
    } catch (err) {
      setIsVerified(false);
      setErrorMessage(err.message || 'Incorrect verification code. Please check and try again.');
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
          inputsRef.current[0].select();
        }
      }, 50);
    }
  };

  return (
    <div className="csd-modal-backdrop" onClick={!isSubmitting ? onClose : undefined}>
      <div className="csd-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="csd-otp-modal-header">
          <div className="csd-otp-header-left">
            <div className="csd-otp-header-icon">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="csd-modal-title text-white">
                Email Verification
              </h3>
              <span className="csd-otp-header-badge">
                CSD AFD OTP Security
              </span>
            </div>
          </div>

          {!isSubmitting && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="csd-otp-modal-close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="csd-otp-modal-body">
          <p className="small muted">
            We have generated a 6-digit verification code and dispatched it to your official email:
          </p>
          <div className="csd-otp-target-email">
            {email}
          </div>

          {/* Status / Notice Messages */}
          {statusMessage && !errorMessage && (
            <div className="csd-otp-status-banner success" role="status">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <div>{statusMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="csd-otp-status-banner error" role="alert">
              <AlertCircle size={18} className="flex-shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* 6-Digit Code Input Boxes */}
          <div className="fgrp">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="small fw-bold" style={{ margin: 0 }}>
                ENTER 6-DIGIT VERIFICATION CODE
              </label>
              {digits.some((d) => d !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setDigits(['', '', '', '', '', '']);
                    setErrorMessage('');
                    inputsRef.current[0]?.focus();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Clear Code
                </button>
              )}
            </div>

            <div className="csd-otp-inputs-grid">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => e.target.select()}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={(e) => handlePaste(e, idx)}
                  disabled={isSubmitting || isVerified}
                  className={`csd-otp-digit ${digit ? 'filled' : ''} ${isExpired ? 'expired' : ''}`}
                />
              ))}
            </div>

            {/* Countdown & Expiry Indicator */}
            <div className="csd-otp-meta-row">
              <div className={`csd-otp-timer ${isExpired ? 'expired' : ''}`}>
                <Clock size={15} />
                <span>
                  {isExpired ? (
                    <strong>Code Expired</strong>
                  ) : (
                    <>Expires in: <strong className="csd-otp-timer-highlight">{formatTime(timeLeft)}</strong></>
                  )}
                </span>
              </div>

              {/* Resend Action */}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isSending || isSubmitting}
                className="csd-otp-resend-btn"
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
          <div className="csd-otp-statutory-notice">
            <strong className="block text-navy mb-1">
              Statutory Security Requirement
            </strong>
            Email verification confirms your official contact for supply order sanctions. Once verified, your profile will transition to <b>PENDING ADMIN APPROVAL</b> for rank entitlement validation.
          </div>

          {/* Action Buttons */}
          <div className="csd-otp-modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="csd-otp-cancel-btn"
            >
              Cancel / Edit Form
            </button>

            <button
              type="button"
              onClick={handleVerify}
              disabled={digits.join('').length !== 6 || isSubmitting || isExpired}
              className="csd-otp-submit-btn"
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
