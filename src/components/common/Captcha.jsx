import React, { useState, useEffect } from 'react';
import { RefreshCw, KeyRound } from 'lucide-react';
import { makeCaptcha } from '../../utils/captcha.js';

export { makeCaptcha };

export default function Captcha({
  captchaText,
  onRefresh,
  onCaptchaChange,
  value,
  onChange,
  error,
  disabled = false,
  id = 'cap',
  label = 'Captcha',
  required = true,
  placeholder = 'Type the captcha text displayed above',
  className = '',
}) {
  const [internalCap, setInternalCap] = useState(() => captchaText || makeCaptcha());

  const currentCap = captchaText !== undefined ? captchaText : internalCap;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      const next = makeCaptcha();
      setInternalCap(next);
      onCaptchaChange?.(next);
    }
  };

  useEffect(() => {
    if (captchaText === undefined && onCaptchaChange) {
      onCaptchaChange(internalCap);
    }
  }, []);

  return (
    <div className={`captcha-component fgrp ${className}`}>
      <label htmlFor={id}>
        {label} {required && <span aria-hidden>*</span>}
      </label>
      <div className="captcha-row">
        <span
          className="captcha-img"
          aria-label={`Captcha ${typeof currentCap === 'string' ? currentCap.split('').join(' ') : ''}`}
        >
          {currentCap}
        </span>
        <button
          type="button"
          className="icon sm"
          aria-label="Refresh captcha"
          onClick={handleRefresh}
          disabled={disabled}
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="fld">
        <KeyRound size={18} aria-hidden />
        <input
          id={id}
          autoComplete="off"
          maxLength={8}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
        />
      </div>
      <p className="err" role={error ? 'alert' : undefined}>
        {error && `⚠ ${error}`}
      </p>
    </div>
  );
}
