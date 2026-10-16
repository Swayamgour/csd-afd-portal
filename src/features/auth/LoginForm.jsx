import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, RefreshCw, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS, ROLE_HOMES } from '../../permissions/roles.js';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCaptcha = () =>
  Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

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
  const [accountLocked, setAccountLocked] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selected = e.target.value;
    setRole(selected);
    // Autofill representative username for convenience
    switch (selected) {
      case ROLES.BENEFICIARY:
        setUsername('JC-765432X');
        break;
      case ROLES.CSD:
        setUsername('CSD_HO_089');
        break;
      case ROLES.DEPOT:
        setUsername('DEPOT_MGR_DEL');
        break;
      case ROLES.URC:
        setUsername('URC_OFF_CANTT');
        break;
      case ROLES.OEM:
        setUsername('OEM_TATA_AFD');
        break;
      case ROLES.DEALER:
        setUsername('DLR_PRATHAM_DEL');
        break;
      case ROLES.HELPDESK_AGENT:
        setUsername('HD_AGENT_104');
        break;
      case ROLES.HELPDESK_SUPERVISOR:
        setUsername('HD_SUP_002');
        break;
      case ROLES.ADMIN:
        setUsername('SYS_ADMIN_CSD');
        break;
      default:
        break;
    }
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
    <form onSubmit={handleSubmit} noValidate className="enterprise-login-form">
      <div className="form-head mb-2">
        <h2 className="login-heading">Sign In to AFD Portal</h2>
        <p className="login-subheading muted small">
          Select your portal role and enter authorized credentials.
        </p>
      </div>

      {reason === 'session-expired' && (
        <div className="alert-banner warning mb-2 small" role="alert">
          <ShieldAlert size={16} />
          <span>Your previous secure session expired due to inactivity. Please log in again.</span>
        </div>
      )}

      {errors.form && (
        <div className="alert-banner danger mb-2 small" role="alert">
          <ShieldAlert size={16} />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Role Selection */}
      <div className="form-field mb-2">
        <label htmlFor="portalRole" className="form-label font-semibold small">
          Login As (Role Authority) <span className="req-star">*</span>
        </label>
        <div className="fld">
          <select
            id="portalRole"
            value={role}
            onChange={handleRoleChange}
            className="select-input"
          >
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User ID / Service Number */}
      <Input
        id="username"
        label="Service No / User ID / Mobile"
        placeholder="e.g. JC-765432X or registered email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        icon={User}
        error={errors.username}
        required
        className="mb-2"
      />

      {/* Password */}
      <div className="form-field mb-2">
        <label htmlFor="passwordInput" className="form-label font-semibold small">
          Password <span className="req-star">*</span>
        </label>
        <div className={`fld ${errors.password ? 'has-error' : ''}`}>
          <Lock size={18} className="fld-icon" aria-hidden="true" />
          <input
            id="passwordInput"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="fld-end-btn icon-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="err small">⚠ {errors.password}</p>}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="between mb-2 small">
        <label className="checkbox-label row align-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember credentials</span>
        </label>
        <Link to="/forgot-password" className="link small">
          Forgot Password?
        </Link>
      </div>

      {/* Captcha Verification */}
      <div className="captcha-group mb-2">
        <label htmlFor="captchaInput" className="form-label font-semibold small">
          Security Verification <span className="req-star">*</span>
        </label>
        <div className="captcha-box row align-center gap-1 mb-1">
          <div className="captcha-display" aria-label={`Captcha code: ${captcha}`}>
            {captcha}
          </div>
          <button
            type="button"
            onClick={refreshCaptcha}
            className="icon-btn circle"
            title="Refresh Captcha Code"
            aria-label="Refresh captcha"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className={`fld ${errors.captcha ? 'has-error' : ''}`}>
          <KeyRound size={16} className="fld-icon" aria-hidden="true" />
          <input
            id="captchaInput"
            type="text"
            placeholder="Enter the 5 characters above"
            maxLength={5}
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            required
          />
        </div>
        {errors.captcha && <p className="err small">⚠ {errors.captcha}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="wide mb-2"
      >
        Sign In & Verify Session
      </Button>

      {/* Beneficiary Registration Link */}
      <div className="register-callout text-center pt-2 border-top small">
        <span className="muted">New to CSD AFD Online? </span>
        <Link to="/register" className="font-semibold link">
          New Defence Beneficiary Registration
        </Link>
      </div>
    </form>
  );
}
