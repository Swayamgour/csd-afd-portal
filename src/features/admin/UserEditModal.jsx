import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { MASTER_ROLES } from '../../permissions/roles.js';
import { useUpdateUserMutation } from './adminApi.js';
import { User, Mail, Globe, Phone, ShieldCheck, Plus, X, Star, Check } from 'lucide-react';

export function UserEditModal({ isOpen, onClose, user, onUserUpdated }) {
  const [updateUser] = useUpdateUserMutation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [otherRoles, setOtherRoles] = useState([]);
  const [selectedOtherRoleToAdd, setSelectedOtherRoleToAdd] = useState('');
  const [lastDemand4Wheeler, setLastDemand4Wheeler] = useState('');
  const [lastDemand2Wheeler, setLastDemand2Wheeler] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [websiteRating, setWebsiteRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [defaultPasswordChanged, setDefaultPasswordChanged] = useState(true);
  const [reasonOfDenial, setReasonOfDenial] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setWebsite(user.website || '');
      setMobile(user.mobile || user.phone || '');
      setRole(user.role || 'csd_ho');
      setOtherRoles(user.otherRoles || []);
      setSelectedOtherRoleToAdd('');
      setLastDemand4Wheeler(user.lastDemand4Wheeler ? user.lastDemand4Wheeler.slice(0, 10) : '');
      setLastDemand2Wheeler(user.lastDemand2Wheeler ? user.lastDemand2Wheeler.slice(0, 10) : '');
      setMobileVerified(Boolean(user.mobileVerified));
      setWebsiteRating(user.websiteRating || 5);
      setFeedbackComment(user.feedbackComment || '');
      setDefaultPasswordChanged(Boolean(user.defaultPasswordChanged));
      setReasonOfDenial(user.reasonOfDenial || '');
      setErrors({});
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleAddOtherRole = (rCode) => {
    if (!rCode) return;
    if (rCode === role) {
      alert('This role is already assigned as the Primary Role.');
      return;
    }
    if (!otherRoles.includes(rCode)) {
      setOtherRoles([...otherRoles, rCode]);
    }
    setSelectedOtherRoleToAdd('');
  };

  const handleRemoveOtherRole = (rCode) => {
    setOtherRoles(otherRoles.filter((r) => r !== rCode));
  };

  const handlePrimaryRoleChange = (newRole) => {
    setRole(newRole);
    setOtherRoles(otherRoles.filter((r) => r !== newRole));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const updatePayload = {
        name: [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || user.name,
        email: email.trim(),
        mobile: mobile.trim(),
      };

      const updated = await updateUser({ id: user.id || user._id, ...updatePayload }).unwrap();
      setLoading(false);
      onUserUpdated(updated);
      onClose();
    } catch (err) {
      setLoading(false);
      alert(err?.data?.message || err.message || 'Failed to update user profile');
    }
  };

  const availableOtherRoles = MASTER_ROLES.filter(
    (r) => r.code !== role && !otherRoles.includes(r.code)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User: ${user.name || user.username}`}
      subtitle="Modify account information. Username and audit counts are system-managed."
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit} className="edit-user-form">
        {/* Basic info with locked username */}
        <div className="form-section-card">
          <div className="form-section-header">
            <User size={18} className="text-brand" />
            <h3 className="form-section-title">Identity & Profile</h3>
          </div>
          <div className="form-grid-2">
            <div>
              <Input
                label="Username (Immutable System ID)"
                value={user.username}
                disabled
                helperText="Username cannot be altered per enterprise audit security."
              />
            </div>
            <div>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              label="Website"
              icon={Globe}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Input
              label="Mobile Number"
              icon={Phone}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
        </div>

        {/* Roles management */}
        <div className="form-section-card">
          <div className="form-section-header">
            <ShieldCheck size={18} className="text-brand" />
            <h3 className="form-section-title">Roles & Governance</h3>
          </div>
          <div>
            <label className="form-label">Primary Portal Role</label>
            <select
              value={role}
              onChange={(e) => handlePrimaryRoleChange(e.target.value)}
              className="form-control"
            >
              {MASTER_ROLES.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label} ({r.category})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-md pt-sm border-t">
            <label className="form-label">Other Secondary Roles</label>
            <div className="row align-center gap-1 mb-sm">
              <select
                value={selectedOtherRoleToAdd}
                onChange={(e) => setSelectedOtherRoleToAdd(e.target.value)}
                className="form-control flex-1"
              >
                <option value="">-- Add another role --</option>
                {availableOtherRoles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
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
                Add
              </Button>
            </div>

            <div className="row wrap gap-1">
              {otherRoles.map((rCode) => {
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
                    >
                      <X size={13} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Data fields */}
        <div className="form-section-card">
          <div className="form-grid-2">
            <div>
              <label className="form-label">Date of Last Demand (4-Wheeler)</label>
              <input
                type="date"
                className="form-control"
                value={lastDemand4Wheeler}
                onChange={(e) => setLastDemand4Wheeler(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Date of Last Demand (2-Wheeler)</label>
              <input
                type="date"
                className="form-control"
                value={lastDemand2Wheeler}
                onChange={(e) => setLastDemand2Wheeler(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-sm">
            <label className="checkbox-label row align-center gap-1 small pointer">
              <input
                type="checkbox"
                checked={mobileVerified}
                onChange={(e) => setMobileVerified(e.target.checked)}
              />
              <span>Mobile Verified (DigiLocker/Aadhaar verified phone number)</span>
            </label>
          </div>

          <div className="form-grid-2 mt-sm">
            <div>
              <label className="form-label">Website Rating</label>
              <div className="row align-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWebsiteRating(star)}
                    className={`star-rating-btn ${star <= websiteRating ? 'is-active' : ''}`}
                  >
                    <Star size={20} fill={star <= websiteRating ? '#f59e0b' : 'none'} />
                  </button>
                ))}
                <span className="small font-semibold">({websiteRating}/5)</span>
              </div>
            </div>

            <div>
              <label className="form-label">Feedback Remarks</label>
              <textarea
                rows={2}
                className="form-control"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-sm">
            <label className="form-label">Reason of Denial (If applicable)</label>
            <textarea
              rows={2}
              className="form-control"
              value={reasonOfDenial}
              onChange={(e) => setReasonOfDenial(e.target.value)}
            />
          </div>
        </div>

        <div className="between mt-md pt-sm border-t">
          <span className="micro muted">
            Saving changes will automatically increment <code>userEditedCount</code> (currently {user.userEditedCount || 0}).
          </span>
          <div className="row align-center gap-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={Check}>
              Save Profile Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default UserEditModal;
