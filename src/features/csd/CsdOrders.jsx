import React, { useState, useEffect } from 'react';
import { Truck, Download, Eye, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import { orderService } from '../../services/order.service.js';

export default function CsdOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({
        status: statusFilter,
        search: searchTerm
      });
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchTerm]);

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Beneficiary', accessor: 'beneficiaryName', render: (row) => <div><span className="font-semibold block">{row.beneficiaryName}</span><span className="micro muted">{row.serviceNumber}</span></div> },
    { header: 'Vehicle / Item', accessor: 'productName' },
    { header: 'OEM Manufacturer', accessor: 'brand' },
    { header: 'Dealership', accessor: 'dealer' },
    { header: 'Chassis / VIN', accessor: 'chassisNumber', render: (row) => <span className="font-mono small">{row.chassisNumber || 'In Allocation'}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Certified Order',
      accessor: 'id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => alert(`Downloading Certified Supply Order PDF: ${row.id}`)}
        >
          <Download size={13} />
          <span>PDF</span>
        </button>
      )
    }
  ];

  return (
    <div className="csd-orders-page">
      <PageHeader
        title="National Supply Orders Directory"
        subtitle="Oversight of digital supply orders issued to OEMs and dealerships across India"
      />

      <FilterBar
        hasActiveFilters={statusFilter !== 'All' || !!searchTerm}
        onReset={() => {
          setStatusFilter('All');
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Supply Orders</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by SO number, Chassis, or Dealer..."
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
              { value: 'In_Transit', label: 'In Transit' },
              { value: 'Allocated', label: 'Allocated' },
              { value: 'Ready_For_Delivery', label: 'Ready For Delivery' },
              { value: 'Delivered', label: 'Delivered' }
            ]}
          />
        </div>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
        />
      </Card>
    </div>
  );
}
