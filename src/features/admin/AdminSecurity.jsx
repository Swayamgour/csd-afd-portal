import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { DataTable } from '../../components/common/DataTable';

export const AdminSecurity = () => {
  const [whitelistIp, setWhitelistIp] = useState('');
  const [ips, setIps] = useState([
    { ip: '10.0.0.0/8', desc: 'Government NIC Core VPN', addedOn: '01 Jan 2024', status: 'ACTIVE' },
    { ip: '14.139.58.0/24', desc: 'CSD HQ Directorate Gateway', addedOn: '15 Feb 2024', status: 'ACTIVE' },
    { ip: '164.100.0.0/16', desc: 'State Data Center Hub', addedOn: '10 Mar 2024', status: 'ACTIVE' }
  ]);
  const [msg, setMsg] = useState('');

  const handleAddIp = (e) => {
    e.preventDefault();
    if (!whitelistIp) return;
    setIps([...ips, { ip: whitelistIp, desc: 'Admin White-listed CIDR', addedOn: 'Today', status: 'ACTIVE' }]);
    setWhitelistIp('');
    setMsg('CIDR subnet successfully appended to trusted enterprise perimeter.');
    setTimeout(() => setMsg(''), 4000);
  };

  const columns = [
    { header: 'IP / CIDR Block', accessor: 'ip', render: (i) => <code>{i.ip}</code> },
    { header: 'Network Description', accessor: 'desc' },
    { header: 'Added On', accessor: 'addedOn' },
    {
      header: 'Status',
      accessor: 'status',
      render: (i) => <span style={{ color: '#16a34a', fontWeight: 600 }}>{i.status}</span>
    }
  ];

  return (
    <div className="admin-security-page">
      <PageHeader
        title="Security Hardening & Network Boundary Control"
        subtitle="Manage IP CIDR whitelisting, perimeter defenses, brute-force mitigation, and security policies"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Security' }
        ]}
      />

      {msg && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✓ {msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <Card title="Trusted Enterprise IP Whitelist (Admin & Official Endpoints)">
          <div style={{ marginBottom: '1.5rem' }}>
            <form onSubmit={handleAddIp} style={{ display: 'flex', gap: '0.5rem' }}>
              <Input
                placeholder="Enter IPv4 or CIDR (e.g. 10.14.0.0/24)"
                value={whitelistIp}
                onChange={(e) => setWhitelistIp(e.target.value)}
                required
              />
              <Button type="submit">Add Trusted IP</Button>
            </form>
          </div>
          <DataTable columns={columns} data={ips} />
        </Card>

        <Card title="Automated Defense Shields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <strong style={{ color: '#166534', display: 'block', marginBottom: '0.25rem' }}>DDoS Mitigation Engine</strong>
              <span style={{ color: '#14532d' }}>Cloudflare & NIC Cyber Security Shield actively rate-limiting traffic to 120 req/min per IP.</span>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.25rem' }}>Brute-Force Guard</strong>
              <span style={{ color: '#64748b' }}>Account locked for 30 minutes after 5 continuous invalid credential challenges.</span>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.25rem' }}>Audit Trail Tamper-Proofing</strong>
              <span style={{ color: '#64748b' }}>SHA-256 HMAC cryptographic chain computed on every audit log insertion.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
