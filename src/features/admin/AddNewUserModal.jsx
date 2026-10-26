import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { MASTER_ROLES } from '../../permissions/roles.js';
import { userService, calculatePasswordScore } from '../../services/user.service.js';
import {
  User,
  Mail,
  Lock,
  Globe,
  Phone,
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
  Plus
} from 'lucide-react';

export function AddNewUserModal({ isOpen, onClose, onUserCreated }) {
  // 1. Basic User Information
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [website, setWebsite] = useState('');
  const [mobile, setMobile] = useState('');

  // 2. Password Security
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // 3. User Notification
  const [sendNotification, setSendNotification] = useState(true);

  // 4. Role Selection
  const [role, setRole] = useState('csd_ho');
  const [otherRoles, setOtherRoles] = useState([]);
  const [selectedOtherRoleToAdd, setSelectedOtherRoleToAdd] = useState('');

  // 5. User Data & WordPress Migrated Metadata
  const [defaultPasswordChanged, setDefaultPasswordChanged] = useState(false);
  const [reasonOfDenial, setReasonOfDenial] = useState('');
  const [lastDemand4Wheeler, setLastDemand4Wheeler] = useState('');
  const [lastDemand2Wheeler, setLastDemand2Wheeler] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [websiteRating, setWebsiteRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // 6. Account Status & Admin Creation
  const [status, setStatus] = useState('Active');
  const [createdByAdmin] = useState(true);

  // UI & Validation States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setWebsite('');
    setMobile('');
    setPassword('');
    setShowPassword(false);
    setCopied(false);
    setSendNotification(true);
    setRole('csd_ho');
    setOtherRoles([]);
    setSelectedOtherRoleToAdd('');
    setDefaultPasswordChanged(false);
    setReasonOfDenial('');
    setLastDemand4Wheeler('');
    setLastDemand2Wheeler('');
    setMobileVerified(false);
    setWebsiteRating(5);
    setFeedbackComment('');
    setStatus('Active');
    setErrors({});
    setUsernameAvailable(null);
    setEmailAvailable(null);
  };

  // Generate cryptographically secure password
  const generatePassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*-_=+';
    const all = uppers + lowers + numbers + symbols;

    let pwd = '';
    // Ensure at least one of each character class
    pwd += uppers[Math.floor(Math.random() * uppers.length)];
    pwd += lowers[Math.floor(Math.random() * lowers.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 14; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle characters
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(pwd);
    setShowPassword(true);

    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

  const copyPasswordToClipboard = () => {
    if (!password) return;
    navigator.clipboard?.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Debounced Username Duplicate Check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const exists = await userService.checkUsernameExists(username.trim());
      setUsernameAvailable(!exists);
      setCheckingUsername(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [username]);

  // Debounced Email Duplicate Check
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

  // Add Other Role (prevent duplicates and primary role)
  const handleAddOtherRole = (roleCode) => {
    if (!roleCode) return;
    if (roleCode === role) {
      alert('This role is already selected as the Primary Role.');
      return;
    }
    if (!otherRoles.includes(roleCode)) {
      setOtherRoles([...otherRoles, roleCode]);
    }
    setSelectedOtherRoleToAdd('');
  };

  const handleRemoveOtherRole = (roleCode) => {
    setOtherRoles(otherRoles.filter((r) => r !== roleCode));
  };

  // Switch primary role: remove new primary role from otherRoles if present
  const handlePrimaryRoleChange = (newRole) => {
    setRole(newRole);
    setOtherRoles(otherRoles.filter((r) => r !== newRole));
  };

  // Password Strength Calculation
  const score = calculatePasswordScore(password);
  const strengthLevels = [
    { label: 'Very Weak', color: '#ef4444', width: '20%' },
    { label: 'Weak', color: '#f97316', width: '40%' },
    { label: 'Fair', color: '#eab308', width: '60%' },
    { label: 'Good', color: '#3b82f6', width: '80%' },
    { label: 'Strong', color: '#10b981', width: '100%' }
  ];
  const currentStrength = strengthLevels[score] || strengthLevels[0];

  // Validation before submit
  const validateForm = () => {
    const errs = {};
    if (!username.trim()) {
      errs.username = 'Username is required';
    } else if (username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    } else if (usernameAvailable === false) {
      errs.username = 'Username already exists';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address';
    } else if (emailAvailable === false) {
      errs.email = 'Email already exists';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (!role) {
      errs.role = 'Primary role must be assigned';
    }

    if (status === 'Denied' && !reasonOfDenial.trim()) {
      errs.reasonOfDenial = 'Please specify the Reason of Denial for rejected accounts';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        website: website.trim(),
        mobile: mobile.trim(),
        password,
        role,
        otherRoles,
        sendNotification,
        createdByAdmin: true,
        defaultPasswordChanged,
        reasonOfDenial: reasonOfDenial.trim(),
        status,
        lastDemand4Wheeler: lastDemand4Wheeler || null,
        lastDemand2Wheeler: lastDemand2Wheeler || null,
        mobileVerified,
        websiteRating,
        feedbackComment: feedbackComment.trim()
      };

      const createdUser = await userService.createUser(payload);
      setLoading(false);
      onUserCreated(createdUser);
      onClose();
    } catch (err) {
      setLoading(false);
      alert(err.message || 'Failed to create user account');
    }
  };

  // Group master roles for organized dropdown
  const groupedRoles = MASTER_ROLES.reduce((acc, curr) => {
    const cat = curr.category || 'Other Roles';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const availableOtherRoles = MASTER_ROLES.filter(
    (r) => r.code !== role && !otherRoles.includes(r.code)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User (WordPress Migration)"
      subtitle="Complete user creation screen with all WordPress/WooCommerce enterprise fields, security checks & audit tracking."
      maxWidth="860px"
    >
      <form onSubmit={handleSubmit} className="add-user-modal-form">
        {/* SECTION A: BASIC USER INFORMATION */}
        <div className="form-section-card">
          <div className="form-section-header">
            <User size={18} className="text-brand" />
            <h3 className="form-section-title">1. Basic User Information</h3>
          </div>
          <div className="form-grid-2">
            <div>
              <Input
                id="user_username"
                label="Username"
                required
                placeholder="e.g. jc_765432x / amit_sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={errors.username}
                helperText="Required. Used for authentication across all portal sub-systems."
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

            <div>
              <Input
                id="user_email"
                type="email"
                label="Email Address"
                required
                placeholder="officer.name@nic.in / user@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                helperText="Required. Official credentials and alerts will be dispatched here."
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

            <Input
              id="user_firstname"
              label="First Name"
              placeholder="e.g. Rajesh"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <Input
              id="user_lastname"
              label="Last Name"
              placeholder="e.g. Kumar"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <Input
              id="user_website"
              label="Website"
              placeholder="https://mod.gov.in"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              icon={Globe}
            />

            <Input
              id="user_mobile"
              label="Mobile Number"
              placeholder="+91 98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              icon={Phone}
              helperText="For two-factor OTP authentication and dispatch notifications."
            />
          </div>
        </div>

        {/* SECTION B: PASSWORD & SECURITY */}
        <div className="form-section-card">
          <div className="form-section-header between">
            <div className="row align-center gap-1">
              <Lock size={18} className="text-brand" />
              <h3 className="form-section-title">2. Password Security & Generation</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={generatePassword}
            >
              Generate Password
            </Button>
          </div>

          <div className="password-input-row portal-flex-align-start-gap-sm">
            <div className="flex-1">
              <Input
                id="user_password"
                type={showPassword ? 'text' : 'password'}
                label="Account Password"
                required
                placeholder="Enter or generate strong passphrase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
            </div>
            <div className="portal-password-tools">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyPasswordToClipboard}
                title="Copy password to clipboard"
                disabled={!password}
              >
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="password-meter-box director-notice-box mt-sm">
              <div className="between mb-xs">
                <span className="small font-semibold">Password Strength:</span>
                <span className={`small font-bold ${currentStrength.score >= 4 ? 'portal-text-success' : currentStrength.score >= 2 ? 'portal-text-warning' : 'portal-text-danger'}`}>
                  {currentStrength.label}
                </span>
              </div>
              <div className="strength-bar-bg">
                <div
                  className={`strength-bar-fill ${currentStrength.score >= 4 ? 'bg-success' : currentStrength.score >= 2 ? 'bg-warning' : 'bg-danger'}`}
                />
              </div>
              <div className="row wrap gap-2 strength-rules-row">
                <span className={password.length >= 8 ? 'rule-met' : 'rule-unmet'}>
                  ✓ Min 8 chars
                </span>
                <span className={/[A-Z]/.test(password) ? 'rule-met' : 'rule-unmet'}>
                  ✓ Uppercase
                </span>
                <span className={/[a-z]/.test(password) ? 'rule-met' : 'rule-unmet'}>
                  ✓ Lowercase
                </span>
                <span className={/[0-9]/.test(password) ? 'rule-met' : 'rule-unmet'}>
                  ✓ Number
                </span>
                <span className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'rule-met' : 'rule-unmet'}>
                  ✓ Special Symbol
                </span>
              </div>
            </div>
          )}

          <div className="mt-sm">
            <label className="checkbox-label row align-center gap-1 small pointer">
              <input
                type="checkbox"
                checked={defaultPasswordChanged}
                onChange={(e) => setDefaultPasswordChanged(e.target.checked)}
              />
              <span>
                <strong>Default Password Changed:</strong> Mark whether user has already changed their initial password.
              </span>
            </label>
          </div>
        </div>

        {/* SECTION C: USER NOTIFICATION */}
        <div className="form-section-card portal-notify-card">
          <div className="form-section-header">
            <Bell size={18} className="text-success" />
            <h3 className="form-section-title portal-notify-title">3. User Notification</h3>
          </div>
          <label className="checkbox-label row align-center gap-1 pointer mt-xs">
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
            />
            <span className="portal-notify-text">
              Send the new user an email about their account.
            </span>
          </label>
          <p className="micro muted portal-notify-subtext">
            When checked, an official email will be generated containing portal login instructions and account security credentials.
          </p>
        </div>

        {/* SECTION D: ROLE & OTHER ROLES */}
        <div className="form-section-card">
          <div className="form-section-header">
            <ShieldCheck size={18} className="text-brand" />
            <h3 className="form-section-title">4. Role Assignment & Multiple Permissions</h3>
          </div>
          <div className="form-grid-2">
            <div>
              <label className="form-label" htmlFor="primary_role_select">
                Primary Portal Role <span className="req-star">*</span>
              </label>
              <select
                id="primary_role_select"
                value={role}
                onChange={(e) => handlePrimaryRoleChange(e.target.value)}
                className="form-control"
              >
                {Object.entries(groupedRoles).map(([category, items]) => (
                  <optgroup key={category} label={category}>
                    {items.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="micro muted mt-xs">
                Defines primary dashboard routing and root permission boundary.
              </p>
            </div>

            <div>
              <label className="form-label">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-control"
              >
                <option value="Active">Active (Full access)</option>
                <option value="Pending">Pending (Awaiting document verification)</option>
                <option value="Suspended">Suspended (Temporarily restricted)</option>
                <option value="Denied">Denied (Application / Access rejected)</option>
                <option value="Inactive">Inactive (Decommissioned)</option>
              </select>
              <p className="micro muted mt-xs">
                All status changes are permanently logged in audit history.
              </p>
            </div>
          </div>

          {/* Other Roles (Multi-select dropdown) */}
          <div className="mt-md pt-sm border-t">
            <label className="form-label">
              Other Roles (Multiple Secondary Roles)
            </label>
            <p className="micro muted mb-xs">
              Assign secondary administrative roles to the same user without duplicating the Primary Role.
            </p>

            <div className="row align-center gap-1 mb-sm">
              <select
                value={selectedOtherRoleToAdd}
                onChange={(e) => setSelectedOtherRoleToAdd(e.target.value)}
                className="form-control flex-1"
              >
                <option value="">-- Choose additional role to add --</option>
                {availableOtherRoles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label} ({r.category})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                disabled={!selectedOtherRoleToAdd}
                onClick={() => handleAddOtherRole(selectedOtherRoleToAdd)}
              >
                Add Role
              </Button>
            </div>

            {/* Selected Other Roles Pills */}
            <div className="row wrap gap-1">
              {otherRoles.length === 0 ? (
                <span className="micro muted italic">No secondary roles assigned.</span>
              ) : (
                otherRoles.map((rCode) => {
                  const rObj = MASTER_ROLES.find((m) => m.code === rCode);
                  return (
                    <span
                      key={rCode}
                      className="badge badge-role-tag row align-center gap-1"
                    >
                      <span>{rObj ? rObj.label : rCode}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherRole(rCode)}
                        className="portal-btn-icon-plain"
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

        {/* SECTION E: USER DATA (WORDPRESS SPECIFIC FIELDS) */}
        <div className="form-section-card">
          <div className="form-section-header">
            <FileText size={18} className="text-brand" />
            <h3 className="form-section-title">5. User Data & WordPress Extended Attributes</h3>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label" htmlFor="lastDemand4W">
                Date of Last Demand of 4 Wheeler
              </label>
              <input
                id="lastDemand4W"
                type="date"
                className="form-control"
                value={lastDemand4Wheeler}
                onChange={(e) => setLastDemand4Wheeler(e.target.value)}
              />
              <span className="micro muted">For quota cooldown & eligibility verification.</span>
            </div>

            <div>
              <label className="form-label" htmlFor="lastDemand2W">
                Date of Last Demand of 2 Wheeler
              </label>
              <input
                id="lastDemand2W"
                type="date"
                className="form-control"
                value={lastDemand2Wheeler}
                onChange={(e) => setLastDemand2Wheeler(e.target.value)}
              />
              <span className="micro muted">For two-wheeler allotment quota tracking.</span>
            </div>
          </div>

          <div className="mt-md">
            <label className="checkbox-label row align-center gap-1 small pointer">
              <input
                type="checkbox"
                checked={mobileVerified}
                onChange={(e) => setMobileVerified(e.target.checked)}
              />
              <span>
                <strong>Mobile Verified:</strong> Check if beneficiary/official mobile number is Aadhaar/DigiLocker verified.
              </span>
            </label>
          </div>

          <div className="form-grid-2 mt-md">
            <div>
              <label className="form-label">
                Rate Our Website (1 to 5 Stars)
              </label>
              <div className="row align-center gap-1 mt-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWebsiteRating(star)}
                    className={`star-rating-btn ${star <= websiteRating ? 'is-active' : ''}`}
                    title={`Rate ${star} star`}
                  >
                    <Star size={24} fill={star <= websiteRating ? '#f59e0b' : 'none'} />
                  </button>
                ))}
                <span className="small font-semibold muted ml-sm">
                  ({websiteRating} / 5 Stars)
                </span>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="feedbackComment">
                Feedback Comment
              </label>
              <textarea
                id="feedbackComment"
                rows={2}
                className="form-control"
                placeholder="Beneficiary feedback or onboarding remarks..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>
          </div>

          {/* Reason of Denial (Especially for Denied status) */}
          <div className="mt-md">
            <label className="form-label" htmlFor="reasonOfDenial">
              Reason of Denial {status === 'Denied' && <span className="req-star">*</span>}
            </label>
            <textarea
              id="reasonOfDenial"
              rows={2}
              className={`form-control ${errors.reasonOfDenial ? 'input-error' : ''}`}
              placeholder="Mandatory reason if account or application is rejected/denied..."
              value={reasonOfDenial}
              onChange={(e) => setReasonOfDenial(e.target.value)}
            />
            {errors.reasonOfDenial && (
              <p className="err director-alert-error" role="alert">
                ⚠ {errors.reasonOfDenial}
              </p>
            )}
          </div>
        </div>

        {/* SECTION F: ADMIN & AUDIT INFORMATION */}
        <div className="form-section-card director-notice-box">
          <div className="form-section-header">
            <Calendar size={18} className="text-brand" />
            <h3 className="form-section-title">6. Audit & System Creation Metadata</h3>
          </div>
          <div className="row wrap gap-3 small text-muted">
            <div>
              <strong>Created By Admin:</strong>{' '}
              <span className="badge badge-success-subtle-sm font-semibold">
                Yes (Automatically Stamped)
              </span>
            </div>
            <div>
              <strong>Audit Actor:</strong> Admin Officer K. S. Pillai
            </div>
            <div>
              <strong>Initial Status Count:</strong> 0
            </div>
            <div>
              <strong>Initial Edit Count:</strong> 0
            </div>
            <div>
              <strong>Timestamp:</strong> {new Date().toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* FORM ACTION FOOTER */}
        <div className="director-modal-actions mt-md pt-sm border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <div className="row align-center gap-1">
            <Button type="button" variant="ghost" onClick={resetForm} disabled={loading}>
              Reset Form
            </Button>
            <Button type="submit" loading={loading} icon={Check}>
              Add User & Dispatch Account
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddNewUserModal;
