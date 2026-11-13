import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  ChevronDown,
  Settings,
  Landmark,
  Building2,
  Warehouse,
  Store,
  Factory,
  Car,
  Medal,
  Hourglass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleNavigatePath, isPathAllowedForRole } from '../../permissions/roles.js';
import { makeCaptcha } from '../../utils/captcha.js';
import DigiLockerButton from '../../components/common/DigiLockerButton.jsx';

// Test / demo accounts. Set to false to hide the "Demo accounts" box in production.
const SHOW_DEMO_ACCOUNTS = true;

const TEST_ACCOUNTS = [
  { role: 'ADMIN', label: 'System Admin', tag: 'Admin', icon: Settings, username: 'admincsd', password: 'Test@123456' },
  { role: 'CS_DIRECTOR', label: 'CS Director', tag: 'Director', icon: Landmark, username: 'cs_director_test', password: 'Test@123456' },
  { role: 'CSD_HO', label: 'CSD HO', tag: 'Head Office', icon: Building2, username: 'csd_ho_test', password: 'Test@123456' },
  { role: 'DEPOT_OFFICIAL', label: 'Depot Official', tag: 'Depot', icon: Warehouse, username: 'depot_delhi_test', password: 'Test@123456' },
  { role: 'URC', label: 'URC Officer', tag: 'URC', icon: Store, username: 'urc_delhi_test', password: 'Test@123456' },
  { role: 'OEM', label: 'OEM (Mahindra)', tag: 'OEM', icon: Factory, username: 'oem_mahindra_test', password: 'Passw0rd!x' },
  { role: 'DEALER', label: 'Dealer (Supreme Mobiles)', tag: 'Dealer', icon: Car, username: 'dealer_hisar', password: 'Dealer@123456' },
  { role: 'DEALER', label: 'Dealer (Koncept Mahindra)', tag: 'Dealer 2', icon: Car, username: 'dealer_koncept', password: 'Dealer@123456' },
  { role: 'BENEFICIARY', label: 'Beneficiary (Rajesh Kumar)', tag: 'Beneficiary', icon: Medal, username: 'rajesh_kumar', password: 'Beneficiary@123456' },
  { role: 'BENEFICIARY', label: 'Beneficiary (Pending)', tag: 'Pending', icon: Hourglass, username: 'pending_beneficiary', password: 'Pending@123456' },
];

