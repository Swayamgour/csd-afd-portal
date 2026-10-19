import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleNavigatePath } from '../../permissions/roles.js';
import { authService } from '../../services/auth.service.js';
import { generateOtp, sendOtpEmail } from '../../services/emailJs.service.js';

function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && <span aria-hidden> *</span>}
      </label>
      {children}
      {hint && <p className="small hint">{hint}</p>}
      <p className="err" role={err ? 'alert' : undefined}>
        {err && `⚠ ${err}`}
      </p>
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // 1. Verify user credentials (strictly verifies username & password against database/local registry)
      const credResult = await authService.verifyCredentials({ username: cleanUsername, password });
      const targetUser = credResult.user;

      // 2. Identify the user's registered email
      const registeredEmail = targetUser?.email || (cleanUsername.includes('@') ? cleanUsername : null);
      const recipientName = targetUser?.name || targetUser?.username || 'Beneficiary';

      if (!registeredEmail) {
        throw new Error('No registered email found for this account. Please register or verify account.');
      }

      // 3. Generate secure 6-digit OTP
      const otpCode = generateOtp();
      const expiryMinutes = 5;

      // 4. Send OTP directly to the registered email using EmailJS
      const emailResult = await sendOtpEmail({
        email: registeredEmail,
        name: recipientName,
        otp: otpCode,
        expiryMinutes,
        purpose: 'login',
      });

      // 5. Notify backend /auth/send-otp if reachable
      try {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: registeredEmail, purpose: 'LOGIN', otp: otpCode }),
        }).catch(() => { });
      } catch { }

      // 6. Transition to OTP Verification step ONLY when credentials are correct
      if (onNeedOtp) {
        onNeedOtp({
          username: cleanUsername,
          role: targetUser?.role || 'beneficiary',
          password,
          email: registeredEmail,
          name: recipientName,
          expectedOtp: otpCode,
          expiresAt: Date.now() + expiryMinutes * 60 * 1000,
          user: targetUser,
          isDevMock: emailResult?.isDevMock || emailResult?.isDevFallback,
        });
      } else {
        const loggedInUser = await login({ username: cleanUsername, password, role: targetUser?.role });
        const home = getRoleNavigatePath(loggedInUser?.role);
        navigate(home, { replace: true });
      }
    } catch (err) {
      // Credentials invalid -> show error on screen and remain on login page (no transition to OTP)
      setErrors({ form: err.message || 'Invalid username or password. Please verify your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !username.trim() || !password;

  return (
    <form className="panel logincard authcard" onSubmit={handleSubmit} noValidate aria-labelledby="lh">
      <div className="between">
        <Link to="/register" className="vli">
          New user? Register
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
        <div className="alert-banner warning small" role="alert" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} />
          <span>Your previous secure session expired due to inactivity. Please log in again.</span>
        </div>
      )}

      {reason === 'auth-required' && (
        <div
          className="alert-banner warning small"
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            background: '#fffbeb',
            color: '#92400e',
            border: '1px solid #fde68a',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          <ShieldAlert size={18} className="flex-shrink-0" style={{ color: '#d97706' }} />
          <span>
            <strong>Login Required:</strong> Please log in with your credentials to access this protected area.
          </span>
        </div>
      )}

      {reason === 'role-unauthorized' && (
        <div
          className="alert-banner danger small"
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          <ShieldAlert size={18} className="flex-shrink-0" style={{ color: '#dc2626' }} />
          <span>
            <strong>Access Denied:</strong> This section requires authorized role credentials. Please log in with an Administrator or authorized account.
          </span>
        </div>
      )}

      {errors.form && (
        <div
          className="alert-banner danger small"
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            padding: '0.75rem',
            borderRadius: '6px'
          }}
        >
          <ShieldAlert size={18} className="flex-shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* USERNAME FIELD */}
      <Field id="username" label="User ID / Username / Email / Service Number" req err={errors.username}>
        <div className="fld">
          <User size={18} aria-hidden />
          <input
            id="username"
            autoComplete="username"
            placeholder="Enter username, email or service number"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username || errors.form) setErrors({});
            }}
            disabled={loading}
            aria-invalid={!!errors.username}
          />
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
      </Field>

      <div className="between" style={{ marginTop: '0.25rem', marginBottom: '1.25rem' }}>
        <label className="inline agree" style={{ fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
          />{' '}
          Remember credentials
        </label>
        <Link to="/forgot-password" className="vli" style={{ fontSize: '0.85rem' }}>
          Forgot Password?
        </Link>
      </div>

      {/* SUBMIT BUTTON - DISABLED WHILE LOADING OR EMPTY */}
      <button
        className="btn big wide"
        type="submit"
        disabled={isSubmitDisabled}
        style={{
          opacity: isSubmitDisabled ? 0.65 : 1,
          cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.15s ease'
        }}
      >
        {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
        <span>{loading ? 'Verifying Credentials...' : 'Sign In with OTP Verification'}</span>
      </button>
    </form>
  );
}