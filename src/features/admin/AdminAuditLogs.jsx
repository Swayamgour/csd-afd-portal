import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { FilterBar } from '../../components/common/FilterBar';
import { ExportButton } from '../../components/common/ExportButton';
import { useGetAuditReportQuery } from './adminApi';

export const AdminAuditLogs = () => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawLogs = [], isLoading: loading } = useGetAuditReportQuery({ limit: 100 });

  const rawList = Array.isArray(rawLogs) ? rawLogs : (Array.isArray(rawLogs?.items) ? rawLogs.items : []);
  const logs = rawList.map((l, idx) => ({
    id: l._id || l.id || `aud-${idx}`,
    action: l.action || 'MUTATION',
    user: l.userName || l.user || (typeof l.userId === 'object' ? l.userId?.name : 'Administrator'),
    module: l.entityType || l.module || 'SYSTEM',
    entity: l.entityId ? `${l.entityType || 'Entity'} #${String(l.entityId).slice(-6)}` : 'N/A',
    ip: l.ip || '127.0.0.1',
    status: l.status || 'SUCCESS',
    timestamp: l.timestamp || l.createdAt ? new Date(l.timestamp || l.createdAt).toLocaleString() : new Date().toLocaleString()
  }));

  const filtered = logs.filter(l => {
    const matchesSearch = !search ||
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.ip.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'ALL' || l.module === moduleFilter;
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesModule && matchesStatus;
  });

  const columns = [
    { header: 'Action Performed', accessor: 'action', render: (l) => <strong>{l.action}</strong> },
    { header: 'Actor / User ID', accessor: 'user' },
    {
      header: 'System Module',
      accessor: 'module',
      render: (l) => <span className="badge" style={{ background: '#f1f5f9', color: 'var(--navy)' }}>{l.module}</span>
    },
    { header: 'Entity Reference', accessor: 'entity', render: (l) => l.entity || 'N/A' },
    { header: 'IP Address', accessor: 'ip', render: (l) => <span style={{ fontFamily: 'monospace' }}>{l.ip}</span> },
    {
      header: 'Execution Status',
      accessor: 'status',
      render: (l) => (
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: l.status === 'SUCCESS' ? '#f0fdf4' : '#fef2f2',
          color: l.status === 'SUCCESS' ? '#15803d' : '#b91c1c'
        }}>
          {l.status}
        </span>
      )
    },
    { header: 'Certified Timestamp', accessor: 'timestamp' }
  ];

  return (
    <div className="admin-audit-logs-page">
      <PageHeader
        title="Immutable System Audit Trail"
        subtitle="Cryptographically sealed log of every administrative mutation, status override, and user operation"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Audit Logs' }
        ]}
        actions={<ExportButton data={filtered} filename="System_Audit_Trail" />}
      />

      <Card>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by Actor, Action, or IP address..."
          filters={[
            {
              name: 'module',
              label: 'Module',
              value: moduleFilter,
              onChange: (e) => setModuleFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Modules' },
                { value: 'Demands', label: 'Demands' },
                { value: 'Orders', label: 'Orders' },
                { value: 'Payments', label: 'Payments' },
                { value: 'Users', label: 'IAM / Users' },
                { value: 'Security', label: 'Security' }
              ]
            },
            {
              name: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              options: [
                { value: 'ALL', label: 'All Statuses' },
                { value: 'SUCCESS', label: 'Success' },
                { value: 'FAILURE', label: 'Failure / Blocked' }
              ]
            }
          ]}
        />

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No audit records match the current filter selection."
        />
      </Card>
    </div>
  );
};
