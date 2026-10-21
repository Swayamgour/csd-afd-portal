import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { FilterBar } from '../../components/common/FilterBar.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ExportButton } from '../../components/common/ExportButton.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { UserDetailsModal } from './UserDetailsModal.jsx';
import { UserEditModal } from './UserEditModal.jsx';
import { UserStatusModal } from './UserStatusModal.jsx';
import { userService } from '../../services/user.service.js';
import { MASTER_ROLES, ROLE_LABELS } from '../../permissions/roles.js';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Eye,
  Edit2,
  Shield,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2
} from 'lucide-react';

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (e) {
      console.error('[AdminUsers] fetchUsers error:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Handlers for modal callbacks
  const handleUserCreated = (newUser) => {
    showToast(`✓ User account "${newUser.username}" created successfully with role "${ROLE_LABELS[newUser.role] || newUser.role}".`);
    fetchUsers();
  };

  const handleUserUpdated = (updatedUser) => {
    showToast(`✓ Profile updated for "${updatedUser.username}".`);
    fetchUsers();
  };

  const handleStatusUpdated = (updatedUser) => {
    showToast(`✓ Status for "${updatedUser.username}" changed to "${updatedUser.status}".`);
    fetchUsers();
  };

  const handleQuickToggleLock = async (user) => {
    const nextStatus = user.status === 'Suspended' || user.status === 'Denied' ? 'Active' : 'Suspended';
    const reason = nextStatus === 'Active' ? 'Account unlocked by administrator' : 'Emergency temporary security lockout';
    try {
      await userService.updateUserStatus(user.id, nextStatus, reason, 'Admin Officer K. S. Pillai');
      showToast(`✓ Account ${user.username} is now ${nextStatus}.`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to toggle account lock state');
    }
  };

  const handleApproveBeneficiary = async (user) => {
    try {
      await userService.approveBeneficiaryUser(user.id, 'APPROVED', 'Approved by administrator');
      showToast(`✓ Beneficiary "${user.name || user.username}" approved successfully. Demand generation is now enabled.`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to approve beneficiary');
    }
  };

  const handleRejectBeneficiary = async (user) => {
    const reason = window.prompt('Please enter the reason for rejecting this beneficiary application:', 'Documentation incomplete or invalid canteen card') || 'Application rejected by administrator';
    try {
      await userService.approveBeneficiaryUser(user.id, 'REJECTED', reason);
      showToast(`Beneficiary "${user.name || user.username}" status updated to REJECTED.`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to reject beneficiary');
    }
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase().trim();
    const matchesSearch =
      !s ||
      (u.name && u.name.toLowerCase().includes(s)) ||
      (u.username && u.username.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.mobile && u.mobile.toLowerCase().includes(s)) ||
      (u.id && u.id.toLowerCase().includes(s));

    const matchesRole =
      roleFilter === 'ALL' ||
      u.role === roleFilter ||
      (u.otherRoles && u.otherRoles.includes(roleFilter));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (u.status && u.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesRole && matchesStatus;
  });

  // KPI calculations
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === 'Active').length;
  const pendingCount = users.filter((u) => u.status === 'Pending' || u.adminApproval === 'PENDING').length;
  const suspendedCount = users.filter((u) => u.status === 'Suspended' || u.status === 'Denied').length;

  const columns = [
    {
      header: 'User Identity',
      accessor: 'name',
      render: (u) => (
        <div className="row align-center gap-1">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#e2e8f0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0
            }}
          >
            {(u.name || u.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{u.name || u.username}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <code>{u.username}</code> · {u.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Roles & Permissions',
      accessor: 'role',
      render: (u) => {
        const rObj = MASTER_ROLES.find((m) => m.code === u.role);
        const label = rObj ? rObj.label : ROLE_LABELS[u.role] || u.role;
        const otherCount = u.otherRoles?.length || 0;
        return (
          <div>
            <span
              className="badge"
              style={{
                background: '#f1f5f9',
                color: '#0b1f3a',
                fontWeight: 600,
                border: '1px solid #cbd5e1'
              }}
            >
              {label}
            </span>
            {otherCount > 0 && (
              <span
                className="badge"
                style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  marginLeft: '0.35rem',
                  fontSize: '0.7rem'
                }}
                title={`Other roles: ${u.otherRoles.join(', ')}`}
              >
                +{otherCount} other{otherCount > 1 ? 's' : ''}
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
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.email || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.mobile || u.phone || 'No phone'}</div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
            {u.isEmailVerified ? (
              <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 600 }}>
                ✓ Email Verified (OTP)
              </span>
            ) : (
              <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem' }}>
                Email Unverified
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Account & Approval',
      accessor: 'status',
      render: (u) => {
        const isApproved = u.status === 'Active' || u.adminApproval === 'APPROVED' || u.verificationStatus === 'APPROVED' || u.verificationStatus === 'VERIFIED';
        const isRejected = u.status === 'Rejected' || u.adminApproval === 'REJECTED' || u.verificationStatus === 'REJECTED';
        const isPending = !isApproved && !isRejected;

        return (
          <div>
            <StatusBadge status={u.status} />
            {u.role === 'BENEFICIARY' && (
              <div style={{ marginTop: '4px' }}>
                <span
                  className="badge"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    background: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                    color: isApproved ? '#166534' : isRejected ? '#991b1b' : '#92400e',
                    border: `1px solid ${isApproved ? '#bbf7d0' : isRejected ? '#fecaca' : '#fde68a'}`
                  }}
                >
                  {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING'}
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Audit & Edits',
      accessor: 'userEditedCount',
      render: (u) => (
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          <div>Edits: <strong>{u.userEditedCount || 0}</strong></div>
          <div>Status Shifts: <strong>{u.statusChangeCount || 0}</strong></div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (u) => (
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Beneficiary status indicator (Admin view-only; Approvals exclusive to CS Director) */}
          {u.role === 'BENEFICIARY' && (u.status === 'Pending' || u.adminApproval === 'PENDING' || u.verificationStatus === 'PENDING') && (
            <span
              className="badge"
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                padding: '0.2rem 0.45rem',
                borderRadius: '4px'
              }}
              title="Awaiting review & approval by CS Director"
            >
              Pending CS Director
            </span>
          )}

          <button
            type="button"
            className="header-icon-btn circle"
            style={{ width: '30px', height: '30px', color: '#475569' }}
            title="Inspect Full User File"
            onClick={() => setSelectedUserForDetails(u)}
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            className="header-icon-btn circle"
            style={{ width: '30px', height: '30px', color: '#1e4fd8' }}
            title="Edit User Profile"
            onClick={() => setSelectedUserForEdit(u)}
          >
            <Edit2 size={15} />
          </button>

          <button
            type="button"
            className="header-icon-btn circle"
            style={{ width: '30px', height: '30px', color: '#d97706' }}
            title="Change Account Security Status"
            onClick={() => setSelectedUserForStatus(u)}
          >
            <Shield size={15} />
          </button>

          <button
            type="button"
            className="header-icon-btn circle"
            style={{
              width: '30px',
              height: '30px',
              color: u.status === 'Suspended' || u.status === 'Denied' ? '#16a34a' : '#dc2626'
            }}
            title={u.status === 'Suspended' || u.status === 'Denied' ? 'Unlock Account' : 'Quick Lock Account'}
            onClick={() => handleQuickToggleLock(u)}
          >
            {u.status === 'Suspended' || u.status === 'Denied' ? <Unlock size={15} /> : <Lock size={15} />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-users-page">
      <PageHeader
        title="Identity & Access Governance (IAM)"
        subtitle="Manage user credentials, WordPress migrated profiles, RBAC role mappings, security lockouts, and enterprise audit trails"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'User Management' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ExportButton data={filteredUsers} filename="CSD_User_Registry" />
            <Button
              icon={Plus}
              onClick={() => navigate('/admin/users/new')}
            >
              Add New User
            </Button>
          </div>
        }
      />

      {/* Success Notification Alert */}
      {toastMessage && (
        <div
          className="alert alert-success row align-center gap-1"
          style={{
            marginBottom: '1.25rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <CheckCircle2 size={18} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          title="Total User Accounts"
          value={totalCount}
          subtitle="Enrolled directory identities"
          icon={Users}
        />
        <StatCard
          title="Active Accounts"
          value={activeCount}
          subtitle="Authenticated & authorized"
          icon={UserCheck}
        />
        <StatCard
          title="Pending Verification"
          value={pendingCount}
          subtitle="Awaiting nodal clearance"
          icon={Clock}
        />
        <StatCard
          title="Locked / Suspended"
          value={suspendedCount}
          subtitle="Access denied or held"
          icon={UserX}
        />
      </div>

      {/* MAIN DATA TABLE & FILTER BAR */}
      <Card>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by username, name, email, mobile..."
          filters={[
            {
              name: 'role',
              label: 'Role',
              value: roleFilter,
              onChange: (e) => setRoleFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Roles (Master List)' },
                ...MASTER_ROLES.map((r) => ({ value: r.code, label: r.label }))
              ]
            },
            {
              name: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Account Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending Verification' },
                { value: 'Suspended', label: 'Suspended' },
                { value: 'Denied', label: 'Denied' },
                { value: 'Inactive', label: 'Inactive' }
              ]
            }
          ]}
        />

        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyTitle="No matching users found"
          emptyMessage="Try adjusting your search criteria or role filters to view portal accounts."
        />
      </Card>

      {/* 1. USER DETAILS INSPECTOR MODAL */}
      <UserDetailsModal
        isOpen={!!selectedUserForDetails}
        user={selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        onEdit={(u) => setSelectedUserForEdit(u)}
        onChangeStatus={(u) => setSelectedUserForStatus(u)}
      />

      {/* 3. USER EDIT MODAL */}
      <UserEditModal
        isOpen={!!selectedUserForEdit}
        user={selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        onUserUpdated={handleUserUpdated}
      />

      {/* 4. USER STATUS CHANGE MODAL */}
      <UserStatusModal
        isOpen={!!selectedUserForStatus}
        user={selectedUserForStatus}
        onClose={() => setSelectedUserForStatus(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
};

export default AdminUsers;
