import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, UserCheck, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import Select from '../../components/common/Select.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserStatusMutation } from '../admin/adminApi.js';
import { ROLE_LABELS, ROLES } from '../../permissions/roles.js';

export default function CsdUsers() {
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState('');

  const queryParams = {
    ...(roleFilter !== 'All' ? { role: roleFilter } : {}),
    ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
    ...(searchTerm ? { q: searchTerm } : {}),
  };

  const { data: rawUsers = [], isLoading: loading, refetch: refetchUsers } = useGetUsersQuery(queryParams);
  const [createUser] = useCreateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const [newUserData, setNewUserData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: ROLES.DEPOT,
    designation: '',
    department: ''
  });

  const rawList = Array.isArray(rawUsers) ? rawUsers : (Array.isArray(rawUsers?.items) ? rawUsers.items : []);
  const users = rawList.map((u, idx) => ({
    id: u._id || u.id || `usr-${idx}`,
    name: u.name || 'Official User',
    username: u.username || u.email || 'N/A',
    email: u.email || 'N/A',
    phone: u.mobile || u.phone || 'N/A',
    role: u.role || ROLES.DEPOT,
    depot: u.depotId?.name || (typeof u.depotId === 'string' ? u.depotId : 'National Depot HQ'),
    status: u.status === 'ACTIVE' || u.status === 'Active' ? 'Active' : 'Inactive',
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2024-01-01',
  }));

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        name: newUserData.name,
        email: newUserData.email,
        mobile: newUserData.phone.replace(/[^0-9]/g, '').slice(-10),
        role: newUserData.role,
      }).unwrap();
      setCreateModalOpen(false);
      setToast('New portal user created and credentials dispatched.');
      setNewUserData({ name: '', username: '', email: '', phone: '', role: ROLES.DEPOT, designation: '', department: '' });
      refetchUsers();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to create user');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const nextStatus = user.status === 'Active' ? 'INACTIVE' : 'ACTIVE';
      await updateUserStatus({ id: user.id, status: nextStatus }).unwrap();
      setToast(`User ${user.name} status updated.`);
      refetchUsers();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to update user status');
    }
  };

  const columns = [
    {
      header: 'User ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    {
      header: 'Name & Designation',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.name}</span>
          <span className="micro muted">{row.designation || row.rank || 'Officer'}</span>
        </div>
      )
    },
    {
      header: 'Role Authority',
      accessor: 'role',
      render: (row) => (
        <span className="badge-pill badge-primary badge-sm">
          {ROLE_LABELS[row.role] || row.role}
        </span>
      )
    },
    { header: 'Email / Contact', accessor: 'email', render: (row) => <span className="small">{row.email}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <div className="row gap-1">
          <button
            type="button"
            className="btn sm out"
            onClick={() => setSelectedUser(row)}
          >
            Details
          </button>
          <button
            type="button"
            className={`btn sm ${row.status === 'Active' ? 'ghost text-danger' : 'out text-green'}`}
            onClick={() => toggleUserStatus(row)}
          >
            {row.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="csd-users-page">
      <PageHeader
        title="Enterprise User Management"
        subtitle="Manage official roles, security clearances, and operational access across the CSD AFD ecosystem."
        actions={
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Official User
          </Button>
        }
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <FilterBar
        hasActiveFilters={roleFilter !== 'All' || statusFilter !== 'All' || !!searchTerm}
        onReset={() => {
          setRoleFilter('All');
          setStatusFilter('All');
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label">Search Users</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, email, or user ID..."
            size="sm"
          />
        </div>

        <div className="w-48">
          <Select
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Roles' },
              ...Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))
            ]}
          />
        </div>

        <div className="w-36">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Deactivated', label: 'Deactivated' }
            ]}
          />
        </div>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="No users found"
          emptyText="No user accounts match the current filter criteria."
        />
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`User Dossier · ${selectedUser.name}`}
          subtitle={`ID: ${selectedUser.id} · Role: ${ROLE_LABELS[selectedUser.role]}`}
          maxWidth="520px"
          footer={
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close Dossier
            </Button>
          }
        >
          <div className="info-kv-list">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">User ID:</span>
              <span className="font-mono font-semibold">{selectedUser.id}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Username:</span>
              <span className="font-mono">{selectedUser.username}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Role Authority:</span>
              <span className="font-bold text-brand">{ROLE_LABELS[selectedUser.role]}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Email:</span>
              <span>{selectedUser.email}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Phone:</span>
              <span>{selectedUser.phone}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Assigned Depot / Unit:</span>
              <span>{selectedUser.depot || selectedUser.department || 'National HQ'}</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Account Status:</span>
              <StatusBadge status={selectedUser.status} />
            </div>
          </div>
        </Modal>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision New Official User"
        subtitle="Assign portal authority to Departmental Official, Depot Manager, or URC Officer"
        maxWidth="540px"
        footer={
          <div className="modal-footer-btns">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateUser}>
              Provision User
            </Button>
          </div>
        }
      >
        <div className="create-user-form">
          <Input
            id="newUserName"
            label="Full Name"
            placeholder="e.g. Lt. Col. R. K. Singh"
            value={newUserData.name}
            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
            required
            className="mb-2"
          />

          <Select
            label="Portal Role"
            value={newUserData.role}
            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
            options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            required
            className="mb-2"
          />

          <div className="row gap-1 mb-2">
            <div className="flex-1">
              <Input
                id="newUserEmail"
                label="Official Email"
                placeholder="officer@gov.in"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                id="newUserPhone"
                label="Mobile Number"
                placeholder="+91 98765 00000"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <Input
            id="newUserDesig"
            label="Designation / Branch"
            placeholder="e.g. Regional Depot Manager / Accounts Desk"
            value={newUserData.designation}
            onChange={(e) => setNewUserData({ ...newUserData, designation: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
