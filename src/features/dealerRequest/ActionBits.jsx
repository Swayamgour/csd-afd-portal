import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorBanner = ({ message }) =>
  message ? (
    <div className="alert-banner error small mb-2 row align-center gap-1" role="alert">
      <AlertCircle size={16} aria-hidden /> <span>{message}</span>
    </div>
  ) : null;

export const RemarksField = ({ id, label = 'Remarks', value, onChange, required = false, rows = 2 }) => (
  <div className="form-field" style={{ marginTop: 10 }}>
    <label htmlFor={id} className="form-label">{label} {required && <span className="req-star">*</span>}</label>
    <textarea id={id} className="form-control" rows={rows} maxLength={1000} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export const ActionBox = ({ title, children }) => (
  <div style={{ border: '1px solid var(--border, #d8dee6)', borderRadius: 8, padding: 12, marginTop: 10 }}>
    {title && <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>{title}</h4>}
    {children}
  </div>
);
