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

export function UserDetailsModal({ isOpen, onClose, user, onEdit, onChangeStatus }) {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`User File: ${user.name || user.username}`}
      subtitle={`System ID: ${user.id} · Primary Role: ${primaryRoleLabel}`}
      maxWidth="820px"
      footer={
        <div className="between" style={{ width: '100%' }}>
          <div className="row align-center gap-1">
            <span className="small muted">Account Status:</span>
            <StatusBadge status={user.status} />
          </div>
          <div className="row align-center gap-1">
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
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: '1.25rem' }}>
        {/* TAB 1: IDENTITY & PROFILE */}
        {activeTab === 'profile' && (
          <div className="profile-tab-content">
            <div className="user-profile-header-card row align-center gap-2" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: 'var(--brand, #1e4fd8)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 700
                }}
              >
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="row align-center gap-1">
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name || user.username}</h3>
                  <StatusBadge status={user.status} />
                </div>
                <div className="row align-center gap-2 muted small" style={{ marginTop: '0.25rem' }}>
                  <span>Username: <code>{user.username}</code></span>
                  <span>•</span>
                  <span>ID: {user.id}</span>
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="detail-item-box">
                <span className="detail-label muted small">Email Address</span>
                <div className="row align-center gap-1 font-semibold" style={{ marginTop: '0.2rem' }}>
                  <Mail size={16} className="text-brand" />
                  <span>{user.email || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Official Mobile</span>
                <div className="row align-center gap-1 font-semibold" style={{ marginTop: '0.2rem' }}>
                  <Phone size={16} className="text-brand" />
                  <span>{user.mobile || user.phone || 'N/A'}</span>
                  {user.mobileVerified ? (
                    <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem' }}>
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.7rem' }}>
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">First & Last Name</span>
                <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                  {user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : user.name || 'N/A'}
                </p>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Website</span>
                <div className="row align-center gap-1 font-semibold" style={{ marginTop: '0.2rem' }}>
                  <Globe size={16} className="text-muted" />
                  {user.website ? (
                    <a href={user.website} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>
                      {user.website}
                    </a>
                  ) : (
                    <span className="muted">Not configured</span>
                  )}
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Password Changed Status</span>
                <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                  {user.defaultPasswordChanged ? (
                    <span style={{ color: '#166534' }}>✓ Default Password Changed</span>
                  ) : (
                    <span style={{ color: '#b45309' }}>⚠ Using Initial/Default Password</span>
                  )}
                </p>
              </div>

              <div className="detail-item-box">
                <span className="detail-label muted small">Created By Admin Mode</span>
                <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                  {user.createdByAdmin ? 'Yes (Admin Panel Onboarding)' : 'Self Service / Storefront'}
                </p>
              </div>
            </div>

            {user.reasonOfDenial && (
              <div style={{ marginTop: '1rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem', borderRadius: '8px' }}>
                <span className="font-semibold" style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={16} /> Reason of Denial:
                </span>
                <p style={{ color: '#7f1d1d', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                  {user.reasonOfDenial}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROLES & RBAC */}
        {activeTab === 'roles' && (
          <div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <span className="detail-label muted small block">Primary System Role</span>
              <div className="row align-center gap-1" style={{ marginTop: '0.35rem' }}>
                <span className="badge" style={{ background: 'var(--brand)', color: '#ffffff', fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}>
                  {primaryRoleLabel}
                </span>
                <span className="small muted"><code>({user.role})</code></span>
              </div>
              {roleObj?.description && (
                <p className="small muted" style={{ marginTop: '0.4rem', margin: 0 }}>
                  {roleObj.description}
                </p>
              )}
            </div>

            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.65rem' }}>Assigned Other Roles</h4>
            <div className="row wrap gap-1">
              {user.otherRoles && user.otherRoles.length > 0 ? (
                user.otherRoles.map((rCode) => {
                  const mObj = MASTER_ROLES.find((m) => m.code === rCode);
                  return (
                    <div
                      key={rCode}
                      style={{
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        color: '#0369a1',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <strong>{mObj ? mObj.label : rCode}</strong>
                      {mObj?.category && (
                        <span className="micro block" style={{ color: '#0284c7' }}>
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
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
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
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
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
              <div className="row align-center gap-1" style={{ marginTop: '0.2rem' }}>
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
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem' }}>
                {user.feedbackComment || 'No feedback comment recorded.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: STATUS HISTORY */}
        {activeTab === 'history' && (
          <div>
            <div className="between" style={{ marginBottom: '1rem' }}>
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
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      paddingBottom: '1rem',
                      borderLeft: '2px solid #e2e8f0',
                      paddingLeft: '1rem',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '-6px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: item.newStatus === 'Active' ? '#10b981' : item.newStatus === 'Denied' ? '#ef4444' : '#f59e0b'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="between">
                        <div>
                          <span className="font-semibold" style={{ fontSize: '0.9rem' }}>
                            {item.previousStatus} →{' '}
                            <span style={{ color: 'var(--brand)' }}>{item.newStatus}</span>
                          </span>
                        </div>
                        <span className="micro muted">
                          {item.changedAt ? new Date(item.changedAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <p className="small" style={{ margin: '0.25rem 0', color: '#475569' }}>
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
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                {user.createdBy || 'System Administrator'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Created At</span>
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Last Updated By</span>
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                {user.updatedBy || 'System Administrator'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Last Updated At</span>
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                {user.updatedAt ? new Date(user.updatedAt).toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Profile Edited Count</span>
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
                {user.userEditedCount || 0} times
              </p>
            </div>

            <div className="detail-item-box">
              <span className="detail-label muted small">Last Login Timestamp & IP</span>
              <p className="font-semibold" style={{ margin: '0.2rem 0 0' }}>
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
