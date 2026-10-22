import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { ExportButton } from '../../components/common/ExportButton';
import { FilterBar } from '../../components/common/FilterBar';

export const HelpdeskReports = () => {
  const [tierFilter, setTierFilter] = useState('ALL');

  const reportData = [
    { tier: 'Level 1: Helpdesk Frontline', received: 1420, resolved: 1190, escalated: 230, avgTime: '3.4 Hours', slaCompliance: '96.2%' },
    { tier: 'Level 2: Technical Gateway', received: 340, resolved: 295, escalated: 45, avgTime: '11.8 Hours', slaCompliance: '91.5%' },
    { tier: 'Level 3: Core Database & OEM', received: 85, resolved: 72, escalated: 13, avgTime: '28.4 Hours', slaCompliance: '88.0%' },
    { tier: 'Level 4: CSD HQ Executive', received: 18, resolved: 17, escalated: 1, avgTime: '42.0 Hours', slaCompliance: '94.4%' }
  ];

  const columns = [
    { header: 'Escalation Tier', accessor: 'tier', render: (r) => <strong>{r.tier}</strong> },
    { header: 'Incidents Received', accessor: 'received' },
    { header: 'Resolved Internally', accessor: 'resolved' },
    { header: 'Escalated Further', accessor: 'escalated' },
    { header: 'Avg Resolution Time', accessor: 'avgTime' },
    {
      header: 'SLA Compliance Rate',
      accessor: 'slaCompliance',
      render: (r) => <span className="sla-compliant-text">{r.slaCompliance}</span>
    }
  ];

  return (
    <div className="helpdesk-reports-page">
      <PageHeader
        title="Helpdesk SLA & Grievance MIS Analytics"
        subtitle="Turnaround performance, tier resolution metrics, and citizen satisfaction indicators"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Reports' }
        ]}
        actions={<ExportButton data={reportData} filename="Helpdesk_SLA_Performance" />}
      />

      <div className="csd-kpi-grid mb-md">
        <StatCard title="Overall SLA Compliance" value="94.8%" change="+1.2%" isPositive={true} subtitle="Target: >=92%" />
        <StatCard title="Total Tickets Handled" value="1,863" subtitle="This Quarter" />
        <StatCard title="First Contact Resolution" value="63.8%" subtitle="L1 Frontline Closure" />
        <StatCard title="Average Resolution" value="8.4 hrs" subtitle="All Tiers Combined" />
      </div>

      <Card title="Grievance Tier Breakdown">
        <DataTable columns={columns} data={reportData} />
      </Card>
    </div>
  );
};
