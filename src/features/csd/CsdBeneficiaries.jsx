import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Eye, Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import Select from '../../components/common/Select.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { userService } from '../../services/user.service.js';
import { ROLES } from '../../permissions/roles.js';

export default function CsdBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await userService.getUsers({ role: ROLES.BENEFICIARY, search: searchTerm });
        setBeneficiaries(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchTerm]);

  const handleApprove = async (row) => {
    try {
      await userService.approveBeneficiaryUser(row.id, 'APPROVED', 'Approved by CSD Nodal Officer');
      const list = await userService.getUsers({ role: ROLES.BENEFICIARY, search: searchTerm });
      setBeneficiaries(list);
    } catch (err) {
      alert(err.message || 'Failed to approve');
    }
  };

  const handleReject = async (row) => {
    const reason = window.prompt('Reason for rejection:', 'Canteen grocery card details unverified') || 'Rejected by CSD officer';
    try {
      await userService.approveBeneficiaryUser(row.id, 'REJECTED', reason);
      const list = await userService.getUsers({ role: ROLES.BENEFICIARY, search: searchTerm });
      setBeneficiaries(list);
    } catch (err) {
      alert(err.message || 'Failed to reject');
    }
  };

  const columns = [
    {
      header: 'Service / Card No.',
      accessor: 'serviceNumber',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-brand">{row.serviceNumber || row.cardId || row.username}</span>
          {row.cardId && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Card: {row.cardId}</div>}
        </div>
      )
    },
    { header: 'Beneficiary Name', accessor: 'name', render: (row) => <span className="font-semibold">{row.name}</span> },
    {
      header: 'Email & Verification',
      accessor: 'email',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.82rem' }}>{row.email || 'N/A'}</div>
          {row.isEmailVerified ? (
            <span className="badge-pill badge-success badge-sm" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem' }}>
              ✓ Email Verified (OTP)
            </span>
          ) : (
            <span className="badge-pill badge-sm" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem' }}>
              Unverified
            </span>
          )}
        </div>
      )
    },
    { header: 'Rank & Arm', accessor: 'rank', render: (row) => <span className="small">{row.rank || 'Armed Forces Member'} ({row.service || row.organization || 'Defence'})</span> },
    { header: 'Pay Level', accessor: 'payLevel', render: (row) => <span className="small font-medium text-brand">{row.payLevel || 'Level 1'}</span> },
    {
      header: 'Approval Status',
      accessor: 'adminApproval',
      render: (row) => {
        const isApproved = row.status === 'Active' || row.adminApproval === 'APPROVED' || row.verificationStatus === 'APPROVED' || row.verificationStatus === 'VERIFIED';
        const isRejected = row.status === 'Rejected' || row.adminApproval === 'REJECTED' || row.verificationStatus === 'REJECTED';
        return (
          <span
            className={`badge-pill ${isApproved ? 'badge-success' : isRejected ? 'badge-danger' : 'badge-warning'} badge-sm`}
            style={{ fontWeight: 600, fontSize: '0.75rem' }}
          >
            {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => {
        const isPending = row.status === 'Pending' || row.adminApproval === 'PENDING' || row.verificationStatus === 'PENDING';
        return (
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            {isPending && (
              <>
                <button
                  type="button"
                  className="btn sm"
                  style={{ background: '#16a34a', color: '#fff', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: 'none' }}
                  onClick={() => handleApprove(row)}
                  title="Approve Beneficiary Registration"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn sm out"
                  style={{ borderColor: '#dc2626', color: '#dc2626', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                  onClick={() => handleReject(row)}
                  title="Reject Beneficiary Registration"
                >
                  Reject
                </button>
              </>
            )}
            <button
              type="button"
              className="btn sm out"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              onClick={() => setSelectedBeneficiary(row)}
            >
              Details
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="csd-beneficiaries-page">
      <PageHeader
        title="Armed Forces Beneficiary Registry"
        subtitle="National database of service personnel, pensioners, and entitled dependents with SPARSH / e-PPO synchronization."
      />

      <FilterBar
        hasActiveFilters={!!searchTerm}
        onReset={() => setSearchTerm('')}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Beneficiaries</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Service Number, PAN, or Name..."
            size="sm"
          />
        </div>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          data={beneficiaries}
          loading={loading}
          emptyTitle="No beneficiaries located"
          emptyText="Try searching by full Service Number (e.g. JC-765432X)."
        />
      </Card>

      {selectedBeneficiary && (
        <Modal
          isOpen={!!selectedBeneficiary}
          onClose={() => setSelectedBeneficiary(null)}
          title={`Beneficiary Entitlement Record · ${selectedBeneficiary.name}`}
          subtitle={`Service No: ${selectedBeneficiary.serviceNumber} · ${selectedBeneficiary.rank}`}
          maxWidth="560px"
          footer={
            <Button variant="outline" onClick={() => setSelectedBeneficiary(null)}>
              Close
            </Button>
          }
        >
          <div className="info-kv-list">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Permanent Account Number (PAN):</span>
              <span className="font-mono font-semibold">{selectedBeneficiary.panNumber}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Entitlement Category:</span>
              <span className="font-bold text-brand">{selectedBeneficiary.eligibility?.category}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Four-Wheeler Financial Ceiling:</span>
              <span className="font-bold text-ink">₹ {selectedBeneficiary.eligibility?.fourWheelerCap?.toLocaleString('en-IN')}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Purchase Periodicity:</span>
              <span>Once every {selectedBeneficiary.eligibility?.fourWheelerIntervalYears} years</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Next Car Booking Window:</span>
              <span className="font-semibold text-green">{selectedBeneficiary.eligibility?.nextFourWheelerEligibleDate}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Two-Wheeler Quota:</span>
              <span className="text-green font-semibold">● Eligible (Every 3 years)</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Statutory Entitlement Note:</span>
              <span className="small muted">{selectedBeneficiary.eligibility?.reason}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
