import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card } from '../../components/common/Card.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { UserDetailsModal } from './UserDetailsModal.jsx';
import {
  useGetUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation
} from './adminApi.js';
import { ROLE_LABELS, MASTER_ROLES } from '../../permissions/roles.js';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
  X,
  Filter,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Check,
  RotateCcw,
  Image
} from 'lucide-react';

export const AdminDashboard = () => {
  // RTK Query: Data fetching with automatic cache invalidation
  const {
    data: fetchedUsers = [],
    isLoading: loading,
    isFetching: refreshing,
    refetch,
    error: fetchError
  } = useGetUsersQuery({ limit: 200 });

  // RTK Query: Mutations for approving and rejecting users
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Filtering & Search
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [rejectModalUser, setRejectModalUser] = useState(null);
  const [rejectPreset, setRejectPreset] = useState('Documents mismatch with Armed Forces Service Records');
  const [rejectRemarks, setRejectRemarks] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleManualRefresh = async () => {
    try {
      await refetch();
      showToast('✓ Directory data synchronized via RTK Query.');
    } catch (e) {
      console.error('[AdminDashboard] refetch failed:', e);
    }
  };

  // 1-Click Approve Action using RTK Query mutation
  const handleApprove = async (u) => {
    const targetId = u.id || u._id;
    setActionLoadingId(targetId);
    try {
      await approveUser({
        id: targetId,
        remarks: 'Verified and approved by System Administrator'
      }).unwrap();
      showToast(`✓ "${u.name || u.username}" approved successfully! Demand creation is now active.`);
    } catch (err) {
      console.error('[AdminDashboard] handleApprove failed:', err);
      alert(err?.data?.message || err.message || 'Failed to approve user');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Rejection Modal
  const openRejectModal = (u) => {
    setRejectModalUser(u);
    setRejectPreset('Documents mismatch with Armed Forces Service Records');
    setRejectRemarks('');
  };

  // Confirm Rejection using RTK Query mutation
  const handleConfirmReject = async (e) => {
    e?.preventDefault();
    if (!rejectModalUser) return;

    const targetId = rejectModalUser.id || rejectModalUser._id;
    const finalReason = rejectRemarks.trim() ? `${rejectPreset}: ${rejectRemarks.trim()}` : rejectPreset;

    setActionLoadingId(targetId);
    try {
      await rejectUser({
        id: targetId,
        remarks: finalReason
      }).unwrap();
      showToast(`User "${rejectModalUser.name || rejectModalUser.username}" has been REJECTED.`);
      setRejectModalUser(null);
    } catch (err) {
      console.error('[AdminDashboard] handleConfirmReject failed:', err);
      alert(err?.data?.message || err.message || 'Failed to reject user');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Normalized users list from RTK Query cache
  const users = useMemo(() => {
    return Array.isArray(fetchedUsers) ? fetchedUsers : [];
  }, [fetchedUsers]);

  // Universal Status Evaluator
  const getUserStatusState = (u) => {
    const isRejected =
      u.status === 'Denied' ||
      u.status === 'Rejected' ||
      u.status === 'INACTIVE' ||
      u.verificationStatus === 'REJECTED' ||
      u.adminApproval === 'REJECTED';

    const isPending =
      !isRejected &&
      (u.status === 'Pending' ||
        u.status === 'PENDING' ||
        u.verificationStatus === 'PENDING' ||
        u.adminApproval === 'PENDING' ||
        (!u.verificationStatus && String(u.role || '').toLowerCase() === 'beneficiary'));

    const isApproved =
      !isRejected &&
      !isPending &&
      (u.status === 'Active' ||
        u.status === 'ACTIVE' ||
        u.verificationStatus === 'VERIFIED' ||
        u.verificationStatus === 'APPROVED' ||
        u.adminApproval === 'APPROVED');

    return { isRejected, isPending, isApproved };
  };

  // Metric Computations
  const metrics = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let beneficiaries = 0;
    let partners = 0;

    users.forEach((u) => {
      const role = String(u.role || '').toLowerCase();
      if (role === 'beneficiary') beneficiaries += 1;
      else if (role !== 'admin' && role !== 'administrator') partners += 1;

      const { isPending, isApproved, isRejected } = getUserStatusState(u);
      if (isPending) pending += 1;
      else if (isApproved) approved += 1;
      else if (isRejected) rejected += 1;
    });

    return {
      total: users.length,
      pending,
      approved,
      rejected,
      beneficiaries,
      partners
    };
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const role = String(u.role || '').toLowerCase();
      const { isPending, isApproved, isRejected } = getUserStatusState(u);

      // Status Tab Filter
      if (statusTab === 'PENDING' && !isPending) return false;
      if (statusTab === 'APPROVED' && !isApproved) return false;
      if (statusTab === 'REJECTED' && !isRejected) return false;

      // Role Filter
      if (roleFilter !== 'ALL' && role !== roleFilter.toLowerCase()) return false;

      // Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (u.name || '').toLowerCase().includes(q);
        const userMatch = (u.username || '').toLowerCase().includes(q);
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        const mobileMatch = (u.mobile || '').toLowerCase().includes(q);
        const cardMatch = (u.cardId || u.serviceNumber || '').toLowerCase().includes(q);
        const chipMatch = (u.chipNumber || '').toLowerCase().includes(q);
        if (!nameMatch && !userMatch && !emailMatch && !mobileMatch && !cardMatch && !chipMatch) {
          return false;
        }
      }

      return true;
    });
  }, [users, statusTab, roleFilter, searchQuery]);

  // Table Columns
  const userColumns = [
    {
      header: 'User Profile & Role',
      accessor: 'name',
      render: (u) => {
        const role = String(u.role || '').toLowerCase();
        const roleLabel = ROLE_LABELS[role] || u.role || 'Beneficiary';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{u.name || u.username}</strong>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '0.12rem 0.45rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: role === 'beneficiary' ? '#eff6ff' : role === 'admin' ? '#fdf2f8' : '#f0fdf4',
                  color: role === 'beneficiary' ? '#1d4ed8' : role === 'admin' ? '#be185d' : '#15803d',
                  border: '1px solid currentColor'
                }}
              >
                {roleLabel}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              @{u.username || 'unknown'} · ID: <span style={{ fontFamily: 'monospace' }}>{(u.id || u._id || '').slice(0, 8)}...</span>
            </span>
          </div>
        );
      }
    },
    {
      header: 'Grocery Card & Service Details',
      accessor: 'cardId',
      render: (u) => {
        const hasCard = Boolean(u.cardId || u.serviceNumber);
        return (
          <div>
            {hasCard ? (
              <>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                  {u.cardId || u.serviceNumber}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {u.organization || 'Defence Services'} {u.employmentStatus ? `· ${u.employmentStatus}` : ''}
                </div>
              </>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Standard System User
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Contact & Verification',
      accessor: 'email',
      render: (u) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Mail size={13} className="text-muted" />
            <span>{u.email || 'N/A'}</span>
          </div>
          {u.mobile && (
            <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Phone size={13} className="text-muted" />
              <span>{u.mobile}</span>
            </div>
          )}
          <div style={{ marginTop: '0.3rem' }}>
            {u.isEmailVerified ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px'
                }}
              >
                <ShieldCheck size={11} /> Email OTP Verified
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#991b1b',
                  background: '#fee2e2',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px'
                }}
              >
                Unverified Email
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Verification Status',
      accessor: 'status',
      render: (u) => {
        const { isPending, isApproved } = getUserStatusState(u);

        if (isPending) {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a'
              }}
            >
              <Clock size={13} /> PENDING APPROVAL
            </span>
          );
        }

        if (isApproved) {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#dcfce7',
                color: '#15803d',
                border: '1px solid #bbf7d0'
              }}
            >
              <CheckCircle2 size={13} /> APPROVED
            </span>
          );
        }

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca'
            }}
          >
            <AlertCircle size={13} /> REJECTED
          </span>
        );
      }
    },
    {
      header: 'Admin Actions',
      accessor: 'actions',
      render: (u) => {
        const targetId = u.id || u._id;
        const isLoading = actionLoadingId === targetId;
        const { isPending, isApproved } = getUserStatusState(u);

        return (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isPending ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#92400e',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title="Registration approval is awaiting action by CS Director"
              >
                Pending CS Director Approval
              </span>
            ) : isApproved ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#166534',
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                Approved
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#991b1b',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                Rejected
              </span>
            )}

            <button
              type="button"
              className="circle"
              style={{
                width: '30px',
                height: '30px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
              title="Inspect Full User Profile"
              onClick={() => setSelectedUserForDetails(u)}
            >
              <Eye size={14} className="text-muted" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="admin-dashboard-page" style={{ paddingBottom: '2.5rem' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            background: '#15803d',
            color: '#fff',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* PAGE HEADER */}
      <PageHeader
        title="Admin Control Center & Beneficiary Verification Hub"
        subtitle="Manage user directories, approve registered beneficiaries, and monitor system security"
        breadcrumbs={[{ label: 'System Admin', href: '/admin/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                style={{
                  marginRight: '0.35rem',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }}
              />
              {refreshing ? 'Syncing...' : 'Refresh Directory'}
            </Button>
            <Link to="/admin/banners">
              <Button variant="outline" size="sm">
                <Image size={14} style={{ marginRight: '0.35rem' }} /> Banners
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="primary" size="sm">
                <Users size={14} style={{ marginRight: '0.35rem' }} /> Full Directory
              </Button>
            </Link>
          </div>
        }
      />

      {/* METRIC STAT CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard
          title="Total Registered Users"
          value={String(metrics.total)}
          change={`+${metrics.total}`}
          isPositive={true}
          subtitle="All Stakeholders & Beneficiaries"
        />
        <StatCard
          title="Pending Approvals"
          value={String(metrics.pending)}
          subtitle={metrics.pending > 0 ? 'Requires Administrator Action' : 'All Requests Cleared'}
          isPositive={metrics.pending === 0}
          style={{ borderColor: metrics.pending > 0 ? '#f59e0b' : undefined }}
        />
        <StatCard
          title="Approved & Active"
          value={String(metrics.approved)}
          isPositive={true}
          subtitle="Entitled for Demand Generation"
        />
        <StatCard
          title="Commercial Partners & Staff"
          value={String(metrics.partners)}
          subtitle="Dealers, Depots, OEMs, URCs"
        />
      </div>

      {/* MAIN ALL USERS APPROVAL & VERIFICATION PANEL */}
      <Card
        title="User Verification & Approval Directory"
        style={{ marginBottom: '1.5rem' }}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
            </span>
          </div>
        }
      >
        {/* TABS & FILTERS BAR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '1rem'
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Users', count: metrics.total },
              { id: 'PENDING', label: 'Pending Approvals', count: metrics.pending, alert: metrics.pending > 0 },
              { id: 'APPROVED', label: 'Approved', count: metrics.approved },
              { id: 'REJECTED', label: 'Rejected', count: metrics.rejected }
            ].map((tab) => {
              const active = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: active ? '#0b1f3a' : '#cbd5e1',
                    background: active ? '#0b1f3a' : '#ffffff',
                    color: active ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: active
                        ? tab.alert
                          ? '#f59e0b'
                          : '#1e3a8a'
                        : tab.alert
                          ? '#fef3c7'
                          : '#f1f5f9',
                      color: active
                        ? '#ffffff'
                        : tab.alert
                          ? '#92400e'
                          : '#475569',
                      fontSize: '0.72rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      fontWeight: 700
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Role Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search name, email, card ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem 0.4rem 2rem',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  width: '100%',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.82rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="beneficiary">Defence Beneficiary</option>
              <option value="dealer">Automobile Dealer</option>
              <option value="oem">Manufacturer / OEM</option>
              <option value="depot">Depot Official</option>
              <option value="urc">URC Nodal</option>
              <option value="csd">CSD Head Office</option>
              <option value="helpdesk">Help Desk</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE */}
        <DataTable
          columns={userColumns}
          data={filteredUsers}
          loading={loading}
          emptyText={
            searchQuery || statusTab !== 'ALL' || roleFilter !== 'ALL'
              ? 'No users match your applied search and filter criteria.'
              : 'No registered users found in directory.'
          }
        />
      </Card>



      {/* REJECTION REASON MODAL */}
      {rejectModalUser && (
        <Modal
          isOpen={true}
          onClose={() => setRejectModalUser(null)}
          title="Reject User / Beneficiary Verification"
          subtitle={`Account: ${rejectModalUser.name || rejectModalUser.username} · ID: ${rejectModalUser.id || rejectModalUser._id}`}
          maxWidth="520px"
        >
          <form onSubmit={handleConfirmReject}>
            <div style={{ background: '#fef2f2', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1.2rem', display: 'flex', gap: '0.65rem' }}>
              <AlertTriangle size={20} className="text-danger flex-shrink-0" style={{ marginTop: '2px' }} />
              <div style={{ fontSize: '0.83rem', color: '#991b1b' }}>
                Rejecting this user will mark their status as <strong>Denied/Rejected</strong> and prevent them from submitting AFD vehicle purchase demands until re-verified.
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Primary Rejection Reason: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={rejectPreset}
                onChange={(e) => setRejectPreset(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff'
                }}
              >
                <option value="Documents mismatch with Armed Forces Service Records">Documents mismatch with Armed Forces Service Records</option>
                <option value="Invalid or duplicate Grocery Card ID / Chip Number">Invalid or duplicate Grocery Card ID / Chip Number</option>
                <option value="PAN Card or Identity verification failed">PAN Card or Identity verification failed</option>
                <option value="Ineligible rank or entitled vehicle quota mismatch">Ineligible rank or entitled vehicle quota mismatch</option>
                <option value="Incorrect date of enrolment / retirement data">Incorrect date of enrolment / retirement data</option>
                <option value="Other reason">Other reason (specified below)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Additional Remarks / Feedback for Beneficiary:
              </label>
              <textarea
                rows={3}
                placeholder="Enter details on what correction is needed (e.g. re-upload front page of discharge book)..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalUser(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                style={{ background: '#dc2626', color: '#fff', border: 'none', fontWeight: 600 }}
                disabled={actionLoadingId === (rejectModalUser.id || rejectModalUser._id)}
              >
                {actionLoadingId === (rejectModalUser.id || rejectModalUser._id) ? 'Processing...' : 'Confirm Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* USER DETAILS INSPECTION MODAL */}
      {selectedUserForDetails && (
        <UserDetailsModal
          isOpen={true}
          onClose={() => setSelectedUserForDetails(null)}
          user={users.find((u) => (u.id || u._id) === (selectedUserForDetails.id || selectedUserForDetails._id)) || selectedUserForDetails}
          onEdit={() => setSelectedUserForDetails(null)}
          onChangeStatus={() => setSelectedUserForDetails(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
