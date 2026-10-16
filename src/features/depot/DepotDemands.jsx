import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import Select from '../../components/common/Select.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Button from '../../components/common/Button.jsx';
import { demandService } from '../../services/demand.service.js';

export default function DepotDemands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDepotSanction = async (id) => {
    try {
      await demandService.updateDemandStatus(id, 'Depot_Approved', 'Sanctioned by Regional Depot Manager');
      setToast(`Demand ${id} granted Depot Sanction. Awaiting beneficiary cyber treasury payment.`);
      loadDemands();
    } catch (e) {
      alert(e.message);
    }
  };

  const columns = [
    {
      header: 'Demand ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Applicant', accessor: 'beneficiaryName', render: (row) => <div><span className="font-semibold block">{row.beneficiaryName}</span><span className="micro muted">{row.serviceNumber}</span></div> },
    { header: 'Vehicle / Item', accessor: 'productName' },
    { header: 'Allotted Dealer', accessor: 'dealer' },
    { header: 'Sanction Price', accessor: 'csdPrice', render: (row) => <span className="font-bold">₹ {row.csdPrice?.toLocaleString('en-IN')}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Sanction Action',
      accessor: 'id',
      render: (row) =>
        row.status !== 'Depot_Approved' && row.status !== 'Supply_Order_Issued' && row.status !== 'Delivered' ? (
          <Button
            size="sm"
            variant="primary"
            icon={ShieldCheck}
            onClick={() => handleDepotSanction(row.id)}
          >
            Grant Sanction
          </Button>
        ) : (
          <span className="small text-green font-semibold">● Sanctioned</span>
        )
    }
  ];

  return (
    <div className="depot-demands-page">
      <PageHeader
        title="Regional Depot Demands & Sanctions"
        subtitle="Validate URC-verified applications and grant statutory Depot Sanction Certificates"
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
              { value: 'Payment_Pending', label: 'Payment Pending' },
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
        />
      </Card>
    </div>
  );
}
