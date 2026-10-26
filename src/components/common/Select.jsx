import React from 'react';

export function Select({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  error,
  required = false,
  disabled = false,
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
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          className="form-control"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      </div>
      {error && (
        <p className="err" role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

export default Select;
