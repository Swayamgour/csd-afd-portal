import React, { useState, useEffect } from 'react';
import { History, Search, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import { useGetAuthReportQuery } from '../admin/adminApi.js';

export default function CsdLoginHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  const queryParams = {
    limit: 50,
    ...(searchTerm ? { q: searchTerm } : {}),
  };

  const { data: rawLogs = [], isLoading: loading } = useGetAuthReportQuery(queryParams);

  const rawList = Array.isArray(rawLogs) ? rawLogs : (Array.isArray(rawLogs?.items) ? rawLogs.items : []);
  const logs = rawList.map((l, idx) => ({
    id: l._id || l.id || `ses-${idx}`,
    username: l.identifier || l.username || (typeof l.userId === 'object' ? l.userId?.username : 'user@csd.gov.in'),
    name: typeof l.userId === 'object' ? (l.userId?.name || l.userId?.username) : (l.name || l.identifier || 'User'),
    role: typeof l.userId === 'object' ? l.userId?.role : (l.role || 'USER'),
    loginMethod: l.strategy || l.event || 'Password + OTP',
    timestamp: l.at || l.createdAt ? new Date(l.at || l.createdAt).toLocaleString() : new Date().toLocaleString(),
    ip: l.ip || '127.0.0.1',
    status: l.success ? 'Success' : 'Failed',
  }));

  const columns = [
    {
      header: 'Session Ref',
      accessor: 'id',
      render: (row) => <span className="font-mono font-semibold text-brand">{row.id}</span>
    },
    { header: 'Account / Service No.', accessor: 'username', render: (row) => <span className="font-semibold">{row.username}</span> },
    { header: 'Account Holder', accessor: 'name' },
    { header: 'Role Authority', accessor: 'role' },
    { header: 'Authentication Method', accessor: 'loginMethod' },
    { header: 'Login Timestamp', accessor: 'timestamp', render: (row) => <span className="small muted">{row.timestamp}</span> },
    { header: 'Origin IP / ISP', accessor: 'ip', render: (row) => <span className="font-mono small">{row.ip}</span> },
    {
      header: 'Outcome',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="csd-login-history-page">
      <PageHeader
        title="Authentication & Session History"
        subtitle="Security monitor tracking authorized logins, 2FA OTP validations, and automated brute-force IP blocks"
      />

      <FilterBar
        hasActiveFilters={!!searchTerm}
        onReset={() => setSearchTerm('')}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Logins</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Service No, Name, or IP address..."
            size="sm"
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
