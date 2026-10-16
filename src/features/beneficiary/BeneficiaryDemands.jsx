import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import Select from '../../components/common/Select.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import { demandService } from '../../services/demand.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function BeneficiaryDemands() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadDemands = async () => {
    setLoading(true);
    try {
      const data = await demandService.getDemands({
        role: 'beneficiary',
        userId: user?.id,
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

  const columns = [
    {
      header: 'Demand ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Vehicle / Item', accessor: 'productName' },
    { header: 'Variant', accessor: 'variant', render: (row) => <span className="small muted">{row.variant}</span> },
    {
      header: 'CSD Price',
      accessor: 'csdPrice',
      render: (row) => (
        <div>
          <span className="font-bold">₹ {row.csdPrice?.toLocaleString('en-IN')}</span>
          {row.savings && (
            <span className="micro text-green block">Saved ₹ {row.savings?.toLocaleString('en-IN')}</span>
          )}
        </div>
      )
    },
    { header: 'Regional Depot', accessor: 'depot' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <Link to={`/beneficiary/demands/${row.id}`} className="btn sm out">
          <Eye size={14} />
          <span>Details</span>
        </Link>
      )
    }
  ];

  return (
    <div className="beneficiary-demands-page">
      <PageHeader
        title="My AFD Demands"
        subtitle="Track submitted vehicle demands, depot sanctions, treasury payments, and supply order releases."
        actions={
          <Link to="/products" className="btn btn-primary font-bold">
            <PlusCircle size={16} />
            <span>New Demand</span>
          </Link>
        }
      />

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
            placeholder="Search by ID or product..."
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
              { value: 'Supply_Order_Issued', label: 'Supply Order Issued' },
              { value: 'Delivered', label: 'Delivered' }
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
          emptyText="Try adjusting your status filter or keyword search."
        />
      </Card>
    </div>
  );
}
export default BeneficiaryDemands;
