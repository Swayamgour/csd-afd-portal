import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { useUpdateUserStatusMutation } from './adminApi.js';
import { ShieldAlert, Check } from 'lucide-react';

export function UserStatusModal({ isOpen, onClose, user, onStatusUpdated }) {
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [newStatus, setNewStatus] = useState(user?.status || 'Active');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newStatus === user.status) {
      setError('Please select a different status');
      return;
    }
    if (!reason.trim()) {
      setError('A justification / reason is mandatory for changing account status');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const dbStatus = newStatus === 'Active' ? 'ACTIVE' : (newStatus === 'Denied' || newStatus === 'Suspended' ? 'LOCKED' : newStatus);
      const updated = await updateUserStatus({
        id: user.id || user._id,
        status: dbStatus
      }).unwrap();
      setLoading(false);
      onStatusUpdated({ ...user, status: newStatus });
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err?.data?.message || err.message || 'Failed to update user status');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Account Security Status"
      subtitle={`User: ${user.name || user.username} (${user.id})`}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} className="director-modal-form">
        <div className="director-notice-box mb-md">
          <div className="between">
            <span className="small font-semibold">Current Status:</span>
            <StatusBadge status={user.status} />
          </div>
          <div className="between mt-xs small text-muted">
            <span>Previous Status Changes:</span>
            <span><strong>{user.statusChangeCount || 0}</strong> times</span>
          </div>
        </div>

        <div className="mb-md">
          <label className="form-label font-semibold" htmlFor="new_status_select">
            New Account Status <span className="req-star">*</span>
          </label>
          <select
            id="new_status_select"
            value={newStatus}
            onChange={(e) => {
              setNewStatus(e.target.value);
              setError('');
            }}
            className="director-field-input"
          >
            <option value="Active">Active (Full access)</option>
            <option value="Pending">Pending (Awaiting document verification)</option>
            <option value="Suspended">Suspended (Temporarily restricted)</option>
            <option value="Denied">Denied (Application / Access rejected)</option>
            <option value="Inactive">Inactive (Decommissioned)</option>
          </select>
        </div>

        <div className="mb-md">
          <label className="form-label font-semibold" htmlFor="status_reason">
            Reason for Status Change <span className="req-star">*</span>
          </label>
          <textarea
            id="status_reason"
            rows={3}
            required
            className={`director-field-input ${error ? 'input-error' : ''}`}
            placeholder="e.g. Identity verified via service depot nodal certificate / Account suspended pending enquiry..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && (
            <p className="err director-alert-error" role="alert">
              ⚠ {error}
            </p>
          )}
          <span className="micro muted d-block mt-xs">
            This reason will be stamped in the permanent audit timeline along with your administrator ID.
          </span>
        </div>

        <div className="director-modal-actions mt-md pt-sm border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Check}>
            Apply Status & Stamp Audit
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UserStatusModal;
