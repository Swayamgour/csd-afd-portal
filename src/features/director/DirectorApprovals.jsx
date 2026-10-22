import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { DirectorEditUserModal } from './DirectorEditUserModal.jsx';
import { UserDetailsModal } from '../admin/UserDetailsModal.jsx';
import { useGetUsersQuery, useApproveUserMutation, useRejectUserMutation } from '../admin/adminApi.js';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Eye,
  Edit2,
  RefreshCw,
  Search,
  X,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Building,
  CreditCard,
  FileCheck
} from 'lucide-react';

export function DirectorApprovals({ defaultTab = 'PENDING' }) {
  const [statusTab, setStatusTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [rejectModalUser, setRejectModalUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('Service records mismatch with Armed Forces database');
  const [rejectCustomRemarks, setRejectCustomRemarks] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // RTK Query: Single source of truth for users list & mutations
  const { data: rawUsers = [], isLoading: loading, refetch } = useGetUsersQuery({ limit: 300 });
  const [approveUserMutation] = useApproveUserMutation();
  const [rejectUserMutation] = useRejectUserMutation();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const users = useMemo(() => {
    const list = Array.isArray(rawUsers) ? rawUsers : [];
    return list.filter((u) => {
      const r = String(u.role || '').toUpperCase();
      return r === 'BENEFICIARY' || r === 'CUSTOMER' || u.beneficiary || u.serviceNumber;
    });
  }, [rawUsers]);

  // 1-Click Approve Action
  const handleApprove = async (user) => {
    const targetId = user.id || user._id;
    setActionLoadingId(targetId);
    try {
      await approveUserMutation({ id: targetId, remarks: 'Verified and approved by CS Director' }).unwrap();
      showToast(`✓ Beneficiary "${user.name || user.username}" approved successfully. Entitlement unlocked!`);
      refetch();
    } catch (err) {
      console.error('[DirectorApprovals] approval error:', err);
      alert(err?.data?.message || err.message || 'Failed to approve registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Rejection Submit Action
  const handleConfirmReject = async (e) => {
    e?.preventDefault();
    if (!rejectModalUser) return;

    const targetId = rejectModalUser.id || rejectModalUser._id;
    const finalRemarks = rejectCustomRemarks.trim()
      ? `${rejectReason}: ${rejectCustomRemarks.trim()}`
      : rejectReason;

    setActionLoadingId(targetId);
    try {
      await rejectUserMutation({ id: targetId, remarks: finalRemarks }).unwrap();
      showToast(`Application for "${rejectModalUser.name || rejectModalUser.username}" was REJECTED.`);
      setRejectModalUser(null);
      setRejectCustomRemarks('');
      refetch();
    } catch (err) {
      console.error('[DirectorApprovals] reject error:', err);
      alert(err?.data?.message || err.message || 'Failed to reject registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUserUpdated = (updatedUser) => {
    showToast(`✓ Details updated for "${updatedUser.name || updatedUser.username}".`);
    setUsers((prev) =>
      prev.map((u) => ((u.id === updatedUser.id || u._id === updatedUser.id) ? { ...u, ...updatedUser } : u))
    );
  };

  // Metrics computation
  const metrics = {
    total: users.length,
    pending: users.filter((u) => {
      const v = u.verificationStatus || u.beneficiary?.verificationStatus || '';
      return v === 'PENDING' || u.status === 'Pending' || u.adminApproval === 'PENDING';
    }).length,
    approved: users.filter((u) => {
      const v = u.verificationStatus || u.beneficiary?.verificationStatus || '';
      return v === 'VERIFIED' || v === 'APPROVED' || u.status === 'Active';
    }).length,
    rejected: users.filter((u) => {
      const v = u.verificationStatus || u.beneficiary?.verificationStatus || '';
      return v === 'REJECTED' || u.status === 'Denied' || u.status === 'INACTIVE';
    }).length,
  };

  // Filter list
  const filteredUsers = users.filter((u) => {
    const vStatus = u.verificationStatus || u.beneficiary?.verificationStatus || (u.status === 'Pending' ? 'PENDING' : 'VERIFIED');
    const isPending = vStatus === 'PENDING' || u.adminApproval === 'PENDING';
    const isApproved = vStatus === 'VERIFIED' || vStatus === 'APPROVED';
    const isRejected = vStatus === 'REJECTED';

    if (statusTab === 'PENDING' && !isPending) return false;
    if (statusTab === 'APPROVED' && !isApproved) return false;
    if (statusTab === 'REJECTED' && !isRejected) return false;

    if (categoryFilter !== 'ALL') {
      const cat = u.category || u.beneficiary?.category || u.beneficiary?.employmentStatus || '';
      if (!cat.toUpperCase().includes(categoryFilter.toUpperCase())) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const b = u.beneficiary || {};
      const match =
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.mobile || u.phone || '').includes(q) ||
        (b.serviceNumber || u.serviceNumber || '').toLowerCase().includes(q) ||
        (b.cardId || u.cardId || '').toLowerCase().includes(q) ||
        (b.rank || u.rank || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const columns = [
    {
      header: 'Beneficiary Information',
      accessor: 'name',
      render: (u) => {
        const b = u.beneficiary || {};
        return (
          <div className="flex-align-center-gap-sm">
            <div className="director-avatar-box">
              {(u.name || 'B').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="portal-profile-name font-semibold">
                {u.name || 'Unknown Beneficiary'}
              </div>
              <div className="portal-subtext-muted flex-align-center-gap-xs">
                <span className="portal-text-brand font-semibold">{b.rank || u.rank || 'Armed Forces'}</span>
                <span>•</span>
                <span>{b.serviceNumber || u.serviceNumber || 'No Svc No'}</span>
              </div>
              <div className="portal-subtext-muted fs-xs">
                {b.organization || u.service || 'Indian Army'} ({b.category || 'SERVING'})
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'CSD Card & Identity',
      accessor: 'cardId',
      render: (u) => {
        const b = u.beneficiary || {};
        return (
          <div className="fs-sm">
            <div className="portal-flex-align-center-gap-xs font-semibold portal-text-slate">
              <CreditCard size={14} color="var(--color-primary)" />
              <span>Card: {b.cardId || u.cardId || 'Not Assigned'}</span>
            </div>
            <div className="portal-subtext-muted fs-xs">
              Chip: {b.chipNumber || u.chipNumber || 'N/A'}
            </div>
            <div className="portal-text-success font-semibold fs-xs">
              Entitlement: {b.entitlement || u.eligibility?.category || 'Standard'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Contact & Station',
      accessor: 'contact',
      render: (u) => {
        const b = u.beneficiary || {};
        const addr = b.address || u.address || {};
        return (
          <div className="fs-sm portal-text-slate">
            <div>{u.email || 'No email registered'}</div>
            <div className="portal-profile-name font-semibold">{u.mobile || u.phone || 'No phone'}</div>
            <div className="portal-subtext-muted fs-xs">
              {addr.city ? `${addr.city}, ${addr.state || ''}` : (b.unit || 'Station N/A')}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Approval State',
      accessor: 'status',
      render: (u) => {
        const vStatus = u.verificationStatus || u.beneficiary?.verificationStatus || '';
        const isPending = vStatus === 'PENDING' || u.status === 'Pending' || u.adminApproval === 'PENDING';
        const isApproved = vStatus === 'VERIFIED' || vStatus === 'APPROVED' || u.status === 'Active';

        return (
          <div>
            {isPending ? (
              <span className="badge-status-awaiting">
                <Clock size={12} /> Awaiting CS Director
              </span>
            ) : isApproved ? (
              <span className="badge-status-approved">
                <CheckCircle size={12} /> Approved / Verified
              </span>
            ) : (
              <span className="badge-status-rejected">
                <UserX size={12} /> Rejected
              </span>
            )}
            {u.remarks && (
              <div className="portal-subtext-muted fs-xs mt-xs truncate-max-w-160" title={u.remarks}>
                Note: {u.remarks}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'CS Director Actions',
      accessor: 'actions',
      render: (u) => {
        const targetId = u.id || u._id;
        const isLoading = actionLoadingId === targetId;
        const vStatus = u.verificationStatus || u.beneficiary?.verificationStatus || '';
        const isPending = vStatus === 'PENDING' || u.status === 'Pending' || u.adminApproval === 'PENDING';
        const isApproved = vStatus === 'VERIFIED' || vStatus === 'APPROVED' || u.status === 'Active';

        return (
          <div className="portal-flex-wrap-gap-xs flex-align-center-gap-xs">
            {/* 1. APPROVE BUTTON */}
            {isPending && (
              <Button
                size="sm"
                className="btn-approve-success-pill"
                disabled={isLoading}
                onClick={() => handleApprove(u)}
                title="Approve Beneficiary Registration and Authorize AFD Purchase"
              >
                {isLoading ? '...' : '✓ Approve'}
              </Button>
            )}

            {/* 2. REJECT BUTTON */}
            {isPending && (
              <Button
                size="sm"
                variant="outline"
                className="btn-deny-danger-pill"
                disabled={isLoading}
                onClick={() => setRejectModalUser(u)}
                title="Reject with reasons"
              >
                Reject
              </Button>
            )}

            {/* Re-approve for rejected applications */}
            {!isPending && !isApproved && (
              <Button
                size="sm"
                className="btn-approve-success-pill"
                disabled={isLoading}
                onClick={() => handleApprove(u)}
                title="Re-evaluate & Approve"
              >
                ✓ Re-Approve
              </Button>
            )}

            {/* 3. EDIT PROFILE BUTTON (Exclusively for CS Director) */}
            <button
              type="button"
              className="circle btn-icon-action-edit"
              title="Edit Beneficiary Details & Service Records"
              onClick={() => setSelectedUserForEdit(u)}
            >
              <Edit2 size={14} />
            </button>

            {/* 4. INSPECT BUTTON */}
            <button
              type="button"
              className="circle btn-icon-action-inspect"
              title="View Full Profile Details"
              onClick={() => setSelectedUserForDetails(u)}
            >
              <Eye size={14} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="director-approvals-page pb-3xl">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="director-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* CS Director Official Authority Banner */}
      <div className="director-authority-banner">
        <div>
          <div className="portal-flex-align-center-gap-sm mb-xs">
            <ShieldCheck size={20} color="var(--color-primary-light)" />
            <span className="director-authority-title">
              CANTEEN STORES DEPARTMENT • DIRECTORATE DESK
            </span>
          </div>
          <div className="director-authority-desc">
            Under revised CSD portal guidelines, <strong>all newly registered users require authorization exclusively by the CS Director</strong> before demand generation is enabled. System administrators possess view-only oversight.
          </div>
        </div>
        <div className="director-authority-metrics">
          <div>
            <div className="director-authority-metric-label">Pending Actions</div>
            <div className="director-authority-metric-pending">{metrics.pending}</div>
          </div>
          <div className="director-metric-divider">
            <div className="director-authority-metric-label">Total Verified</div>
            <div className="director-authority-metric-approved">{metrics.approved}</div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="csd-kpi-grid">
        <StatCard
          title="Pending Approvals"
          value={String(metrics.pending)}
          subtitle={metrics.pending > 0 ? 'Requires CS Director Action' : 'All Clear'}
          isPositive={metrics.pending === 0}
          className={metrics.pending > 0 ? 'director-card-pending-alert' : ''}
        />
        <StatCard
          title="Approved Beneficiaries"
          value={String(metrics.approved)}
          change={`+${metrics.approved}`}
          isPositive={true}
          subtitle="Entitled for Demand Generation"
        />
        <StatCard
          title="Rejected Registrations"
          value={String(metrics.rejected)}
          subtitle="Flagged / Mismatched"
        />
        <StatCard
          title="Total Registered Beneficiaries"
          value={String(metrics.total)}
          subtitle="Indian Armed Forces Stakeholders"
        />
      </div>

      {/* Main Table Card */}
      <Card
        title="Beneficiary Verification & Record Editing Desk"
        actions={
          <div className="portal-subtext-muted fs-sm">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> records
          </div>
        }
      >
        {/* Tabs and Filters */}
        <div className="director-table-filter-bar">
          {/* Status Tabs */}
          <div className="portal-flex-wrap-gap-xs">
            {[
              { id: 'PENDING', label: 'Pending Approvals', count: metrics.pending, alert: metrics.pending > 0 },
              { id: 'APPROVED', label: 'Approved & Active', count: metrics.approved },
              { id: 'REJECTED', label: 'Rejected', count: metrics.rejected },
              { id: 'ALL', label: 'All Beneficiaries', count: metrics.total }
            ].map((tab) => {
              const active = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  className={`director-tab-btn ${active ? 'active' : ''}`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`director-tab-badge ${active ? 'active' : tab.alert ? 'alert' : ''}`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Category Filter */}
          <div className="portal-flex-align-center-gap-sm flex-wrap">
            <div className="pos-relative-min-w-240">
              <Search size={15} className="director-search-icon" />
              <input
                type="text"
                placeholder="Search name, svc no, card, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="director-search-input-field"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="director-search-clear-btn"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="director-select-filter"
            >
              <option value="ALL">All Categories</option>
              <option value="SERVING">Serving Personnel</option>
              <option value="EX_SERVICEMAN">Ex-Servicemen</option>
              <option value="DEFENCE_CIVILIAN">Defence Civilians</option>
              <option value="WIDOW">Widow / NOK</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyText={
            searchQuery || statusTab !== 'ALL' || categoryFilter !== 'ALL'
              ? 'No beneficiary applications match your current filters.'
              : 'No beneficiary records found.'
          }
        />
      </Card>

      {/* Edit Beneficiary Modal (CS Director only) */}
      {selectedUserForEdit && (
        <DirectorEditUserModal
          isOpen={!!selectedUserForEdit}
          onClose={() => setSelectedUserForEdit(null)}
          user={selectedUserForEdit}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* View User Details Modal */}
      {selectedUserForDetails && (
        <UserDetailsModal
          isOpen={!!selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
          user={selectedUserForDetails}
        />
      )}

      {/* Reject Modal */}
      {rejectModalUser && (
        <Modal
          isOpen={!!rejectModalUser}
          onClose={() => setRejectModalUser(null)}
          title={`Reject Application: ${rejectModalUser.name || rejectModalUser.username}`}
        >
          <form onSubmit={handleConfirmReject} className="director-modal-form">
            <div className="portal-form-group">
              <label className="director-field-label">
                Primary Reason for Rejection *
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="director-field-input"
              >
                <option value="Service records mismatch with Armed Forces database">Service records mismatch with Armed Forces database</option>
                <option value="CSD smart canteen card invalid or expired">CSD smart canteen card invalid or expired</option>
                <option value="Incomplete or unverified identity documentation">Incomplete or unverified identity documentation</option>
                <option value="Entitlement category does not match rank/pay level">Entitlement category does not match rank/pay level</option>
                <option value="Duplicate beneficiary account detected">Duplicate beneficiary account detected</option>
                <option value="Other administrative grounds">Other administrative grounds</option>
              </select>
            </div>

            <div className="portal-form-group-spaced">
              <label className="director-field-label">
                Additional Remarks / Correction Instructions for Beneficiary
              </label>
              <textarea
                rows={3}
                value={rejectCustomRemarks}
                onChange={(e) => setRejectCustomRemarks(e.target.value)}
                placeholder="Explain the required documents or correction so the user can rectify and re-apply..."
                className="director-field-input"
              />
            </div>

            <div className="portal-flex-end gap-sm">
              <Button variant="outline" type="button" onClick={() => setRejectModalUser(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="portal-btn-deny-danger"
              >
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
