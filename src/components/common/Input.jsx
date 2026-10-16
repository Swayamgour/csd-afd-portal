import React from 'react';

export function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="req-star" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={`fld ${error ? 'has-error' : ''}`}>
        {Icon && <Icon size={18} className="fld-icon" aria-hidden="true" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="err" role="alert">
          ⚠ {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="form-helper muted small">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
