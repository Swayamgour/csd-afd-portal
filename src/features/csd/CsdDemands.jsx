import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, FileText, Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import Select from '../../components/common/Select.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { demandService } from '../../services/demand.service.js';

export default function CsdDemands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [toast, setToast] = useState('');

  const loadDemands = async () => {
    setLoading(true);
    try {
      const data = await demandService.getDemands({
        status: statusFilter,
        search: searchTerm
      });
      setDemands(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemands();
  }, [statusFilter, searchTerm]);

  const handleApprove = async (id) => {
    try {
      await demandService.updateDemandStatus(id, 'Depot_Approved', 'Approved by Joint Director (CSD-HO)');
      setToast(`Demand ${id} successfully approved & sanctioned.`);
      if (selectedDemand) setSelectedDemand(null);
      loadDemands();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Demand ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    {
      header: 'Applicant',
      accessor: 'beneficiaryName',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.beneficiaryName}</span>
          <span className="micro muted">{row.serviceNumber}</span>
        </div>
      )
    },
    { header: 'Vehicle / Product', accessor: 'productName' },
    { header: 'Depot Allocation', accessor: 'depot' },
    {
      header: 'Sanction Price',
      accessor: 'csdPrice',
      render: (row) => <span className="font-bold">₹ {row.csdPrice?.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Scrutiny Actions',
      accessor: 'id',
      render: (row) => (
        <div className="row gap-1">
          <button
            type="button"
            className="btn sm out"
            onClick={() => setSelectedDemand(row)}
          >
            Inspect
          </button>
          {row.status !== 'Depot_Approved' && row.status !== 'Supply_Order_Issued' && row.status !== 'Delivered' && (
            <button
              type="button"
              className="btn sm"
              onClick={() => handleApprove(row.id)}
            >
              Sanction
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="csd-demands-page">
      <PageHeader
        title="National AFD Demand Sanction Directorate"
        subtitle="Review and grant departmental sanction on vehicle procurement demands submitted across all 34 depots."
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <FilterBar
        hasActiveFilters={statusFilter !== 'All' || !!searchTerm}
        onReset={() => {
          setStatusFilter('All');
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Demands</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Demand ID, Service No, or Model..."
            size="sm"
          />
        </div>

        <div className="w-48">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Submitted', label: 'Submitted' },
              { value: 'URC_Verified', label: 'URC Verified' },
              { value: 'Depot_Approved', label: 'Depot Approved' },
              { value: 'Payment_Completed', label: 'Payment Completed' },
              { value: 'Supply_Order_Issued', label: 'Supply Order Issued' }
            ]}
          />
        </div>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          data={demands}
          loading={loading}
          emptyTitle="No demands matching filter"
          emptyText="Try adjusting your status or search keywords."
        />
      </Card>

      {/* Inspect Modal */}
      {selectedDemand && (
        <Modal
          isOpen={!!selectedDemand}
          onClose={() => setSelectedDemand(null)}
          title={`Scrutiny Dossier · ${selectedDemand.id}`}
          subtitle={`Applicant: ${selectedDemand.beneficiaryName} (${selectedDemand.serviceNumber})`}
          maxWidth="560px"
          footer={
            <div className="modal-footer-btns">
              <Button variant="outline" onClick={() => setSelectedDemand(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleApprove(selectedDemand.id)}
              >
                Grant Departmental Sanction
              </Button>
            </div>
          }
        >
          <div className="info-kv-list">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Product & Variant:</span>
              <span className="font-semibold">{selectedDemand.productName} ({selectedDemand.variant})</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Regional Depot:</span>
              <span>{selectedDemand.depot}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Sanction Amount:</span>
              <span className="font-bold text-brand">₹ {selectedDemand.csdPrice?.toLocaleString('en-IN')}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Beneficiary Savings:</span>
              <span className="font-bold text-green">₹ {selectedDemand.savings?.toLocaleString('en-IN')}</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Current Lifecycle Status:</span>
              <StatusBadge status={selectedDemand.status} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
