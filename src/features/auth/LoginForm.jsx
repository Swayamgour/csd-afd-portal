import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertCircle,
  Loader2,
  RefreshCw,
  KeyRound,
  ArrowRight,
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
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleNavigatePath, isPathAllowedForRole } from '../../permissions/roles.js';
import { makeCaptcha } from '../../utils/captcha.js';

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

function Field({ id, label, error, children }) {
  return (
    <div className="av2-field">
      <label htmlFor={id} className="av2-label">{label}</label>
      {children}
      {error && (
        <p className="av2-field-err" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function Banner({ tone = 'danger', icon: Icon = ShieldAlert, children }) {
  return (
    <div className={`av2-banner av2-banner-${tone}`} role="alert">
      <Icon size={18} aria-hidden="true" />
      <div>{children}</div>
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
    if (!cleanUsername) newErrors.username = 'Enter your User ID, email or service number.';
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
    <form className="av2-form" onSubmit={handleSubmit} noValidate aria-labelledby="lh">
      <header className="av2-form-head">
        <h1 id="lh">Sign in</h1>
        <p>Use the User ID and password of your CSD AFD account.</p>
      </header>

      {reason === 'session-expired' && (
        <Banner tone="warning">Your session expired due to inactivity. Please sign in again.</Banner>
      )}
      {reason === 'auth-required' && (
        <Banner tone="warning">
          <strong>Sign in required.</strong> Please sign in to open that page.
        </Banner>
      )}
      {reason === 'role-unauthorized' && (
        <Banner tone="danger">
          <strong>Access denied.</strong> Please sign in with an account that has permission for that page.
        </Banner>
      )}
      {errors.form && <Banner tone="danger">{errors.form}</Banner>}

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

      <Field id="username" label="User ID" error={errors.username}>
        <div className={`av2-input ${errors.username ? 'has-error' : ''}`}>
          <User size={18} aria-hidden="true" className="av2-input-icon" />
          <input
            id="username"
            autoComplete="username"
            placeholder="User ID, email or service number"
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
        <div className="av2-link-row">
          <Link to="/forgot-username">Forgot User ID?</Link>
        </div>
      </Field>

      <Field id="passwordInput" label="Password" error={errors.password}>
        <div className={`av2-input ${errors.password ? 'has-error' : ''}`}>
          <Lock size={18} aria-hidden="true" className="av2-input-icon" />
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
            className="av2-input-action"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="av2-link-row">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </Field>

      <Field id="cap" label="Captcha" error={errors.cap}>
        <div className="av2-captcha">
          <span className="av2-captcha-code" aria-label={`Captcha ${cap.split('').join(' ')}`}>
            {cap}
          </span>
          <button
            type="button"
            className="av2-captcha-refresh"
            aria-label="Get a new captcha"
            title="Get a new captcha"
            onClick={refreshCaptcha}
            disabled={loading}
          >
            <RefreshCw size={18} />
          </button>
          <div className={`av2-input av2-captcha-input ${errors.cap ? 'has-error' : ''}`}>
            <KeyRound size={18} aria-hidden="true" className="av2-input-icon" />
            <input
              id="cap"
              autoComplete="off"
              maxLength={5}
              placeholder="Type captcha"
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
        </div>
      </Field>

      <button className="av2-submit" type="submit" disabled={isSubmitDisabled}>
        {loading ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}
        <span>{loading ? 'Checking your details…' : 'Sign in'}</span>
        {!loading && <ArrowRight size={18} aria-hidden="true" />}
      </button>
      <p className="av2-hint">
        For most accounts, a 6-digit code is sent to your registered email to finish signing in.
      </p>

      <div className="av2-register">
        <UserPlus size={18} aria-hidden="true" />
        <span>New to the portal?</span>
        <Link to="/register">Create an account</Link>
      </div>

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
