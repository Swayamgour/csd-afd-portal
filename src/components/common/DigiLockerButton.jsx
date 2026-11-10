import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { startDigiLocker } from '../../utils/digilocker.js';

/**
 * "Sign in / Register with DigiLocker" button. Beneficiaries only.
 * mode: 'LOGIN' | 'REGISTER'
 */
export default function DigiLockerButton({ mode = 'LOGIN', disabled = false, label }) {
  const text = label || (mode === 'REGISTER' ? 'Register with DigiLocker' : 'Sign in with DigiLocker');
  return (
    <button
      type="button"
      className="btn big wide out row align-center justify-center gap-1 digilocker-btn"
      style={{ display: 'flex' }}
      disabled={disabled}
      onClick={() => startDigiLocker(mode)}
    >
      <ShieldCheck size={18} aria-hidden />
      <span>{text}</span>
    </button>
  );
}
