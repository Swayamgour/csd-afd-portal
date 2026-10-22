import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Tabs } from '../../components/common/Tabs.jsx';
import { MASTER_ROLES, ROLE_LABELS } from '../../permissions/roles.js';
import {
  User,
  ShieldCheck,
  Calendar,
  Star,
  History,
  FileText,
  Mail,
  Phone,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export function UserDetailsModal({ isOpen, onClose, user, onEdit, onChangeStatus, onApprove, onReject }) {
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) return null;

  const roleObj = MASTER_ROLES.find((r) => r.code === user.role);
  const primaryRoleLabel = roleObj ? roleObj.label : ROLE_LABELS[user.role] || user.role;

  const tabs = [
    { id: 'profile', label: 'Identity & Profile', icon: User },
    { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
    { id: 'demands', label: 'Demands & Feedback', icon: Star },
    { id: 'history', label: `Status History (${user.statusHistory?.length || 0})`, icon: History },
    { id: 'audit', label: 'Audit Trail', icon: Clock }
  ];

  const isPending =
    user.status === 'Pending' ||
    user.verificationStatus === 'PENDING' ||
    user.adminApproval === 'PENDING';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`User File: ${user.name || user.username}`}
      subtitle={`System ID: ${user.id || user._id} · Primary Role: ${primaryRoleLabel}`}
      maxWidth="820px"
      footer={
        <div className="between w-full flex-wrap gap-sm">
          <div className="row align-center gap-1">
            <span className="small muted">Account Status:</span>
            <StatusBadge status={user.status} />
          </div>
          <div className="row align-center gap-1 flex-wrap">
            {onApprove && isPending && (
              <Button
                size="sm"
                className="portal-btn-approve-success"
                onClick={() => {
                  onClose();
                  onApprove(user);
                }}
              >
                ✓ Approve User
              </Button>
            )}
            {onReject && isPending && (
              <Button
                variant="outline"
                size="sm"
                className="portal-btn-deny-danger"
                onClick={() => {
                  onClose();
                  onReject(user);
                }}
              >
                Reject
              </Button>
            )}
            {onChangeStatus && (
              <Button
                variant="outline"
                size="sm"
                icon={History}
                onClick={() => {
                  onClose();
                  onChangeStatus(user);
                }}
              >
                Change Status
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                icon={FileText}
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
              >
                Edit Profile
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-md">
        {/* TAB 1: IDENTITY & PROFILE */}
        {activeTab === 'profile' && (
          <div className="profile-tab-content">
            <div className="user-profile-header-card row align-center gap-2 director-notice-box mb-md">
              <div className="portal-avatar-box-lg">
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="row align-center gap-1">
                  <h3 className="m-0 fs-lg">{user.name || user.username}</h3>
                  <StatusBadge status={user.status} />
                </div>
                <div className="row align-center gap-2 muted small mt-xs">
                  <span>Username: <code>{user.username}</code></span>
                  <span>•</span>
                  <span>ID: {user.id}</span>
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="detail-item-box">
                <span className="detail-label muted small">Email Address</span>
                <div className="row align-center gap-1 font-semibold mt-xs">
                  <Mail size={16} className="text-brand" />
                  <span>{user.email || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Official Mobile</span>
                <div className="row align-center gap-1 font-semibold mt-xs">
                  <Phone size={16} className="text-brand" />
                  <span>{user.mobile || user.phone || 'N/A'}</span>
                  {user.mobileVerified ? (
                    <span className="badge badge-success-subtle-sm">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="badge badge-slate-subtle-sm">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">First & Last Name</span>
                <p className="font-semibold mt-xs m-0">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : user.name || 'N/A'}
                </p>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Website</span>
                <div className="row align-center gap-1 font-semibold mt-xs">
                  <Globe size={16} className="text-muted" />
                  {user.website ? (
                    <a href={user.website} target="_blank" rel="noreferrer" className="portal-link-brand">
                      {user.website}
                    </a>
                  ) : (
                    <span className="muted">Not configured</span>
                  )}
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Password Changed Status</span>
                <p className="font-semibold mt-xs m-0">
                  {user.defaultPasswordChanged ? (
                    <span className="portal-text-success">✓ Default Password Changed</span>
                  ) : (
                    <span className="portal-text-warning">⚠ Using Initial/Default Password</span>
                  )}
                </p>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Created By Admin Mode</span>
                <p className="font-semibold mt-xs m-0">
                  {user.createdByAdmin ? 'Yes (Admin Panel Onboarding)' : 'Self Service / Storefront'}
                </p>
              </div>
            </div>

            {user.reasonOfDenial && (
              <div className="portal-denial-box">
                <span className="font-semibold portal-denial-header">
                  <AlertTriangle size={16} /> Reason of Denial:
                </span>
                <p className="portal-denial-message">
                  {user.reasonOfDenial}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROLES & RBAC */}
        {activeTab === 'roles' && (
          <div>
            <div className="director-notice-box mb-md">
              <span className="detail-label muted small block">Primary System Role</span>
              <div className="row align-center gap-1 mt-xs">
                <span className="badge badge-brand-prominent">
                  {primaryRoleLabel}
                </span>
                <span className="small muted"><code>({user.role})</code></span>
              </div>
              {roleObj?.description && (
                <p className="small muted mt-xs m-0">
                  {roleObj.description}
                </p>
              )}
            </div>

            <h4 className="portal-section-subhead">Assigned Other Roles</h4>
            <div className="row wrap gap-1">
              {user.otherRoles && user.otherRoles.length > 0 ? (
                user.otherRoles.map((rCode) => {
                  const mObj = MASTER_ROLES.find((m) => m.code === rCode);
                  return (
                    <div
                      key={rCode}
                      className="portal-role-card-item"
                    >
                      <strong>{mObj ? mObj.label : rCode}</strong>
                      {mObj?.category && (
                        <span className="micro block portal-text-info">
                          {mObj.category}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="muted small italic">No secondary roles assigned to this identity.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEMANDS & FEEDBACK */}
        {activeTab === 'demands' && (
          <div className="form-grid-2">
            <div className="detail-item-box">
              <span className="detail-label muted small">Date of Last Demand (4-Wheeler)</span>
              <p className="font-semibold mt-xs m-0">
                {user.lastDemand4Wheeler
                  ? new Date(user.lastDemand4Wheeler).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'No 4-Wheeler Demand on record'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Date of Last Demand (2-Wheeler)</span>
              <p className="font-semibold mt-xs m-0">
                {user.lastDemand2Wheeler
                  ? new Date(user.lastDemand2Wheeler).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'No 2-Wheeler Demand on record'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Website Rating Given</span>
              <div className="row align-center gap-1 mt-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={star <= (user.websiteRating || 5) ? '#f59e0b' : 'none'}
                    color={star <= (user.websiteRating || 5) ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
                <span className="small font-semibold">({user.websiteRating || 5} / 5)</span>
              </div>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Feedback Comment</span>
              <p className="mt-xs m-0 fs-sm">
                {user.feedbackComment || 'No feedback comment recorded.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: STATUS HISTORY */}
        {activeTab === 'history' && (
          <div>
            <div className="between mb-md">
              <span className="small muted">
                Total Status Changes: <strong>{user.statusChangeCount || 0}</strong>
              </span>
              <span className="small muted">
                Total Profile Edits: <strong>{user.userEditedCount || 0}</strong>
              </span>
            </div>

            {user.statusHistory && user.statusHistory.length > 0 ? (
              <div className="timeline-container">
                {user.statusHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="timeline-trail-item"
                  >
                    <div
                      className={`timeline-trail-dot ${
                        item.newStatus === 'Active'
                          ? 'dot-success'
                          : item.newStatus === 'Denied'
                          ? 'dot-danger'
                          : 'dot-warning'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="between">
                        <div>
                          <span className="font-semibold fs-sm">
                            {item.previousStatus} →{' '}
                            <span className="portal-text-brand">{item.newStatus}</span>
                          </span>
                        </div>
                        <span className="micro muted">
                          {item.changedAt ? new Date(item.changedAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <p className="small portal-text-slate my-xs">
                        Reason: {item.reason || 'No reason specified'}
                      </p>
                      <span className="micro muted">Changed By: {item.changedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted small italic">No previous status change history recorded.</p>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="form-grid-2">
            <div className="detail-item-box">
              <span className="detail-label muted small">Created By</span>
              <p className="font-semibold mt-xs m-0">
                {user.createdBy || 'System Administrator'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Created At</span>
              <p className="font-semibold mt-xs m-0">
                {user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Last Updated By</span>
              <p className="font-semibold mt-xs m-0">
                {user.updatedBy || 'System Administrator'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Last Updated At</span>
              <p className="font-semibold mt-xs m-0">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Profile Edited Count</span>
              <p className="font-semibold mt-xs m-0">
                {user.userEditedCount || 0} times
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Last Login Timestamp & IP</span>
              <p className="font-semibold mt-xs m-0">
                {user.lastLoginAt ? `${user.lastLoginAt} (${user.lastLoginIP || '10.24.8.102'})` : 'Never'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default UserDetailsModal;
