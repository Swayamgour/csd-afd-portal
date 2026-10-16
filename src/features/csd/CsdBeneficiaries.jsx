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

  const columns = [
    {
      header: 'Service No.',
      accessor: 'serviceNumber',
      render: (row) => <span className="font-mono font-semibold text-brand">{row.serviceNumber}</span>
    },
    { header: 'Beneficiary Name', accessor: 'name', render: (row) => <span className="font-semibold">{row.name}</span> },
    { header: 'Rank & Arm', accessor: 'rank', render: (row) => <span className="small">{row.rank} ({row.service})</span> },
    { header: 'Pay Level', accessor: 'payLevel', render: (row) => <span className="small font-medium text-brand">{row.payLevel}</span> },
    { header: 'Depot Jurisdiction', accessor: 'depot' },
    {
      header: 'Entitlement Quota',
      accessor: 'eligibility',
      render: (row) => (
        <span className="badge-pill badge-success badge-sm">
          Car Cap: ₹ {(row.eligibility?.fourWheelerCap / 100000).toFixed(1)}L
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => setSelectedBeneficiary(row)}
        >
          View Entitlement
        </button>
      )
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
