import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { WP_ROLES, MASTER_ROLES } from '../../permissions/roles.js';
import { userService, calculatePasswordScore } from '../../services/user.service.js';
import {
  User,
  Mail,
  Lock,
  Globe,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Bell,
  Star,
  Calendar,
  AlertCircle,
  FileText,
  X,
  Plus,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Layers,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function AdminAddUser() {
  const navigate = useNavigate();

  // ==========================================
  // 1. BASIC USER INFORMATION (table.form-table)
  // ==========================================
  const [userLogin, setUserLogin] = useState(''); // user_login (Username)
  const [email, setEmail] = useState(''); // email
  const [firstName, setFirstName] = useState(''); // first_name
  const [lastName, setLastName] = useState(''); // last_name
  const [url, setUrl] = useState(''); // url (Website)

  // Password & Security
  const [pass1, setPass1] = useState(''); // pass1
  const [pass2, setPass2] = useState(''); // pass2 (Repeat Password)
  const [showPassword, setShowPassword] = useState(false);
  const [pwWeak, setPwWeak] = useState(false); // pw_weak (Confirm use of weak password)
  const [copied, setCopied] = useState(false);

  // Send User Notification
  const [sendUserNotification, setSendUserNotification] = useState(true); // send_user_notification

  // Primary Role
  const [role, setRole] = useState('subscriber'); // role

  // ==========================================
  // 2. USER ADD (ACF)
  // ==========================================
  const [createdByAdmin, setCreatedByAdmin] = useState('Yes'); // acf[field_60542fd29e0f1]

  // ==========================================
  // 3. USER DATA (ACF)
  // ==========================================
  const [defaultPasswordChanged, setDefaultPasswordChanged] = useState(''); // firsttimepasschange (field_5fca4363d6bee)
  const [denyReason, setDenyReason] = useState(''); // denyreason (field_5fd9e1fc632c5)
  const [statusChangeCount, setStatusChangeCount] = useState('0'); // status_change_count (field_5fdb2ed038cb3)
  const [userEditedCount, setUserEditedCount] = useState('0'); // user_edited_count (field_5ff445d166fc7)
  const [lastPurchase4Wheeler, setLastPurchase4Wheeler] = useState(''); // last_purchase_4_wheeler (field_5fdc59cbbd5ea)
  const [lastPurchase2Wheeler, setLastPurchase2Wheeler] = useState(''); // last_purchase_2_wheeler (field_5fdc5a06bd5eb)
  const [mobileVerified, setMobileVerified] = useState(false); // mobile_verified (field_600e9af981bb1)
  const [rateOurWebsite, setRateOurWebsite] = useState(0); // rate_our_website (field_656576103136d)
  const [feedbackComment, setFeedbackComment] = useState(''); // feedback_comment (field_656576d33136e)

  // ==========================================
  // 4. OTHER ROLES (User Role Editor - URE)
  // ==========================================
  const [otherRoles, setOtherRoles] = useState([]); // ure_select_other_roles
  const [otherRoleToAdd, setOtherRoleToAdd] = useState('');

  // UI Validation & Feedback States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Generate cryptographically secure password
  const generatePassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*-_=+';
    const all = uppers + lowers + numbers + symbols;

    let pwd = '';
    pwd += uppers[Math.floor(Math.random() * uppers.length)];
    pwd += lowers[Math.floor(Math.random() * lowers.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 16; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setPass1(pwd);
    setPass2(pwd);
    setShowPassword(true);
    setPwWeak(false);

    if (errors.pass1 || errors.pass2) {
      setErrors((prev) => ({ ...prev, pass1: null, pass2: null }));
    }
  };

  const copyPasswordToClipboard = () => {
    if (!pass1) return;
    navigator.clipboard?.writeText(pass1);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live Debounced Username Duplicate Check
  useEffect(() => {
    if (!userLogin.trim()) {
      setUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const exists = await userService.checkUsernameExists(userLogin.trim());
      setUsernameAvailable(!exists);
      setCheckingUsername(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [userLogin]);

  // Live Debounced Email Duplicate Check
  useEffect(() => {
    if (!email.trim() || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(email.trim())) {
      setEmailAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      const exists = await userService.checkEmailExists(email.trim());
      setEmailAvailable(!exists);
      setCheckingEmail(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [email]);

  // Other Roles management (URE)
  const handleAddOtherRole = (roleValue) => {
    if (!roleValue) return;
    if (roleValue === role) {
      alert('This role is already selected as the Primary Role.');
      return;
    }
    if (!otherRoles.includes(roleValue)) {
      setOtherRoles([...otherRoles, roleValue]);
    }
    setOtherRoleToAdd('');
  };

  const handleRemoveOtherRole = (roleValue) => {
    setOtherRoles(otherRoles.filter((r) => r !== roleValue));
  };

  const handlePrimaryRoleChange = (newRole) => {
    setRole(newRole);
    setOtherRoles(otherRoles.filter((r) => r !== newRole));
  };

  // Password strength calculation
  const score = calculatePasswordScore(pass1);
  const strengthLevels = [
    { label: 'Very Weak', color: '#ef4444', width: '20%' },
    { label: 'Weak', color: '#f97316', width: '40%' },
    { label: 'Medium', color: '#eab308', width: '60%' },
    { label: 'Good', color: '#3b82f6', width: '80%' },
    { label: 'Strong', color: '#10b981', width: '100%' }
  ];
  const currentStrength = strengthLevels[score] || strengthLevels[0];
  const isPasswordWeak = score <= 1 && pass1.length > 0;

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!userLogin.trim()) {
      errs.userLogin = 'Username is required';
    } else if (userLogin.trim().length < 3) {
      errs.userLogin = 'Username must be at least 3 characters';
    } else if (usernameAvailable === false) {
      errs.userLogin = 'Username already exists';
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format';
    } else if (emailAvailable === false) {
      errs.email = 'Email already exists';
    }

    if (!pass1) {
      errs.pass1 = 'Password is required';
    } else if (pass1.length < 8) {
      errs.pass1 = 'Password must be at least 8 characters';
    }

    if (pass2 && pass1 !== pass2) {
      errs.pass2 = 'Passwords do not match';
    }

    if (isPasswordWeak && !pwWeak) {
      errs.pwWeak = 'Please check "Confirm use of weak password" to proceed with this password.';
    }

    if (!role) {
      errs.role = 'Role is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: userLogin.trim(),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        website: url.trim(),
        password: pass1,
        role,
        otherRoles,
        sendNotification: Boolean(sendUserNotification),
        createdByAdmin: createdByAdmin === 'Yes',
        defaultPasswordChanged: defaultPasswordChanged || (pass1 ? 'Yes' : 'No'),
        reasonOfDenial: denyReason.trim(),
        statusChangeCount: Number(statusChangeCount) || 0,
        userEditedCount: Number(userEditedCount) || 0,
        lastDemand4Wheeler: lastPurchase4Wheeler || null,
        lastDemand2Wheeler: lastPurchase2Wheeler || null,
        mobileVerified: Boolean(mobileVerified),
        websiteRating: Number(rateOurWebsite) || 0,
        feedbackComment: feedbackComment.trim(),
        status: denyReason.trim() ? 'Denied' : 'Active'
      };

      await userService.createUser(payload, 'Admin Officer K. S. Pillai');
      setLoading(false);
      navigate('/admin/users');
    } catch (err) {
      setLoading(false);
      setSubmitError(err.message || 'Failed to create user account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setUserLogin('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setUrl('');
    setPass1('');
    setPass2('');
    setShowPassword(false);
    setPwWeak(false);
    setSendUserNotification(true);
    setRole('subscriber');
    setCreatedByAdmin('Yes');
    setDefaultPasswordChanged('');
    setDenyReason('');
    setStatusChangeCount('0');
    setUserEditedCount('0');
    setLastPurchase4Wheeler('');
    setLastPurchase2Wheeler('');
    setMobileVerified(false);
    setRateOurWebsite(0);
    setFeedbackComment('');
    setOtherRoles([]);
    setOtherRoleToAdd('');
    setErrors({});
    setSubmitError('');
    setUsernameAvailable(null);
    setEmailAvailable(null);
  };

  const availableOtherRoles = WP_ROLES.filter(
    (r) => r.value !== role && !otherRoles.includes(r.value)
  );

  return (
    <div className="admin-add-user-page" style={{ maxWidth: '1240px', margin: '0 auto' }}>
      <PageHeader
        title="Add New User"
        subtitle="Create a brand new user and add them to this site with complete WordPress & ACF metadata."
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Add New User' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/admin/users')}
            >
              Back to Users
            </Button>
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={resetForm}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              icon={CheckCircle2}
              loading={loading}
              onClick={handleSubmit}
            >
              Add New User
            </Button>
          </div>
        }
      />

      {submitError && (
        <div
          className="alert alert-danger row align-center gap-1"
          style={{
            marginBottom: '1.5rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '1rem 1.25rem',
            borderRadius: '10px'
          }}
        >
          <AlertCircle size={20} />
          <span className="font-medium">{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} id="createuser" name="createuser" className="validate" noValidate>
        {/* WordPress Core Security & Action Nonces */}
        <input name="action" type="hidden" value="createuser" />
        <input type="hidden" id="_wpnonce_create-user" name="_wpnonce_create-user" value="ecc468ef48" />
        <input type="hidden" name="_wp_http_referer" value="/wp-admin/user-new.php" />

        {/* ACF Form Meta Hidden Payload */}
        <div id="acf-form-data" className="acf-hidden" style={{ display: 'none' }}>
          <input type="hidden" id="_acf_screen" name="_acf_screen" value="user" />
          <input type="hidden" id="_acf_post_id" name="_acf_post_id" value="user_0" />
          <input type="hidden" id="_acf_validation" name="_acf_validation" value="1" />
          <input type="hidden" id="_acf_nonce" name="_acf_nonce" value="f82987c3e4" />
          <input type="hidden" id="_acf_changed" name="_acf_changed" value="0" />
        </div>

        <div
          className="add-user-layout-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: '1.5rem',
            alignItems: 'start'
          }}
        >
          {/* MAIN CONTENT AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* =========================================================
                SECTION 1: WORDPRESS BASIC USER INFORMATION (table.form-table)
                ========================================================= */}
            <div className="form-section-card">
              <div className="form-section-header">
                <User size={18} className="text-brand" />
                <h3 className="form-section-title">Basic User Information</h3>
              </div>

              <div className="form-grid-2">
                {/* Username (user_login) */}
                <div>
                  <Input
                    id="user_login"
                    name="user_login"
                    label="Username"
                    required
                    maxLength={60}
                    placeholder="Enter unique login username"
                    value={userLogin}
                    onChange={(e) => setUserLogin(e.target.value)}
                    error={errors.userLogin}
                    helperText="Required. Max 60 characters."
                  />
                  {checkingUsername && (
                    <span className="micro muted" style={{ display: 'block', marginTop: '-0.3rem' }}>
                      Checking username availability...
                    </span>
                  )}
                  {usernameAvailable === true && (
                    <span className="micro text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-0.3rem' }}>
                      <Check size={12} /> Username is available
                    </span>
                  )}
                  {usernameAvailable === false && (
                    <span className="micro text-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-0.3rem' }}>
                      <AlertCircle size={12} /> Username already exists
                    </span>
                  )}
                </div>

                {/* Email (email) */}
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    helperText="Required. Official credentials and notifications will be sent here."
                  />
                  {checkingEmail && (
                    <span className="micro muted" style={{ display: 'block', marginTop: '-0.3rem' }}>
                      Checking email uniqueness...
                    </span>
                  )}
                  {emailAvailable === true && (
                    <span className="micro text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-0.3rem' }}>
                      <Check size={12} /> Email is available
                    </span>
                  )}
                  {emailAvailable === false && (
                    <span className="micro text-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-0.3rem' }}>
                      <AlertCircle size={12} /> Email already exists
                    </span>
                  )}
                </div>

                {/* First Name (first_name) */}
                <Input
                  id="first_name"
                  name="first_name"
                  label="First Name"
                  placeholder="e.g. Ramesh"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />

                {/* Last Name (last_name) */}
                <Input
                  id="last_name"
                  name="last_name"
                  label="Last Name"
                  placeholder="e.g. Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />

                {/* Website (url) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    label="Website"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    // icon={Globe}
                  />
                </div>
              </div>

              {/* Password (pass1 & pass2) */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <div className="form-grid-2" style={{ alignItems: 'start' }}>
                  {/* Left Column: Password */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', minHeight: '30px' }}>
                      <label htmlFor="pass1" className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                        Password <span className="req-star" style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="wp-generate-pw"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#1e4fd8',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <RefreshCw size={12} />
                        <span>Generate password</span>
                      </button>
                    </div>

                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        id="pass1"
                        name="pass1"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={pass1}
                        onChange={(e) => setPass1(e.target.value)}
                        autoComplete="new-password"
                        spellCheck="false"
                        required
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0.5rem 74px 0.5rem 0.85rem',
                          borderRadius: '8px',
                          border: errors.pass1 ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          fontFamily: showPassword ? 'monospace' : 'inherit',
                          background: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          height: '30px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#64748b'
                          }}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={copyPasswordToClipboard}
                          title="Copy password to clipboard"
                          disabled={!pass1}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: pass1 ? 'pointer' : 'not-allowed',
                            color: copied ? '#16a34a' : '#64748b',
                            opacity: pass1 ? 1 : 0.4
                          }}
                        >
                          {copied ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                    {errors.pass1 && (
                      <p className="err" role="alert" style={{ margin: '0.25rem 0 0', color: '#ef4444', fontSize: '0.8rem' }}>
                        ⚠ {errors.pass1}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Repeat Password */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.45rem', minHeight: '30px' }}>
                      <label htmlFor="pass2" className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                        Repeat Password <span className="description" style={{ fontWeight: 400, color: '#64748b', fontSize: '0.82rem' }}>(required)</span>
                      </label>
                    </div>

                    <div style={{ width: '100%' }}>
                      <input
                        id="pass2"
                        name="pass2"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Type the password again"
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        autoComplete="new-password"
                        spellCheck="false"
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          border: errors.pass2 ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          fontFamily: showPassword ? 'monospace' : 'inherit',
                          background: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <p className="micro muted" id="pass2-desc" style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        Type the password again.
                      </p>
                      {errors.pass2 && (
                        <p className="err" role="alert" style={{ margin: '0.25rem 0 0', color: '#ef4444', fontSize: '0.8rem' }}>
                          ⚠ {errors.pass2}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Strength Result */}
                {pass1 && (
                  <div
                    id="pass-strength-result"
                    style={{
                      marginTop: '0.75rem',
                      background: '#f8fafc',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div className="between" style={{ marginBottom: '0.35rem' }}>
                      <span className="small font-semibold">Password Strength:</span>
                      <span className="small font-bold" style={{ color: currentStrength.color }}>
                        {currentStrength.label}
                      </span>
                    </div>
                    <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: currentStrength.width,
                          backgroundColor: currentStrength.color,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Weak Password Confirmation Checkbox (pw_weak) */}
                {isPasswordWeak && (
                  <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                    <label className="checkbox-label row align-center gap-1 small pointer font-semibold" style={{ color: '#92400e' }}>
                      <input
                        type="checkbox"
                        name="pw_weak"
                        className="pw-checkbox"
                        checked={pwWeak}
                        onChange={(e) => setPwWeak(e.target.checked)}
                      />
                      <span>Confirm use of weak password</span>
                    </label>
                    {errors.pwWeak && (
                      <p className="err" role="alert" style={{ color: '#b45309', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                        ⚠ {errors.pwWeak}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Send User Notification (send_user_notification) */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ padding: '0.85rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                  <label className="checkbox-label row align-center gap-1 pointer font-semibold" style={{ color: '#166534' }}>
                    <input
                      type="checkbox"
                      id="send_user_notification"
                      name="send_user_notification"
                      value="1"
                      checked={sendUserNotification}
                      onChange={(e) => setSendUserNotification(e.target.checked)}
                    />
                    <span>Send the new user an email about their account</span>
                  </label>
                  <p className="micro muted" style={{ margin: '0.25rem 0 0 1.6rem', color: '#15803d' }}>
                    Dispatches credentials and login instructions to the user's registered email address.
                  </p>
                </div>
              </div>

              {/* Role (role) */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <label className="form-label font-semibold" htmlFor="role">
                  Role <span className="req-star">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => handlePrimaryRoleChange(e.target.value)}
                  className="select-input"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  {WP_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="micro muted" style={{ marginTop: '0.35rem' }}>
                  Determines the primary capabilities and storefront access of this user.
                </p>
              </div>
            </div>

            {/* =========================================================
                SECTION 2: USER ADD (ACF - created_by_admin)
                ========================================================= */}
            <div className="form-section-card">
              <div className="form-section-header">
                <ShieldCheck size={18} className="text-brand" />
                <h3 className="form-section-title">User Add</h3>
              </div>
              <div className="acf-field acf-field-radio">
                <label className="form-label font-semibold">
                  Created by Admin <span className="req-star">*</span>
                </label>
                <div className="row align-center gap-2" style={{ marginTop: '0.35rem' }}>
                  <label className="radio-label row align-center gap-1 pointer small">
                    <input
                      type="radio"
                      id="acf-field_60542fd29e0f1-yes"
                      name="acf[field_60542fd29e0f1]"
                      value="Yes"
                      checked={createdByAdmin === 'Yes'}
                      onChange={() => setCreatedByAdmin('Yes')}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="radio-label row align-center gap-1 pointer small">
                    <input
                      type="radio"
                      id="acf-field_60542fd29e0f1-no"
                      name="acf[field_60542fd29e0f1]"
                      value="No"
                      checked={createdByAdmin === 'No'}
                      onChange={() => setCreatedByAdmin('No')}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* =========================================================
                SECTION 3: USER DATA (ACF Fields)
                ========================================================= */}
            <div className="form-section-card">
              <div className="form-section-header">
                <FileText size={18} className="text-brand" />
                <h3 className="form-section-title">User Data</h3>
              </div>

              <div className="form-grid-2">
                {/* Default Password changed (firsttimepasschange) */}
                <div>
                  <Input
                    id="acf-field_5fca4363d6bee"
                    name="acf[field_5fca4363d6bee]"
                    label="Default Password changed"
                    placeholder="e.g. Yes / No"
                    value={defaultPasswordChanged}
                    onChange={(e) => setDefaultPasswordChanged(e.target.value)}
                    helperText="Tracks whether default password was modified."
                  />
                </div>

                {/* Status Change Count (status_change_count) */}
                <div>
                  <Input
                    id="acf-field_5fdb2ed038cb3"
                    name="acf[field_5fdb2ed038cb3]"
                    label="Status Change Count"
                    type="text"
                    value={statusChangeCount}
                    onChange={(e) => setStatusChangeCount(e.target.value)}
                    helperText="status count has to increase when status is changed to denied which means that ddgcs has denied it one time"
                  />
                </div>

                {/* User Edited Count (user_edited_count) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <Input
                    id="acf-field_5ff445d166fc7"
                    name="acf[field_5ff445d166fc7]"
                    type="number"
                    step="any"
                    label="User Edited Count"
                    value={userEditedCount}
                    onChange={(e) => setUserEditedCount(e.target.value)}
                    helperText="one person is not allowed to update his profile more than certain number of times which can be defined in options in admin portal. And every time admin approves or denies a sign up request parameter of number of times profile has been updated which can be put in user meta data can be set to zero again."
                  />
                </div>

                {/* Date of last demand of 4 wheeler (last_purchase_4_wheeler) */}
                <div>
                  <label className="form-label" htmlFor="acf-field_5fdc59cbbd5ea">
                    Date of last demand of 4 wheeler
                  </label>
                  <input
                    type="date"
                    id="acf-field_5fdc59cbbd5ea"
                    name="acf[field_5fdc59cbbd5ea]"
                    className="select-input"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    value={lastPurchase4Wheeler}
                    onChange={(e) => setLastPurchase4Wheeler(e.target.value)}
                  />
                  <span className="micro muted">Date format: dd-mm-yy</span>
                </div>

                {/* Date of last demand of 2 wheeler (last_purchase_2_wheeler) */}
                <div>
                  <label className="form-label" htmlFor="acf-field_5fdc5a06bd5eb">
                    Date of last demand of 2 wheeler
                  </label>
                  <input
                    type="date"
                    id="acf-field_5fdc5a06bd5eb"
                    name="acf[field_5fdc5a06bd5eb]"
                    className="select-input"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    value={lastPurchase2Wheeler}
                    onChange={(e) => setLastPurchase2Wheeler(e.target.value)}
                  />
                  <span className="micro muted">Date format: dd-mm-yy</span>
                </div>

                {/* Mobile Verified (mobile_verified) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="checkbox-label row align-center gap-1 small pointer">
                    <input
                      type="checkbox"
                      id="acf-field_600e9af981bb1"
                      name="acf[field_600e9af981bb1]"
                      value="1"
                      checked={mobileVerified}
                      onChange={(e) => setMobileVerified(e.target.checked)}
                    />
                    <span><strong>Mobile Verified</strong></span>
                  </label>
                </div>

                {/* Rate Our Website (rate_our_website) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="acf-field_656576103136d">
                    Rate Our Website: <strong>{rateOurWebsite}</strong> / 5
                  </label>
                  <div className="row align-center gap-2">
                    <input
                      type="range"
                      id="acf-field_656576103136d"
                      name="acf[field_656576103136d]"
                      min="0"
                      max="5"
                      step="1"
                      value={rateOurWebsite}
                      onChange={(e) => setRateOurWebsite(Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      id="acf-field_656576103136d-alt"
                      min="0"
                      max="5"
                      step="1"
                      value={rateOurWebsite}
                      onChange={(e) => setRateOurWebsite(Math.min(5, Math.max(0, Number(e.target.value))))}
                      className="select-input"
                      style={{ width: '60px', padding: '0.4rem', textAlign: 'center' }}
                    />
                    <div className="row align-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill={star <= rateOurWebsite ? '#f59e0b' : 'none'}
                          color={star <= rateOurWebsite ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback Comment (feedback_comment) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="acf-field_656576d33136e">
                    Feedback Comment
                  </label>
                  <textarea
                    id="acf-field_656576d33136e"
                    name="acf[field_656576d33136e]"
                    rows={3}
                    className="select-input"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                    placeholder="User feedback comment"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  />
                </div>

                {/* Reason of Denial (denyreason) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="acf-field_5fd9e1fc632c5">
                    Reason of Denial
                  </label>
                  <textarea
                    id="acf-field_5fd9e1fc632c5"
                    name="acf[field_5fd9e1fc632c5]"
                    rows={8}
                    className="select-input"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                    placeholder="Enter reason of denial if application/access is rejected"
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* =========================================================
                SECTION 4: OTHER ROLES (User Role Editor - URE)
                ========================================================= */}
            <div className="form-section-card">
              <div className="form-section-header">
                <Layers size={18} className="text-brand" />
                <h3 className="form-section-title">Other Roles (User Role Editor)</h3>
              </div>

              <div>
                <label className="form-label font-semibold" htmlFor="ure_select_other_roles">
                  Other Roles
                </label>
                <p className="micro muted" style={{ marginBottom: '0.65rem' }}>
                  Hold <kbd style={{ padding: '1px 4px', background: '#e2e8f0', borderRadius: '3px' }}>Ctrl</kbd> (Windows) or <kbd style={{ padding: '1px 4px', background: '#e2e8f0', borderRadius: '3px' }}>Cmd</kbd> (Mac) to select/deselect multiple roles.
                </p>

                <select
                  multiple
                  id="ure_select_other_roles"
                  name="ure_select_other_roles"
                  value={otherRoles}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setOtherRoles(selected.filter((r) => r !== role));
                  }}
                  className="select-input"
                  style={{
                    width: '100%',
                    height: '190px',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}
                >
                  {WP_ROLES.map((r) => (
                    <option key={r.value} value={r.value} disabled={r.value === role}>
                      {r.label} {r.value === role ? '(Primary Role)' : ''}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="ure_other_roles" id="ure_other_roles" value={otherRoles.join(',')} />
                <span id="ure_other_roles_list" style={{ display: 'none' }}>{otherRoles.join(', ')}</span>

                {/* Selected Roles Badges */}
                <div style={{ marginTop: '0.85rem' }}>
                  <div className="between" style={{ marginBottom: '0.35rem' }}>
                    <span className="small font-semibold">Active Secondary Roles ({otherRoles.length}):</span>
                    {otherRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOtherRoles([])}
                        className="micro text-danger pointer"
                        style={{ background: 'none', border: 0, padding: 0 }}
                      >
                        Clear All Secondary Roles
                      </button>
                    )}
                  </div>
                  <div className="row wrap gap-1">
                    {otherRoles.length === 0 ? (
                      <span className="micro muted italic">No secondary roles selected. Click or hold Ctrl to select from the box above.</span>
                    ) : (
                      otherRoles.map((rVal) => {
                        const rObj = WP_ROLES.find((m) => m.value === rVal);
                        return (
                          <span
                            key={rVal}
                            className="badge row align-center gap-1"
                            style={{
                              background: '#e0f2fe',
                              color: '#0369a1',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.82rem'
                            }}
                          >
                            <span>{rObj ? rObj.label : rVal}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOtherRole(rVal)}
                              style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }}
                              title="Remove role"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              SIDEBAR: SUBMISSION & AUDIT INFO
              ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '80px' }}>
            
            {/* Quick Action Box */}
            <div className="form-section-card" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
              <h4 style={{ margin: '0 0 0.85rem', fontSize: '1rem', color: '#0b1f3a' }}>Publish User</h4>
              <p className="micro muted" style={{ marginBottom: '1rem' }}>
                All user meta and audit records will be stored permanently in the master registry.
              </p>
              
              <Button
                type="submit"
                id="createusersub"
                name="createuser"
                loading={loading}
                icon={CheckCircle2}
                style={{ width: '100%', marginBottom: '0.65rem' }}
              >
                Add New User
              </Button>
              <Button
                type="button"
                variant="outline"
                style={{ width: '100%' }}
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {/* User Meta Summary */}
            <div className="form-section-card">
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0b1f3a' }}>Form Meta Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: '#475569' }}>
                <div className="between">
                  <span>Username:</span>
                  <strong>{userLogin || '—'}</strong>
                </div>
                <div className="between">
                  <span>Email:</span>
                  <span className="truncate" style={{ maxWidth: '160px' }}>{email || '—'}</span>
                </div>
                <div className="between">
                  <span>Primary Role:</span>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#0b1f3a' }}>
                    {WP_ROLES.find((r) => r.value === role)?.label || role}
                  </span>
                </div>
                <div className="between">
                  <span>Secondary Roles:</span>
                  <span>{otherRoles.length} assigned</span>
                </div>
                <div className="between">
                  <span>Email Notification:</span>
                  <span style={{ color: sendUserNotification ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                    {sendUserNotification ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="between">
                  <span>Created by Admin:</span>
                  <strong>{createdByAdmin}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
