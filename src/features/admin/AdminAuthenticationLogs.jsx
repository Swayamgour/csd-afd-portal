import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { FilterBar } from '../../components/common/FilterBar';
import { ExportButton } from '../../components/common/ExportButton';

export const AdminAuthenticationLogs = () => {
  const [search, setSearch] = useState('');

  const authLogs = [
    { id: 'AUTH-9901', user: 'admin@csdindia.gov.in', method: 'Password + OTP', ip: '10.0.12.4', location: 'New Delhi, India', userAgent: 'Chrome 128 / Windows', status: 'SUCCESS', time: '14 Oct 2024, 11:30:12' },
    { id: 'AUTH-9900', user: 'csd.ho@csdindia.gov.in', method: 'Password + OTP', ip: '10.0.12.8', location: 'New Delhi, India', userAgent: 'Edge 126 / Windows', status: 'SUCCESS', time: '14 Oct 2024, 11:12:00' },
    { id: 'AUTH-9899', user: 'depot.delhi@csdindia.gov.in', method: 'Password + OTP', ip: '14.139.58.12', location: 'Delhi Cantt, India', userAgent: 'Firefox 125 / Linux', status: 'SUCCESS', time: '14 Oct 2024, 10:45:33' },
    { id: 'AUTH-9898', user: 'unknown.intruder@proton.me', method: 'Password (Invalid)', ip: '185.220.101.5', location: 'Tor Exit Node / Frankfurt', userAgent: 'Python-requests/2.31', status: 'FAILED_BLOCKED', time: '14 Oct 2024, 10:05:14' },
    { id: 'AUTH-9897', user: 'subedar.singh@army.mil', method: 'Password + SMS OTP', ip: '152.57.12.90', location: 'Chandigarh, India', userAgent: 'Safari Mobile / iOS 17', status: 'SUCCESS', time: '14 Oct 2024, 09:30:45' }
  ];

  const columns = [
    { header: 'Session Ref', accessor: 'id', render: (a) => <strong>{a.id}</strong> },
    { header: 'Authenticated Identity', accessor: 'user' },
    { header: 'Auth Method', accessor: 'method' },
    { header: 'Client IP Address', accessor: 'ip', render: (a) => <span className="font-mono">{a.ip}</span> },
    { header: 'Geolocation', accessor: 'location' },
    { header: 'Client User-Agent', accessor: 'userAgent', render: (a) => <span className="portal-subtext-muted fs-xs">{a.userAgent}</span> },
    {
      header: 'Outcome',
      accessor: 'status',
      render: (a) => (
        <span className={a.status === 'SUCCESS' ? 'badge-success-subtle-sm' : 'badge-danger-subtle-sm'}>
          {a.status}
        </span>
      )
    },
    { header: 'Timestamp', accessor: 'time' }
  ];

  const filtered = authLogs.filter(a =>
    !search ||
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.ip.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-auth-logs-page">
      <PageHeader
        title="Authentication & Session Audit Records"
        subtitle="MFA verification telemetry, token grants, failed challenge audits, and geographical anomaly monitoring"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Authentication Logs' }
        ]}
        actions={<ExportButton data={filtered} filename="Authentication_Audit_Logs" />}
      />

      <Card>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search authentication logs by user email, IP, or location..."
        />
        <DataTable columns={columns} data={filtered} />
      </Card>
    </div>
  );
};
