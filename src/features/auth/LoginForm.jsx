import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, Lock, Eye, EyeOff, RefreshCw, KeyRound, ShieldAlert, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS, ROLE_HOMES } from '../../permissions/roles.js';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCaptcha = () =>
  Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

const DEMO_USERNAMES = {
  [ROLES.BENEFICIARY]: 'JC-765432X',
  [ROLES.CSD]: 'CSD_HO_089',
  [ROLES.DEPOT]: 'DEPOT_MGR_DEL',
  [ROLES.URC]: 'URC_OFF_CANTT',
  [ROLES.OEM]: 'OEM_TATA_AFD',
  [ROLES.DEALER]: 'DLR_PRATHAM_DEL',
  [ROLES.HELPDESK_AGENT]: 'HD_AGENT_104',
  [ROLES.HELPDESK_SUPERVISOR]: 'HD_SUP_002',
  [ROLES.ADMIN]: 'SYS_ADMIN_CSD',
};

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

  const [role, setRole] = useState(ROLES.BENEFICIARY);
  const [username, setUsername] = useState('JC-765432X');
  const [password, setPassword] = useState('GovtPass@2024');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selected = e.target.value;
    setRole(selected);
    if (DEMO_USERNAMES[selected]) setUsername(DEMO_USERNAMES[selected]);
  };

  const refreshCaptcha = () => {
    setCaptcha(makeCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!username.trim()) newErrors.username = 'Please enter your User ID, Service No or Email.';
    if (!password) newErrors.password = 'Please enter your password.';
    if (!captchaInput.trim()) {
      newErrors.captcha = 'Please enter the security verification captcha.';
    } else if (captchaInput.trim().toUpperCase() !== captcha) {
      newErrors.captcha = 'Captcha text did not match. Please try again.';
      refreshCaptcha();
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      if (onNeedOtp) {
        onNeedOtp({ username, role, password });
      } else {
        const loggedInUser = await login({ username, password, role });
        const home = ROLE_HOMES[loggedInUser.role] || '/beneficiary/dashboard';
        navigate(home);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Authentication failed. Please verify credentials.' });
    } finally {
      setLoading(false);
    }
  };

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
        Select your portal role and enter authorized credentials to sign in to the AFD Portal.
      </p>

      {reason === 'session-expired' && (
        <div className="alert-banner warning small" role="alert">
          <ShieldAlert size={16} />
          <span>Your previous secure session expired due to inactivity. Please log in again.</span>
        </div>
      )}

      {errors.form && (
        <div className="alert-banner danger small" role="alert">
          <ShieldAlert size={16} />
          <span>{errors.form}</span>
        </div>
      )}

      <Field id="portalRole" label="Login As (Role Authority)" req>
        <select id="portalRole" value={role} onChange={handleRoleChange}>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="username" label="Service No / User ID / Mobile" req err={errors.username}>
        <div className="fld">
          <User size={18} aria-hidden />
          <input
            id="username"
            autoComplete="username"
            placeholder="e.g. JC-765432X or registered email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={!!errors.username}
          />
        </div>
      </Field>

      <Field id="passwordInput" label="Password" req err={errors.password}>
        <div className="fld has-eye">
          <Lock size={18} aria-hidden />
          <input
            id="passwordInput"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            className="eye"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      <div className="between">
        <label className="inline agree">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />{' '}
          Remember credentials
        </label>
        <Link to="/forgot-password" className="vli">
          Forgot Password?
        </Link>
      </div>

      <label htmlFor="captchaInput">
        Captcha <span aria-hidden>*</span>
      </label>
      <div className="captcha-row">
        <span className="captcha-img" aria-label={`Captcha ${captcha.split('').join(' ')}`}>
          {captcha}
        </span>
        <button type="button" className="icon sm" aria-label="Refresh captcha" onClick={refreshCaptcha}>
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="fld">
        <KeyRound size={18} aria-hidden />
        <input
          id="captchaInput"
          autoComplete="off"
          maxLength={5}
          placeholder="Type the captcha text displayed above"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          aria-invalid={!!errors.captcha}
        />
      </div>
      <p className="err" role={errors.captcha ? 'alert' : undefined}>
        {errors.captcha && `⚠ ${errors.captcha}`}
      </p>

      <button className="btn big wide" type="submit" disabled={loading}>
        {loading ? 'Please wait...' : 'Sign In & Verify Session'}
      </button>
    </form>
  );
}