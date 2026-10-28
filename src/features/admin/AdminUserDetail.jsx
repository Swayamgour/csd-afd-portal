import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  AlertTriangle,
  ArrowLeft,
  Edit2,
  Lock,
  Unlock,
  Building,
  CreditCard,
  Award
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Tabs } from '../../components/common/Tabs.jsx';
import { LoadingState, ErrorState } from '../../components/common/States.jsx';
import { MASTER_ROLES, ROLE_LABELS } from '../../permissions/roles.js';
import {
  useGetUserByIdQuery,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useApproveUserMutation,
  useRejectUserMutation,
} from './adminApi.js';

export function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDirector = location.pathname.startsWith('/director');

  const [activeTab, setActiveTab] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('Service records mismatch with Armed Forces database');
  const [rejectCustomRemarks, setRejectCustomRemarks] = useState('');

  // Primary fetch by ID
  const { data: rawUser, isLoading, error, refetch } = useGetUserByIdQuery(id);
  // Fallback search across list if single endpoint formats differently
  const { data: rawList = [] } = useGetUsersQuery({}, { skip: Boolean(rawUser) });

  const [updateUserStatus, { isLoading: isStatusLoading }] = useUpdateUserStatusMutation();
  const [approveUser, { isLoading: isApproveLoading }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejectLoading }] = useRejectUserMutation();

  const user = React.useMemo(() => {
    if (rawUser?.data) return rawUser.data;
    if (rawUser?._id || rawUser?.id) return rawUser;
    const list = Array.isArray(rawList) ? rawList : (rawList?.items || []);
    return list.find((u) => String(u._id || u.id) === String(id)) || null;
  }, [rawUser, rawList, id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const currentStatus = user.status || 'Active';
    const nextStatus = currentStatus === 'Active' || currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      await updateUserStatus({ id: user.id || user._id, status: nextStatus }).unwrap();
      showToast(`✓ Account status changed to ${nextStatus === 'ACTIVE' ? 'Active' : 'Suspended'}.`);
      refetch();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to update status');
    }
  };

  const handleApprove = async () => {
    if (!user) return;
    try {
      await approveUser({ id: user.id || user._id, remarks: 'Verified and approved by CS Director / Administrator' }).unwrap();
      showToast(`✓ Beneficiary account "${user.name || user.username}" approved successfully!`);
      refetch();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to approve user');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!user) return;
    const finalRemarks = rejectCustomRemarks.trim()
      ? `${rejectReason}: ${rejectCustomRemarks.trim()}`
      : rejectReason;
    try {
      await rejectUser({ id: user.id || user._id, remarks: finalRemarks }).unwrap();
      showToast(`Application for "${user.name || user.username}" was REJECTED.`);
      setShowRejectForm(false);
      refetch();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to reject user');
    }
  };

  if (isLoading) {
    return <LoadingState text="Loading official user file..." />;
  }

  if (!user && !isLoading) {
    return (
      <div className="page-container">
        <ErrorState
          title="User Account Not Found"
          message={`Unable to find user file with ID: ${id}`}
          action={
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate(isDirector ? '/director/approvals' : '/admin/users')}
            >
              Back to Users List
            </Button>
          }
        />
      </div>
    );
  }

  const roleObj = MASTER_ROLES.find((r) => r.code === user.role);
  const primaryRoleLabel = roleObj ? roleObj.label : ROLE_LABELS[user.role] || user.role;
  const beneficiary = user.beneficiary || {};
  const isPending =
    user.status === 'Pending' ||
    user.verificationStatus === 'PENDING' ||
    user.adminApproval === 'PENDING';
  const isSuspended = user.status === 'Suspended' || user.status === 'LOCKED' || user.status === 'Denied';

  const tabs = [
    { id: 'profile', label: 'Identity & Profile', icon: User },
    { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
    { id: 'demands', label: 'Demands & Feedback', icon: Star },
    { id: 'history', label: `Status History (${user.statusHistory?.length || 0})`, icon: History },
    { id: 'audit', label: 'Audit Trail', icon: Clock },
  ];

  const backUrl = isDirector ? '/director/approvals' : '/admin/users';
  const editUrl = isDirector ? `/director/users/${id}/edit` : `/admin/users/${id}/edit`;

  return (
    <div className="page-container">
      <PageHeader
        title={user.name || user.username}
        subtitle={`System ID: ${user.id || user._id} · Primary Role: ${primaryRoleLabel}`}
        breadcrumbs={[
          { label: isDirector ? 'Director Approvals' : 'System Admin', href: backUrl },
          { label: 'User Directory', href: backUrl },
          { label: user.name || user.username },
        ]}
        actions={
          <div className="flex-gap-sm flex-wrap">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate(backUrl)}
            >
              Back
            </Button>
            <Button
              icon={Edit2}
              onClick={() => navigate(editUrl)}
            >
              Edit Profile
            </Button>
            <Button
              variant={isSuspended ? 'success' : 'danger'}
              icon={isSuspended ? Unlock : Lock}
              loading={isStatusLoading}
              onClick={handleToggleStatus}
            >
              {isSuspended ? 'Unlock Account' : 'Lock Account'}
            </Button>
            {isPending && (
              <>
                <Button
                  variant="success"
                  icon={CheckCircle}
                  loading={isApproveLoading}
                  onClick={handleApprove}
                >
                  Approve Registration
                </Button>
                <Button
                  variant="danger"
                  icon={XCircle}
                  onClick={() => setShowRejectForm(!showRejectForm)}
                >
                  {showRejectForm ? 'Cancel Rejection' : 'Reject Application'}
                </Button>
              </>
            )}
          </div>
        }
      />

      {toastMessage && (
        <div className="alert alert-success row align-center gap-1 mb-2">
          <CheckCircle size={18} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Inline Rejection Panel */}
      {showRejectForm && (
        <div className="card mb-2" style={{ borderColor: '#fca5a5', background: '#fff5f5' }}>
          <div className="card-header" style={{ background: '#fef2f2', borderBottomColor: '#fecaca' }}>
            <h3 className="card-title text-danger row align-center gap-1">
              <AlertTriangle size={18} />
              Reject Beneficiary Application
            </h3>
          </div>
          <form onSubmit={handleConfirmReject} className="card-body">
            <p className="muted small mb-1">
              Select standard rejection rationale or provide custom remarks. Rejection notification will be dispatched to the applicant.
            </p>
            <div className="form-group">
              <label className="form-label">Primary Rejection Reason</label>
              <select
                className="form-select"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              >
                <option value="Service records mismatch with Armed Forces database">Service records mismatch with Armed Forces database</option>
                <option value="Canteen Smart Card grocery ID invalid or expired">Canteen Smart Card grocery ID invalid or expired</option>
                <option value="PAN / PPO credentials non-verifiable">PAN / PPO credentials non-verifiable</option>
                <option value="Discharge book / service book document unreadable">Discharge book / service book document unreadable</option>
                <option value="Eligibility quota exceeded according to pay level">Eligibility quota exceeded according to pay level</option>
                <option value="Other administrative discrepancy">Other administrative discrepancy</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Specific Administrative Remarks</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Enter details visible to the applicant explaining why application was rejected..."
                value={rejectCustomRemarks}
                onChange={(e) => setRejectCustomRemarks(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => setShowRejectForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" loading={isRejectLoading}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Status Bar Card */}
      <div className="card mb-2">
        <div className="card-body p-2 row between align-center flex-wrap gap-1">
          <div className="row align-center gap-1">
            <div className="user-avatar-circle-sm" style={{ width: 44, height: 44, fontSize: '1.2rem' }}>
              {(user.name || user.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="fw-bold fs-md color-ink">{user.name || user.username}</div>
              <div className="muted fs-xs">
                <code>{user.username}</code> · {user.email || 'No email registered'} · {user.mobile || user.phone || 'No phone registered'}
              </div>
            </div>
          </div>
          <div className="row align-center gap-1 flex-wrap">
            <span className="muted fs-xs">Account Status:</span>
            <StatusBadge status={user.status || 'Active'} />
            <span className="muted fs-xs ml-1">Verification:</span>
            <span className={`badge ${user.verificationStatus === 'APPROVED' || user.verificationStatus === 'VERIFIED' ? 'badge-success' : user.verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
              {user.verificationStatus || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-1">
        {/* TAB 1: IDENTITY & PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid-2-col gap-1">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Identity & Account Credentials</h3>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div>
                    <label className="form-label text-muted">Full Name</label>
                    <div className="fw-semibold">{user.name || user.firstName || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Username</label>
                    <div className="font-mono">{user.username}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Primary Email</label>
                    <div>{user.email || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Mobile Number</label>
                    <div>{user.mobile || user.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Email Verified (OTP)</label>
                    <div>
                      {user.isEmailVerified ? (
                        <span className="badge badge-success">✓ Verified</span>
                      ) : (
                        <span className="badge badge-warning">Unverified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Default Password Changed</label>
                    <div>
                      {user.defaultPasswordChanged ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-danger">Pending Reset</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Military & Beneficiary Service Records */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Armed Forces & Canteen Entitlement</h3>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div>
                    <label className="form-label text-muted">Service Number</label>
                    <div className="font-mono fw-bold">{beneficiary.serviceNumber || user.serviceNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Rank / Designation</label>
                    <div className="fw-semibold">{beneficiary.rank || user.rank || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Branch / Service</label>
                    <div>{beneficiary.organization || user.service || 'Indian Army'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Unit / Regiment</label>
                    <div>{beneficiary.unit || user.regiment || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Category / Employment</label>
                    <div>
                      <span className="badge badge-info">
                        {beneficiary.category || beneficiary.employmentStatus || user.employmentStatus || 'SERVING'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Pay Level / Grade</label>
                    <div className="font-mono">{beneficiary.payLevel || user.payLevel || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Canteen Grocery Card ID</label>
                    <div className="font-mono">{beneficiary.cardId || user.cardId || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">Card Chip Number</label>
                    <div className="font-mono">{beneficiary.chipNumber || user.chipNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">PAN Number</label>
                    <div className="font-mono">{beneficiary.pan || user.pan || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="form-label text-muted">PPO Number (if retired)</label>
                    <div className="font-mono">{beneficiary.ppo || user.ppo || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROLES & RBAC */}
        {activeTab === 'roles' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Role-Based Access Control (RBAC) Governance</h3>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <label className="form-label text-muted">Primary Active Role</label>
                <div>
                  <span className="badge badge-role-boxed" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    {primaryRoleLabel}
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label text-muted">Additional / Secondary Roles</label>
                {user.otherRoles && user.otherRoles.length > 0 ? (
                  <div className="row gap-1 flex-wrap mt-xs">
                    {user.otherRoles.map((r) => (
                      <span key={r} className="badge badge-other-roles-tag">
                        {ROLE_LABELS[r] || r}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="muted small">No secondary roles mapped to this account.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEMANDS & FEEDBACK */}
        {activeTab === 'demands' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Beneficiary Demand Quota & Feedback</h3>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div>
                  <label className="form-label text-muted">Last Four-Wheeler (Car) Demand Date</label>
                  <div className="font-mono">{user.lastDemand4Wheeler || 'No previous 4-wheeler demand recorded'}</div>
                </div>
                <div>
                  <label className="form-label text-muted">Last Two-Wheeler Demand Date</label>
                  <div className="font-mono">{user.lastDemand2Wheeler || 'No previous 2-wheeler demand recorded'}</div>
                </div>
                <div>
                  <label className="form-label text-muted">Website Experience Rating</label>
                  <div>{'★'.repeat(user.websiteRating || 5)}{'☆'.repeat(5 - (user.websiteRating || 5))} ({user.websiteRating || 5}/5)</div>
                </div>
                <div>
                  <label className="form-label text-muted">User Feedback / Comments</label>
                  <div>{user.feedbackComment || 'No feedback submitted.'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STATUS HISTORY */}
        {activeTab === 'history' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Security & Account State Transition Audit</h3>
            </div>
            <div className="card-body">
              {user.statusHistory && user.statusHistory.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Transition Date</th>
                        <th>Changed By</th>
                        <th>Remarks / Audit Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.statusHistory.map((h, i) => (
                        <tr key={i}>
                          <td><StatusBadge status={h.status} /></td>
                          <td className="font-mono fs-xs">{h.date ? new Date(h.date).toLocaleString() : 'N/A'}</td>
                          <td>{h.changedBy || 'System Administrator'}</td>
                          <td className="muted">{h.remarks || 'Standard account maintenance'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-desc">No recorded status transition history for this account.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">System Audit Log & Telemetry</h3>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div>
                  <label className="form-label text-muted">Account Registered On</label>
                  <div className="font-mono">{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div>
                  <label className="form-label text-muted">Last Profile Update</label>
                  <div className="font-mono">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div>
                  <label className="form-label text-muted">Total Profile Edits</label>
                  <div className="fw-bold">{user.userEditedCount || 0} times</div>
                </div>
                <div>
                  <label className="form-label text-muted">Total Status Transitions</label>
                  <div className="fw-bold">{user.statusChangeCount || 0} times</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserDetail;
