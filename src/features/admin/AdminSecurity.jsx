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
      render: (i) => <span className="text-success fw-semibold">{i.status}</span>
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

      {msg && <div className="alert alert-success mb-lg">✓ {msg}</div>}

      <div className="admin-security-layout">
        <Card title="Trusted Enterprise IP Whitelist (Admin & Official Endpoints)">
          <div className="mb-xl">
            <form onSubmit={handleAddIp} className="flex-gap-sm">
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
          <div className="flex-col-gap-md fs-sm">
            <div className="shield-card-active">
              <strong className="shield-card-title-active">DDoS Mitigation Engine</strong>
              <span className="shield-card-desc-active">Cloudflare & NIC Cyber Security Shield actively rate-limiting traffic to 120 req/min per IP.</span>
            </div>

            <div className="shield-card-default">
              <strong className="shield-card-title-default">Brute-Force Guard</strong>
              <span className="shield-card-desc-default">Account locked for 30 minutes after 5 continuous invalid credential challenges.</span>
            </div>

            <div className="shield-card-default">
              <strong className="shield-card-title-default">Audit Trail Tamper-Proofing</strong>
              <span className="shield-card-desc-default">SHA-256 HMAC cryptographic chain computed on every audit log insertion.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
