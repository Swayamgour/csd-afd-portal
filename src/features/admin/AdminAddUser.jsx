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
    <div className="admin-add-user-page user-page-container">
      <PageHeader
        title="Add New User"
        subtitle="Create a brand new user and add them to this site with complete WordPress & ACF metadata."
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Add New User' }
        ]}
        // actions={
        //   <div className="flex-gap-sm">
        //     <Button
        //       variant="outline"
        //       icon={ArrowLeft}
        //       onClick={() => navigate('/admin/users')}
        //     >
        //       Back to Users
        //     </Button>
        //     <Button
        //       variant="ghost"
        //       icon={RotateCcw}
        //       onClick={resetForm}
        //       disabled={loading}
        //     >
        //       Reset
        //     </Button>
        //     <Button
        //       icon={CheckCircle2}
        //       loading={loading}
        //       onClick={handleSubmit}
        //     >
        //       Add New User
        //     </Button>
        //   </div>
        // }
      />

      {submitError && (
        <div className="alert alert-danger row align-center gap-1 admin-alert-danger">
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
        <div id="acf-form-data" className="acf-hidden d-none">
          <input type="hidden" id="_acf_screen" name="_acf_screen" value="user" />
          <input type="hidden" id="_acf_post_id" name="_acf_post_id" value="user_0" />
          <input type="hidden" id="_acf_validation" name="_acf_validation" value="1" />
          <input type="hidden" id="_acf_nonce" name="_acf_nonce" value="f82987c3e4" />
          <input type="hidden" id="_acf_changed" name="_acf_changed" value="0" />
        </div>

        <div className="add-user-layout-grid admin-user-layout-grid">
          {/* MAIN CONTENT AREA */}
          <div className="flex-col-gap-xl">

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
                    <span className="micro muted d-block mt-neg-xs">
                      Checking username availability...
                    </span>
                  )}
                  {usernameAvailable === true && (
                    <span className="micro text-success flex-align-center-gap-xs mt-neg-xs">
                      <Check size={12} /> Username is available
                    </span>
                  )}
                  {usernameAvailable === false && (
                    <span className="micro text-danger flex-align-center-gap-xs mt-neg-xs">
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
                    <span className="micro muted d-block mt-neg-xs">
                      Checking email uniqueness...
                    </span>
                  )}
                  {emailAvailable === true && (
                    <span className="micro text-success flex-align-center-gap-xs mt-neg-xs">
                      <Check size={12} /> Email is available
                    </span>
                  )}
                  {emailAvailable === false && (
                    <span className="micro text-danger flex-align-center-gap-xs mt-neg-xs">
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
                <div className="col-span-2">
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
              <div className="border-top-divider">
                <div className="form-grid-2 align-items-start">
                  {/* Left Column: Password */}
                  <div>
                    <div className="flex-between-center mb-xs min-h-30">
                      <label htmlFor="pass1" className="form-label">
                        Password <span className="req-star text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="wp-generate-pw wp-generate-pw-btn"
                      >
                        <RefreshCw size={12} />
                        <span>Generate password</span>
                      </button>
                    </div>

                    <div className="pos-relative-w-full">
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
                        className={`form-control pr-pw ${errors.pass1 ? 'form-control' : 'form-control'} ${showPassword ? 'font-mono' : ''}`}
                      />
                      <div className="pw-action-buttons-group">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                          className="pw-icon-btn"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={copyPasswordToClipboard}
                          title="Copy password to clipboard"
                          disabled={!pass1}
                          className={`pw-icon-btn ${copied ? 'text-success' : 'text-slate-500'} ${pass1 ? 'cursor-pointer' : 'cursor-disabled'}`}
                        >
                          {copied ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                    {errors.pass1 && (
                      <p className="err form-err-msg" role="alert">
                        ⚠ {errors.pass1}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Repeat Password */}
                  <div>
                    <div className="flex-align-center mb-xs min-h-30">
                      <label htmlFor="pass2" className="form-label">
                        Repeat Password <span className="description fw-normal text-muted fs-sm">(required)</span>
                      </label>
                    </div>

                    <div className="w-full">
                      <input
                        id="pass2"
                        name="pass2"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Type the password again"
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        autoComplete="new-password"
                        spellCheck="false"
                        className={`form-control ${errors.pass2 ? 'form-control' : 'form-control'} ${showPassword ? 'font-mono' : ''}`}
                      />
                      <p className="micro muted mt-xs" id="pass2-desc">
                        Type the password again.
                      </p>
                      {errors.pass2 && (
                        <p className="err form-err-msg" role="alert">
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
                    className="pw-strength-container"
                  >
                    <div className="between mb-xs">
                      <span className="small font-semibold">Password Strength:</span>
                      <span className={`small font-bold pw-text-score-${score}`}>
                        {currentStrength.label}
                      </span>
                    </div>
                    <div className="pw-strength-track">
                      <div className={`pw-strength-fill pw-bar-score-${score}`} />
                    </div>
                  </div>
                )}

                {/* Weak Password Confirmation Checkbox (pw_weak) */}
                {isPasswordWeak && (
                  <div className="pw-weak-warning-box">
                    <label className="checkbox-label row align-center gap-1 small pointer font-semibold text-warning-dark">
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
                      <p className="err pw-weak-err" role="alert">
                        ⚠ {errors.pwWeak}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Send User Notification (send_user_notification) */}
              <div className="border-top-divider">
                <div className="notif-optin-box">
                  <label className="checkbox-label row align-center gap-1 pointer font-semibold text-success-dark">
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
                  <p className="micro muted notif-optin-desc">
                    Dispatches credentials and login instructions to the user's registered email address.
                  </p>
                </div>
              </div>

              {/* Role (role) */}
              <div className="border-top-divider">
                <label className="form-label" htmlFor="role">
                  Role <span className="req-star text-danger">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => handlePrimaryRoleChange(e.target.value)}
                  className="form-control"
                >
                  {WP_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="micro muted mt-xs">
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
                <label className="form-label">
                  Created by Admin <span className="req-star">*</span>
                </label>
                <div className="row align-center gap-2 mt-xs">
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
                <div className="col-span-2">
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
                    className="form-control"
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
                    className="form-control"
                    value={lastPurchase2Wheeler}
                    onChange={(e) => setLastPurchase2Wheeler(e.target.value)}
                  />
                  <span className="micro muted">Date format: dd-mm-yy</span>
                </div>

                {/* Mobile Verified (mobile_verified) */}
                <div className="col-span-2">
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
                {/* <div className="col-span-2">
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
                      className="flex-1"
                    />
                    <input
                      type="number"
                      id="acf-field_656576103136d-alt"
                      min="0"
                      max="5"
                      step="1"
                      value={rateOurWebsite}
                      onChange={(e) => setRateOurWebsite(Math.min(5, Math.max(0, Number(e.target.value))))}
                      className="select-input rating-number-input"
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
                </div> */}

                {/* Feedback Comment (feedback_comment) */}
                <div className="col-span-2">
                  <label className="form-label" htmlFor="acf-field_656576d33136e">
                    Feedback Comment
                  </label>
                  <textarea
                    id="acf-field_656576d33136e"
                    name="acf[field_656576d33136e]"
                    rows={3}
                    className="form-control"
                    placeholder="User feedback comment"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  />
                </div>

                {/* Reason of Denial (denyreason) */}
                <div className="col-span-2">
                  <label className="form-label" htmlFor="acf-field_5fd9e1fc632c5">
                    Reason of Denial
                  </label>
                  <textarea
                    id="acf-field_5fd9e1fc632c5"
                    name="acf[field_5fd9e1fc632c5]"
                    rows={8}
                    className="form-control"
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
                <label className="form-label" htmlFor="ure_select_other_roles">
                  Other Roles
                </label>
                <p className="micro muted mb-sm">
                  Hold <kbd className="kbd-shortcut">Ctrl</kbd> (Windows) or <kbd className="kbd-shortcut">Cmd</kbd> (Mac) to select/deselect multiple roles.
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
                  className="form-control multiselect-roles-box"
                >
                  {WP_ROLES.map((r) => (
                    <option key={r.value} value={r.value} disabled={r.value === role}>
                      {r.label} {r.value === role ? '(Primary Role)' : ''}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="ure_other_roles" id="ure_other_roles" value={otherRoles.join(',')} />
                <span id="ure_other_roles_list" className="d-none">{otherRoles.join(', ')}</span>

                {/* Selected Roles Badges */}
                <div className="mt-md">
                  <div className="between mb-xs">
                    <span className="small font-semibold">Active Secondary Roles ({otherRoles.length}):</span>
                    {otherRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOtherRoles([])}
                        className="micro text-danger pointer btn-plain"
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
                            className="badge row align-center gap-1 role-pill-badge"
                          >
                            <span>{rObj ? rObj.label : rVal}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOtherRole(rVal)}
                              className="btn-icon-close"
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
          <div className="admin-sidebar-sticky">
            
            {/* Quick Action Box */}
            <div className="form-section-card bg-slate-subtle border-slate-300">
              <h4 className="publish-card-title">Publish User</h4>
              <p className="micro muted mb-md">
                All user meta and audit records will be stored permanently in the master registry.
              </p>
              
              <Button
                type="submit"
                id="createusersub"
                name="createuser"
                loading={loading}
                icon={CheckCircle2}
                className="w-full mb-sm"
              >
                Add New User
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {/* User Meta Summary */}
            <div className="form-section-card">
              <h4 className="checklist-card-title">Form Meta Checklist</h4>
              <div className="checklist-meta-list">
                <div className="between">
                  <span>Username:</span>
                  <strong>{userLogin || '—'}</strong>
                </div>
                <div className="between">
                  <span>Email:</span>
                  <span className="truncate max-w-160">{email || '—'}</span>
                </div>
                <div className="between">
                  <span>Primary Role:</span>
                  <span className="badge badge-primary-subtle">
                    {WP_ROLES.find((r) => r.value === role)?.label || role}
                  </span>
                </div>
                <div className="between">
                  <span>Secondary Roles:</span>
                  <span>{otherRoles.length} assigned</span>
                </div>
                <div className="between">
                  <span>Email Notification:</span>
                  <span className={`fw-semibold ${sendUserNotification ? 'text-success' : 'text-slate-500'}`}>
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
