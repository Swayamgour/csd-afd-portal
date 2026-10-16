import React, { useState, useEffect } from 'react';
import { History, Search, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import { auditService } from '../../services/audit.service.js';

export default function CsdLoginHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getAuthLogs({ search: searchTerm });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchTerm]);

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
