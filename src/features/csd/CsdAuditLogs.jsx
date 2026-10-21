import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import { useGetAuditReportQuery } from '../admin/adminApi.js';

export default function CsdAuditLogs() {
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const queryParams = {
    limit: 50,
    ...(moduleFilter !== 'All' ? { module: moduleFilter } : {}),
    ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
    ...(searchTerm ? { q: searchTerm } : {}),
  };

  const { data: rawLogs = [], isLoading: loading } = useGetAuditReportQuery(queryParams);

  const rawList = Array.isArray(rawLogs) ? rawLogs : (Array.isArray(rawLogs?.items) ? rawLogs.items : []);
  const logs = rawList.map((l, idx) => ({
    id: l._id || l.id || `aud-${idx}`,
    action: l.action || 'MUTATION',
    user: l.userName || l.user || (typeof l.userId === 'object' ? l.userId?.name : 'Administrator'),
    role: l.role || (typeof l.userId === 'object' ? l.userId?.role : 'ADMIN'),
    module: l.entityType || l.module || 'SYSTEM',
    entity: l.entityId ? `${l.entityType || 'Entity'} #${String(l.entityId).slice(-6)}` : 'N/A',
    ip: l.ip || '127.0.0.1',
    status: l.status || 'Success',
    timestamp: l.timestamp || l.createdAt ? new Date(l.timestamp || l.createdAt).toLocaleString() : new Date().toLocaleString()
  }));

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
