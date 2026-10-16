import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { auditService } from '../../services/audit.service';
import { userService } from '../../services/user.service';

export const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logRes, userRes] = await Promise.all([
        auditService.getAuditLogs({ limit: 5 }),
        userService.getUsers({ limit: 5 })
      ]);
      setLogs((logRes.data || []).slice(0, 5));
      setUsers((userRes.data || []).slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const logColumns = [
    { header: 'Action', accessor: 'action', render: (l) => <strong>{l.action}</strong> },
    { header: 'Actor', accessor: 'user' },
    { header: 'Module', accessor: 'module' },
    { header: 'IP Address', accessor: 'ip', render: (l) => <span style={{ fontFamily: 'monospace' }}>{l.ip}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (l) => (
        <span style={{ color: l.status === 'SUCCESS' ? '#16a34a' : '#b91c1c', fontWeight: 600 }}>
          {l.status}
        </span>
      )
    },
    { header: 'Timestamp', accessor: 'timestamp' }
  ];

  return (
    <div className="admin-dashboard-page">
      <PageHeader
        title="System Administration & Enterprise Security Center"
        subtitle="Global tenant controls, multi-role RBAC security, audit trails, and infrastructure telemetry"
        breadcrumbs={[{ label: 'System Admin', href: '/admin/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/admin/audit-logs">
              <Button variant="outline" size="sm">Audit Log Explorer</Button>
            </Link>
            <Link to="/admin/security">
              <Button variant="secondary" size="sm">Security Hardening</Button>
            </Link>
          </div>
        }
      />

      {/* METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Registered Users" value="28,490" change="+340" isPositive={true} subtitle="All 9 Stakeholder Roles" />
        <StatCard title="Active System Sessions" value="1,842" subtitle="Across 34 Depots" />
        <StatCard title="Failed Login Attempts (24h)" value="14" change="-8" isPositive={true} subtitle="Auto-blocked IPs: 3" />
        <StatCard title="API Gateway Health" value="99.98%" change="Optimal" isPositive={true} subtitle="Avg Latency: 42ms" />
      </div>

      {/* SYSTEM TELEMETRY STRIP */}
      <Card style={{ marginBottom: '1.5rem', background: '#0b1f3a', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Core Infrastructure Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></span>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>NIC Data Center Node 4 • Operational</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Database Engine:</span> <strong>PostgreSQL 16 Enterprise (HA)</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>ePay Webhook:</span> <strong style={{ color: '#22c55e' }}>Connected</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>TLS Cipher:</span> <strong>ECDHE-RSA-AES256-GCM-SHA384</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* TWO COLUMN GRID: RECENT AUDIT LOGS & USER SESSIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <Card
          title="Recent Security Audit & Mutation Trails"
          actions={
            <Link to="/admin/audit-logs">
              <Button variant="outline" size="sm">View All Logs →</Button>
            </Link>
          }
        >
          <DataTable columns={logColumns} data={logs} loading={loading} />
        </Card>
      </div>
    </div>
  );
};
