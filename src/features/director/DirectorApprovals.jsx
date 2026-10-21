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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#3730a3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              {(u.name || 'B').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                {u.name || 'Unknown Beneficiary'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#1e40af' }}>{b.rank || u.rank || 'Armed Forces'}</span>
                <span>•</span>
                <span>{b.serviceNumber || u.serviceNumber || 'No Svc No'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
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
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#334155' }}>
              <CreditCard size={14} color="#0284c7" />
              <span>Card: {b.cardId || u.cardId || 'Not Assigned'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Chip: {b.chipNumber || u.chipNumber || 'N/A'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
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
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>
            <div>{u.email || 'No email registered'}</div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.mobile || u.phone || 'No phone'}</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
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
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a'
                }}
              >
                <Clock size={12} /> Awaiting CS Director
              </span>
            ) : isApproved ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #bbf7d0'
                }}
              >
                <CheckCircle size={12} /> Approved / Verified
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca'
                }}
              >
                <UserX size={12} /> Rejected
              </span>
            )}
            {u.remarks && (
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.remarks}>
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
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 1. APPROVE BUTTON */}
            {isPending && (
              <Button
                size="sm"
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(22, 163, 74, 0.25)'
                }}
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
                style={{
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.6rem',
                  fontWeight: 600,
                  borderRadius: '6px'
                }}
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
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.55rem',
                  fontWeight: 600,
                  borderRadius: '6px'
                }}
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
              className="circle"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
                background: '#eff6ff',
                color: '#1d4ed8',
                cursor: 'pointer'
              }}
              title="Edit Beneficiary Details & Service Records"
              onClick={() => setSelectedUserForEdit(u)}
            >
              <Edit2 size={14} />
            </button>

            {/* 4. INSPECT BUTTON */}
            <button
              type="button"
              className="circle"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#475569',
                cursor: 'pointer'
              }}
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
    <div className="director-approvals-page" style={{ paddingBottom: '2.5rem' }}>
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
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.88rem'
          }}
        >
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      {/* <PageHeader
        title="CS Director: Registration Approvals & User Records"
        subtitle="Exclusive authority desk for vetting new beneficiary registrations, verifying armed forces credentials, and editing user profiles."
        breadcrumbs={[
          { label: 'CS Directorate', href: '/director/approvals' },
          { label: 'Approvals & Record Management' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm"
              //  onClick={fetchBeneficiaries}
              disabled={loading}>
              <RefreshCw size={14} style={{ marginRight: '0.35rem', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Refreshing...' : 'Refresh Queue'}
            </Button>
          </div>
        }
      /> */}

      {/* CS Director Official Authority Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1f3a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={20} color="#60a5fa" />
            <span style={{ fontWeight: 800, letterSpacing: '0.04em', fontSize: '1rem' }}>
              CANTEEN STORES DEPARTMENT • DIRECTORATE DESK
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '750px', lineHeight: 1.4 }}>
            Under revised CSD portal guidelines, <strong>all newly registered users require authorization exclusively by the CS Director</strong> before demand generation is enabled. System administrators possess view-only oversight.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.25rem', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>Pending Actions</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fef08a' }}>{metrics.pending}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>Total Verified</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#86efac' }}>{metrics.approved}</div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard
          title="Pending Approvals"
          value={String(metrics.pending)}
          subtitle={metrics.pending > 0 ? 'Requires CS Director Action' : 'All Clear'}
          isPositive={metrics.pending === 0}
          style={{ borderColor: metrics.pending > 0 ? '#f59e0b' : undefined }}
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
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> records
          </div>
        }
      >
        {/* Tabs and Filters */}
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
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: active ? '#0b1f3a' : '#cbd5e1',
                    background: active ? '#0b1f3a' : '#fff',
                    color: active ? '#fff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      background: active ? 'rgba(255,255,255,0.25)' : (tab.alert ? '#fee2e2' : '#f1f5f9'),
                      color: active ? '#fff' : (tab.alert ? '#dc2626' : '#64748b'),
                      fontWeight: 700
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search name, svc no, card, email..."
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
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
          <form onSubmit={handleConfirmReject}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Primary Reason for Rejection *
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Service records mismatch with Armed Forces database">Service records mismatch with Armed Forces database</option>
                <option value="CSD smart canteen card invalid or expired">CSD smart canteen card invalid or expired</option>
                <option value="Incomplete or unverified identity documentation">Incomplete or unverified identity documentation</option>
                <option value="Entitlement category does not match rank/pay level">Entitlement category does not match rank/pay level</option>
                <option value="Duplicate beneficiary account detected">Duplicate beneficiary account detected</option>
                <option value="Other administrative grounds">Other administrative grounds</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Additional Remarks / Correction Instructions for Beneficiary
              </label>
              <textarea
                rows={3}
                value={rejectCustomRemarks}
                onChange={(e) => setRejectCustomRemarks(e.target.value)}
                placeholder="Explain the required documents or correction so the user can rectify and re-apply..."
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" type="button" onClick={() => setRejectModalUser(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
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
