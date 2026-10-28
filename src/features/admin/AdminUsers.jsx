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
import { useGetUsersQuery, useUpdateUserStatusMutation } from './adminApi.js';
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
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawUsers = [], isLoading: loading, refetch: fetchUsers } = useGetUsersQuery({});
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const rawList = Array.isArray(rawUsers) ? rawUsers : (Array.isArray(rawUsers?.items) ? rawUsers.items : []);
  const users = rawList.map((u, idx) => ({
    ...u,
    id: String(u._id || u.id || `usr-${idx}`),
    name: u.name || 'User Account',
    username: u.username || u.email || 'N/A',
    role: (u.role || 'beneficiary').toLowerCase(),
    status: u.status === 'ACTIVE' || u.status === 'Active' ? 'Active' : (u.status === 'LOCKED' ? 'Suspended' : (u.status || 'Active')),
    verificationStatus: u.verificationStatus || (u.role === 'BENEFICIARY' ? 'PENDING' : 'VERIFIED'),
    adminApproval: u.verificationStatus === 'APPROVED' || u.verificationStatus === 'VERIFIED' ? 'APPROVED' : (u.verificationStatus === 'REJECTED' ? 'REJECTED' : 'PENDING'),
    isEmailVerified: u.isEmailVerified !== undefined ? u.isEmailVerified : true,
  }));

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState('');

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
    try {
      await updateUserStatus({ id: user.id, status: nextStatus === 'Active' ? 'ACTIVE' : 'LOCKED' }).unwrap();
      showToast(`✓ Account ${user.username} is now ${nextStatus}.`);
      fetchUsers();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to toggle account lock state');
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
          <div className="user-avatar-circle-sm">
            {(u.name || u.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="fw-semibold color-ink">{u.name || u.username}</div>
            <div className="portal-subtext-muted fs-xs">
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
            <span className="badge badge-role-boxed">
              {label}
            </span>
            {otherCount > 0 && (
              <span
                className="badge badge-other-roles-tag"
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
          <div className="fs-sm fw-medium">{u.email || 'N/A'}</div>
          <div className="portal-subtext-muted fs-xs">{u.mobile || u.phone || 'No phone'}</div>
          <div className="portal-flex-wrap-gap-xs mt-xs">
            {u.isEmailVerified ? (
              <span className="badge badge-verified-xs">
                ✓ Email Verified (OTP)
              </span>
            ) : (
              <span className="badge badge-unverified-xs">
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
              <div className="mt-xs">
                <span
                  className={`badge ${isApproved ? 'badge-approval-approved' : isRejected ? 'badge-approval-rejected' : 'badge-approval-pending'}`}
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
        <div className="portal-subtext-muted fs-xs">
          <div>Edits: <strong>{u.userEditedCount || 0}</strong></div>
          <div>Status Shifts: <strong>{u.statusChangeCount || 0}</strong></div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (u) => (
        <div className="flex-align-center-gap-xs flex-wrap">
          {/* Beneficiary status indicator (Admin view-only; Approvals exclusive to CS Director) */}
          {u.role === 'BENEFICIARY' && (u.status === 'Pending' || u.adminApproval === 'PENDING' || u.verificationStatus === 'PENDING') && (
            <span
              className="badge badge-pending-director-pill"
              title="Awaiting review & approval by CS Director"
            >
              Pending CS Director
            </span>
          )}

          <button
            type="button"
            className="header-icon-btn circle btn-size-30 text-slate-600"
            title="Inspect Full User File"
            onClick={() => navigate(`/admin/users/${u.id || u._id}`)}
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            className="header-icon-btn circle btn-size-30 text-brand"
            title="Edit User Profile"
            onClick={() => navigate(`/admin/users/${u.id || u._id}/edit`)}
          >
            <Edit2 size={15} />
          </button>

          <button
            type="button"
            className={`header-icon-btn circle btn-size-30 ${u.status === 'Suspended' || u.status === 'Denied' ? 'text-success' : 'text-danger'}`}
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
          <div className="flex-gap-sm">
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
        <div className="alert alert-success row align-center gap-1 admin-toast-success">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="kpi-grid mb-xl">
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
    </div>
  );
};

export default AdminUsers;