// Same Field markup as the Register page
function Field({ id, label, req, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && (
          <span className="req-star" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      <p className="err" role={err ? 'alert' : undefined}>
        {err && `⚠ ${err}`}
      </p>
    </div>
  );
}

export default function LoginForm({ onNeedOtp }) {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cap, setCap] = useState(makeCaptcha);
  const [capIn, setCapIn] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeAccount, setActiveAccount] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const refreshCaptcha = () => {
    setCap(makeCaptcha());
    setCapIn('');
  };

  const pickAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setActiveAccount(account.username);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const cleanUsername = username.trim();
    if (!cleanUsername) newErrors.username = 'Enter your User ID ';
    if (!password) newErrors.password = 'Enter your password.';
    if (!capIn.trim()) {
      newErrors.cap = 'Type the captcha text shown above.';
    } else if (capIn.trim() !== cap) {
      newErrors.cap = 'Captcha does not match. Try the new one.';
      refreshCaptcha();
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // 1. Verify credentials and trigger backend OTP generation
      let credResult;
      try {
        const credRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/verify-credentials`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: cleanUsername, password }),
          }
        );
        credResult = await credRes.json();
        if (!credRes.ok) {
          throw new Error(credResult?.message || 'Invalid username or password.');
        }
      } catch (err) {
        throw new Error(err.message || 'Invalid username or password. Please verify your credentials.');
      }

      const registeredEmail = credResult.maskedEmail || credResult.data?.maskedEmail || 'registered email';
      const userRole = credResult.role || credResult.data?.role || credResult.data?.user?.role || 'beneficiary';
      // Depot / URC / Dealer / OEM accounts sign in with username + password only (no OTP step)
      const requireOtp = (credResult.data?.requireOtp ?? credResult.requireOtp) !== false;

      // 2. Move to the OTP step, or sign in directly
      if (onNeedOtp && requireOtp) {
        onNeedOtp({
          username: cleanUsername,
          password,
          maskedEmail: registeredEmail,
          role: userRole,
        });
      } else {
        const loggedInUser = await login({ username: cleanUsername, password });
        const finalRole = loggedInUser?.role || userRole;
        const defaultDest = getRoleNavigatePath(finalRole);
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');
        const dest =
          redirectUrl && !redirectUrl.startsWith('//') && isPathAllowedForRole(finalRole, redirectUrl)
            ? redirectUrl
            : defaultDest;
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setErrors({ form: err.message || 'Invalid username or password. Please verify your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !username.trim() || !password || !capIn.trim();
  const active = TEST_ACCOUNTS.find((a) => a.username === activeAccount);
  const ActiveIcon = active?.icon;

  return (
    <form
      className="panel logincard authcard"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="lh"
    >
      <div className="between">
        <Link to="/register" className="vli">
          New to the portal? Create an account
        </Link>
        <button
          type="button"
          className="circle"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </button>
      </div>

      <h1 id="lh">Sign in</h1>
      <p className="reg-note">
        Use the User ID and password of your CSD AFD account. For most accounts, a 6-digit code
        will be sent to your registered email to finish signing in.
      </p>

      {reason === 'session-expired' && (
        <div className="alert-banner warning small mb-3 row align-center gap-1" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>Your session expired due to inactivity. Please sign in again.</span>
        </div>
      )}
      {reason === 'auth-required' && (
        <div className="alert-banner warning small mb-3 row align-center gap-1" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span><strong>Sign in required.</strong> Please sign in to open that page.</span>
        </div>
      )}
      {reason === 'role-unauthorized' && (
        <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span><strong>Access denied.</strong> Please sign in with an account that has permission for that page.</span>
        </div>
      )}
      {errors.form && (
        <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {active && (
        <div className="av2-role-chip">
          <span className="av2-role-chip-icon" aria-hidden="true">
            <ActiveIcon size={16} />
          </span>
          <span>
            Signing in as <strong>{active.label}</strong>
          </span>
        </div>
      )}

      <Field id="username" label="User ID" req err={errors.username}>
        <div className="fld">
          <User size={18} aria-hidden />
          <input
            id="username"
            autoComplete="username"
            placeholder="User ID"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setActiveAccount(null);
              if (errors.username || errors.form) setErrors({});
            }}
            disabled={loading}
            aria-invalid={!!errors.username}
          />
        </div>
        <p className="small hint flex justify-end">
          <Link to="/forgot-username">Forgot User ID?</Link>
        </p>
      </Field>

      <Field id="passwordInput" label="Password" req err={errors.password}>
        <div className="fld has-eye">
          <Lock size={18} aria-hidden />
          <input
            id="passwordInput"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password || errors.form) setErrors({});
            }}
            disabled={loading}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            className="eye"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="small hint flex justify-end">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </Field>

      <label htmlFor="cap">
        Captcha <span aria-hidden>*</span>
      </label>
      <div className="captcha-row">
        <span className="captcha-img" aria-label={`Captcha ${cap.split('').join(' ')}`}>
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
                const next = { ...prev };
                delete next.cap;
                delete next.form;
                return next;
              });
            }
          }}
          disabled={loading}
          aria-invalid={!!errors.cap}
        />
      </div>
      <p className="err" role={errors.cap ? 'alert' : undefined}>
        {errors.cap && `⚠ ${errors.cap}`}
      </p>

      <button
        className="btn big wide row align-center justify-center gap-1"
        type="submit"
        disabled={isSubmitDisabled}
        style={{ display: 'flex' }}
      >
        {loading && <Loader2 size={18} className="spin" />}
        <span>{loading ? 'Checking your details…' : 'Sign in'}</span>
      </button>

      <div className="row align-center gap-1 my-2" aria-hidden>
        <hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--color-border, #d1d5db)' }} />
        <span className="small muted">or</span>
        <hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--color-border, #d1d5db)' }} />
      </div>
      <DigiLockerButton mode="LOGIN" disabled={loading} />
      <p className="small hint" style={{ marginTop: '.4rem' }}>
        DigiLocker sign-in is for beneficiaries. No password or OTP needed.
      </p>

      {SHOW_DEMO_ACCOUNTS && (
        <details className="av2-demo">
          <summary>
            <span>Demo accounts for testing</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <p className="av2-demo-note">Tap a role to fill its User ID and password.</p>
          <div className="av2-demo-grid">
            {TEST_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const selected = account.username === activeAccount;
              return (
                <button
                  key={`${account.role}-${account.username}`}
                  type="button"
                  className={`av2-demo-tile ${selected ? 'is-selected' : ''}`}
                  onClick={() => pickAccount(account)}
                  aria-pressed={selected}
                  title={account.label}
                >
                  <span className="av2-demo-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="av2-demo-text">
                    <span className="av2-demo-tag">{account.tag}</span>
                    <span className="av2-demo-label">{account.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </details>
      )}
    </form>
  );
}