import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { ExportButton } from '../../components/common/ExportButton';

export const AdminReports = () => {
  const tenantUsage = [
    { depot: 'Delhi Cantt Base Depot', activeUsers: 642, demandsProcessed: 1420, ordersDelivered: 1210, storageUsed: '4.2 GB' },
    { depot: 'Mumbai Base Depot', activeUsers: 512, demandsProcessed: 980, ordersDelivered: 890, storageUsed: '3.1 GB' },
    { depot: 'Chandigarh Base Depot', activeUsers: 480, demandsProcessed: 1120, ordersDelivered: 990, storageUsed: '3.8 GB' },
    { depot: 'Kolkata Depot', activeUsers: 310, demandsProcessed: 620, ordersDelivered: 540, storageUsed: '2.0 GB' },
    { depot: 'Bengaluru Depot', activeUsers: 290, demandsProcessed: 590, ordersDelivered: 510, storageUsed: '1.9 GB' }
  ];

  const columns = [
    { header: 'Depot / Tenant Node', accessor: 'depot', render: (t) => <strong>{t.depot}</strong> },
    { header: 'Active Users', accessor: 'activeUsers' },
    { header: 'Demands Processed', accessor: 'demandsProcessed' },
    { header: 'Orders Delivered', accessor: 'ordersDelivered' },
    { header: 'Document Storage Used', accessor: 'storageUsed' }
  ];

  return (
    <div className="admin-reports-page">
      <PageHeader
        title="System Capacity & Operational MIS Reports"
        subtitle="Cross-tenant load distribution, transaction throughput, and storage consumption analytics"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Reports' }
        ]}
        actions={<ExportButton data={tenantUsage} filename="Tenant_Capacity_Report" />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="System Utilization" value="48.2%" subtitle="Peak IOPS: 1,820" />
        <StatCard title="Database Storage" value="182 GB" subtitle="Allocated: 500 GB" />
        <StatCard title="Document Blob Vault" value="42.6 GB" subtitle="Encrypted AES-256" />
        <StatCard title="Total Transactions" value="4,730" subtitle="This Month" />
      </div>

      <Card title="Depot Tenant Activity & Consumption">
        <DataTable columns={columns} data={tenantUsage} />
      </Card>
    </div>
  );
};
