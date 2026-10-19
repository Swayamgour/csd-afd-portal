import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { userService } from '../../services/user.service.js';
import { ShieldAlert, Check } from 'lucide-react';

export function UserStatusModal({ isOpen, onClose, user, onStatusUpdated }) {
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
      const updated = await userService.updateUserStatus(
        user.id,
        newStatus,
        reason.trim(),
        'Admin Officer K. S. Pillai'
      );
      setLoading(false);
      onStatusUpdated(updated);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to update user status');
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
      <form onSubmit={handleSubmit}>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
          <div className="between">
            <span className="small font-semibold">Current Status:</span>
            <StatusBadge status={user.status} />
          </div>
          <div className="between" style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#64748b' }}>
            <span>Previous Status Changes:</span>
            <span><strong>{user.statusChangeCount || 0}</strong> times</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
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
            className="select-input"
            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            <option value="Active">Active (Full access)</option>
            <option value="Pending">Pending (Awaiting document verification)</option>
            <option value="Suspended">Suspended (Temporarily restricted)</option>
            <option value="Denied">Denied (Application / Access rejected)</option>
            <option value="Inactive">Inactive (Decommissioned)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label font-semibold" htmlFor="status_reason">
            Reason for Status Change <span className="req-star">*</span>
          </label>
          <textarea
            id="status_reason"
            rows={3}
            required
            className="select-input"
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: error ? '1px solid #ef4444' : '1px solid #cbd5e1', fontFamily: 'inherit' }}
            placeholder="e.g. Identity verified via service depot nodal certificate / Account suspended pending enquiry..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && (
            <p className="err" role="alert" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              ⚠ {error}
            </p>
          )}
          <span className="micro muted" style={{ display: 'block', marginTop: '0.25rem' }}>
            This reason will be stamped in the permanent audit timeline along with your administrator ID.
          </span>
        </div>

        <div className="between" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
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
