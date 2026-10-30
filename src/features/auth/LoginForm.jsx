import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2, RefreshCw, KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleNavigatePath, normalizeRole, isPathAllowedForRole } from '../../permissions/roles.js';
import { authService } from '../../services/auth.service.js';
import { makeCaptcha } from '../../utils/captcha.js';

function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && <span aria-hidden> *</span>}
      </label>
      {children}
      {hint && <p className="small hint">{hint}</p>}
      {/* <p className="err" role={err ? 'alert' : undefined}>
        {err && `⚠ ${err}`}
      </p> */}
    </div>
  );
}

export default function LoginForm({ onNeedOtp }) {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  // Pure user input states without any dummy or pre-filled values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [cap, setCap] = useState(makeCaptcha);
  const [capIn, setCapIn] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCap(makeCaptcha());
    setCapIn('');
  };

  const { login } = useAuth();
  const navigate = useNavigate();


  // ```jsx
  const quickTestAccounts = [
    {
      role: "ADMIN",
      label: "System Admin",
      icon: "⚙️",
      username: "admincsd",
      password: "Test@123456",
    },
    {
      role: "CS_DIRECTOR",
      label: "CS Director",
      icon: "🏛️",
      username: "cs_director_test",
      password: "Test@123456",
    },
    {
      role: "CSD_HO",
      label: "CSD HO",
      icon: "🏢",
      username: "csd_ho_test",
      password: "Test@123456",
    },
    {
      role: "DEPOT_OFFICIAL",
      label: "Depot Official",
      icon: "🏭",
      username: "depot_delhi_test",
      password: "Test@123456",
    },
    {
      role: "URC",
      label: "URC Officer",
      icon: "🏪",
      username: "urc_delhi_test",
      password: "Test@123456",
    },
    {
      role: "OEM",
      label: "OEM (Mahindra)",
      icon: "🚗",
      username: "oem_mahindra_test",
      password: "Passw0rd!x",
    },
    {
      role: "DEALER",
      label: "Dealer (Supreme Mobiles)",
      icon: "🏬",
      username: "dealer_hisar",
      password: "Dealer@123456",
    },
    {
      role: "DEALER",
      label: "Dealer (Koncept Mahindra)",
      icon: "🏬",
      username: "dealer_koncept",
      password: "Dealer@123456",
    },
    {
      role: "BENEFICIARY",
      label: "Beneficiary (Rajesh Kumar)",
      icon: "🎖️",
      username: "rajesh_kumar",
      password: "Beneficiary@123456",
    },
    {
      role: "BENEFICIARY",
      label: "Beneficiary (Pending)",
      icon: "⏳",
      username: "pending_beneficiary",
      password: "Pending@123456",
    },
  ];






  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      newErrors.username = 'Please enter your Username, Email, or Service Number.';
    }
    if (!password) {
      newErrors.password = 'Please enter your password.';
    }
    if (!capIn.trim()) {
      newErrors.cap = 'Enter the captcha text.';
    } else if (capIn.trim() !== cap) {
      newErrors.cap = 'Captcha does not match. Try again.';
      refreshCaptcha();
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // 1. Verify user credentials and trigger backend OTP generation
      let credResult;
      try {
        const credRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/verify-credentials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, password }),
        });
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

      // 2. Transition to OTP Verification step (Backend generated & dispatched OTP securely)
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
        const dest = (redirectUrl && !redirectUrl.startsWith('//') && isPathAllowedForRole(finalRole, redirectUrl))
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

  return (
    <form className="panel logincard authcard" onSubmit={handleSubmit} noValidate aria-labelledby="lh">
      <div className="between">
        <Link to="/register" className="vli">
          {/* New user? Register */}
          Are you a new user Click here ?
        </Link>
        <button type="button" className="circle" aria-label="Go back" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
      </div>

      <h1 id="lh">Login</h1>
      <p className="reg-warn">
        Enter your registered credentials to sign in to the CSD AFD Portal.
      </p>

      {reason === 'session-expired' && (
        <div className="alert-banner warning small mb-3" role="alert">
          <ShieldAlert size={16} />
          <span>Your previous secure session expired due to inactivity. Please log in again.</span>
        </div>
      )}

      {reason === 'auth-required' && (
        <div className="alert-banner warning small mb-3 row align-center gap-1" role="alert">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <span>
            <strong>Login Required:</strong> Please log in with your credentials to access this protected area.
          </span>
        </div>
      )}

      {reason === 'role-unauthorized' && (
        <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <span>
            <strong>Access Denied:</strong> This section requires authorized role credentials. Please log in with an Administrator or authorized account.
          </span>
        </div>
      )}

      {errors.form && (
        <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* USERNAME FIELD */}
      <Field id="username" label="User ID" req err={errors.username}>
        <div className="fld">
          <User size={18} aria-hidden />
          <input
            id="username"
            autoComplete="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username || errors.form) setErrors({});
            }}
            disabled={loading}
            aria-invalid={!!errors.username}
          />
        </div>
        <div className="row justify-end mt-1" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/forgot-username" className="vli">
            Forgot Username?
          </Link>
        </div>
      </Field>

      {/* PASSWORD FIELD */}
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
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="row justify-end mt-1 mb-3" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/forgot-password" className="vli">
            Forgot Password?
          </Link>
        </div>
      </Field>

      {/* CAPTCHA FIELD */}
      <Field id="cap" label="Captcha" req err={errors.cap}>
        <div className="captcha-row">
          <span
            className="captcha-img"
            aria-label={`Captcha ${cap.split('').join(' ')}`}
          >
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
                  const updated = { ...prev };
                  delete updated.cap;
                  delete updated.form;
                  return updated;
                });
              }
            }}
            disabled={loading}
            aria-invalid={!!errors.cap}
          />
        </div>
      </Field>


      {/* SUBMIT BUTTON */}
      <button
        className="btn big wide row align-center justify-center gap-1"
        type="submit"
        disabled={isSubmitDisabled}
      >
        {loading && <Loader2 size={18} className="spin" />}
        <span>{loading ? 'Verifying Credentials...' : 'Sign In with OTP Verification'}</span>
      </button>

      {/* Quick Role Fill for Development & Testing */}
      {/* <div className="login-quick-fill-box">
        <span className="login-quick-fill-label">Quick Fill Test Accounts:</span>
        <div className="login-quick-fill-btns">
          <button
            type="button"
            className="btn xs out login-quick-btn"
            onClick={() => {
              setUsername('depot_delhi');
              setPassword('Dealer@123456');
            }}
          >
            🏢 Dealer (Supreme Mobiles)
          </button>
          <button
            type="button"
            className="btn xs out login-quick-btn"
            onClick={() => {
              setUsername('cs_director');
              setPassword('Director@123456');
            }}
          >
            🏢 CS Director
          </button>
          <button
            type="button"
            className="btn xs out login-quick-btn"
            onClick={() => {
              setUsername('systemadmin');
              setPassword('Admin@123456');
            }}
          >
            ⚙️ System Admin
          </button>
          <button
            type="button"
            className="btn xs out login-quick-btn"
            onClick={() => {
              setUsername('aman');
              setPassword('Pa$$w0rd!');
            }}
          >
            🎖️ Beneficiary (Rajesh Kumar)
          </button>
        </div>
      </div> */}

      <div className="login-quick-fill-box">
        <span className="login-quick-fill-label">
          Quick Fill Test Accounts:
        </span>

        <div className="login-quick-fill-btns">
          {quickTestAccounts.map((account) => (
            <button
              key={`${account.role} -${account.username} `}
              type="button"
              className="btn xs out login-quick-btn"
              onClick={() => {
                setUsername(account.username);
                setPassword(account.password);
              }}
            >
              {account.icon} {account.label}
            </button>
          ))}
        </div>
      </div>

    </form>
  );
}