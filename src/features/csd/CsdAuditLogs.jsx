import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import { auditService } from '../../services/audit.service.js';

export default function CsdAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getAuditLogs({
        module: moduleFilter,
        status: statusFilter,
        search: searchTerm
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [moduleFilter, statusFilter, searchTerm]);

  const columns = [
    {
      header: 'Audit ID',
      accessor: 'id',
      render: (row) => <span className="font-mono font-semibold text-brand">{row.id}</span>
    },
    {
      header: 'User & Role',
      accessor: 'user',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.user}</span>
          <span className="micro muted">{row.role}</span>
        </div>
      )
    },
    {
      header: 'Action Taken',
      accessor: 'action',
      render: (row) => <span className="badge-pill badge-primary badge-sm font-mono">{row.action}</span>
    },
    { header: 'System Module', accessor: 'module' },
    { header: 'Target Entity', accessor: 'entity', render: (row) => <span className="small font-medium">{row.entity}</span> },
    { header: 'Timestamp', accessor: 'timestamp', render: (row) => <span className="small muted">{row.timestamp}</span> },
    { header: 'Origin IP', accessor: 'ip', render: (row) => <span className="font-mono small">{row.ip}</span> },
    {
      header: 'Audit Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="csd-audit-logs-page">
      <PageHeader
        title="Departmental Audit Logs (Read-Only)"
        subtitle="Immutable electronic trail of administrative actions, price sanction approvals, and quota authorizations"
      />

      <FilterBar
        hasActiveFilters={moduleFilter !== 'All' || statusFilter !== 'All' || !!searchTerm}
        onReset={() => {
          setModuleFilter('All');
          setStatusFilter('All');
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Audit Trail</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by User, Action, or Target Entity..."
            size="sm"
          />
        </div>

        <div className="w-48">
          <Select
            label="Module"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Modules' },
              { value: 'Products', label: 'Products & Pricing' },
              { value: 'Demands', label: 'Demands & Allocation' },
              { value: 'Orders', label: 'Orders & Inventory' },
              { value: 'Access', label: 'Access Control' },
              { value: 'Authentication', label: 'Authentication' }
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
              { value: 'Success', label: 'Success' },
              { value: 'Failed', label: 'Failed' }
            ]}
          />
        </div>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
        />
      </Card>
    </div>
  );
}
