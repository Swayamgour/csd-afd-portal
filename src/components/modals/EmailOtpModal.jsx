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
    const newDigits = [...digits];

    if (cleaned.length > 1) {
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
      setErrorMessage(err.message || 'Failed to complete registration. Please verify the code.');
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
            <label className="text-center block small fw-bold">
              ENTER 6-DIGIT VERIFICATION CODE
            </label>

            <div className="csd-otp-inputs-grid">
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
