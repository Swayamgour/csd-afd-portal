import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterBar } from '../../components/common/FilterBar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ExportButton } from '../../components/common/ExportButton';
import { userService } from '../../services/user.service';
import { ROLES, ROLE_LABELS } from '../../permissions/roles';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: ROLES.BENEFICIARY, depot: '', mobile: '' });
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await userService.createUser({
      ...newUser,
      status: 'ACTIVE',
      lastLogin: 'Never'
    });
    setShowModal(false);
    setActionSuccess(`Account provisioned successfully for ${newUser.name}.`);
    fetchUsers();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleToggleLock = async (user) => {
    const nextStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    await userService.updateUser(user.id, { status: nextStatus });
    setActionSuccess(`Account ${user.name} is now ${nextStatus}.`);
    fetchUsers();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      header: 'User / Identity',
      accessor: 'name',
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600 }}>{u.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (u) => (
        <span className="badge" style={{ background: '#f1f5f9', color: 'var(--navy)', fontWeight: 600 }}>
          {ROLE_LABELS[u.role] || u.role}
        </span>
      )
    },
    { header: 'Depot / Org Node', accessor: 'depot', render: (u) => u.depot || 'National / HQ' },
    { header: 'Mobile Number', accessor: 'mobile', render: (u) => u.mobile || '+91 98765 00000' },
    { header: 'Status', accessor: 'status', render: (u) => <StatusBadge status={u.status} /> },
    { header: 'Last Login', accessor: 'lastLogin' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (u) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            variant={u.status === 'LOCKED' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleToggleLock(u)}
          >
            {u.status === 'LOCKED' ? 'Unlock' : 'Lock'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              alert(`Temporary reset link dispatched to ${u.email}`);
            }}
          >
            Reset Pwd
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-users-page">
      <PageHeader
        title="Identity & Access Governance (IAM)"
        subtitle="Manage user credentials, RBAC role mappings, security lockouts, and enterprise directories"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Users' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ExportButton data={filtered} filename="CSD_User_Registry" />
            <Button onClick={() => setShowModal(true)}>+ Provision Enterprise User</Button>
          </div>
        }
      />

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✓ {actionSuccess}</div>
      )}

      <Card>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users by name, email..."
          filters={[
            {
              name: 'role',
              label: 'Role',
              value: roleFilter,
              onChange: (e) => setRoleFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Roles' },
                ...Object.entries(ROLE_LABELS).map(([val, lbl]) => ({ value: val, label: lbl }))
              ]
            },
            {
              name: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
                { value: 'LOCKED', label: 'Locked' }
              ]
            }
          ]}
        />

        <DataTable columns={columns} data={filtered} loading={loading} />
      </Card>

      {/* PROVISION USER MODAL */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Provision Enterprise User Account">
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Full Name"
            placeholder="e.g. Major Amit Verma"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <Input
            label="Official Email Address"
            type="email"
            placeholder="amit.verma@nic.in"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <Select
            label="System RBAC Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            options={Object.entries(ROLE_LABELS).map(([val, lbl]) => ({ value: val, label: lbl }))}
          />
          <Input
            label="Attached Base Depot / Organization"
            placeholder="e.g. Delhi Cantt Base Depot / Tata Motors Ltd"
            value={newUser.depot}
            onChange={(e) => setNewUser({ ...newUser, depot: e.target.value })}
          />
          <Input
            label="Official Mobile Number"
            placeholder="+91 98765 43210"
            value={newUser.mobile}
            onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create User & Dispatch Credentials</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
