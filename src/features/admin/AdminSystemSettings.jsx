import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const AdminSystemSettings = () => {
  const [settings, setSettings] = useState({
    sessionTimeout: '15',
    maxLoginAttempts: '5',
    mfaEnforcement: 'ENFORCED_FOR_OFFICIALS',
    maintenanceMode: false,
    auditRetentionDays: '365',
    cyberBackupCron: 'Daily at 02:00 AM IST'
  });
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('Global system parameters synchronized and broadcasted across nodes.');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  return (
    <div className="admin-system-settings-page">
      <PageHeader
        title="System Parameters & Environment Configuration"
        subtitle="Global tenant timeouts, MFA policy enforcement, audit retention, and maintenance windows"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'System Settings' }
        ]}
      />

      {savedMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✓ {savedMsg}</div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          
          <Card title="Session & Authentication Policy">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Select
                label="Idle Session Timeout"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                options={[
                  { value: '10', label: '10 Minutes' },
                  { value: '15', label: '15 Minutes (Mandatory Government Standard)' },
                  { value: '30', label: '30 Minutes' }
                ]}
              />
              <Select
                label="Max Consecutive Failed Login Attempts"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                options={[
                  { value: '3', label: '3 Attempts (Strict)' },
                  { value: '5', label: '5 Attempts (Recommended)' }
                ]}
              />
              <Select
                label="Multi-Factor Authentication (MFA)"
                value={settings.mfaEnforcement}
                onChange={(e) => setSettings({ ...settings, mfaEnforcement: e.target.value })}
                options={[
                  { value: 'ENFORCED_FOR_OFFICIALS', label: 'Enforced for CSD, Depot, OEM & Admin' },
                  { value: 'ENFORCED_ALL', label: 'Enforced for All Users (Including Beneficiaries)' }
                ]}
              />
            </div>
          </Card>

          <Card title="Data Retention & Maintenance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Immutable Audit Log Retention (Days)"
                type="number"
                value={settings.auditRetentionDays}
                onChange={(e) => setSettings({ ...settings, auditRetentionDays: e.target.value })}
              />
              <Input
                label="Automated Cyber Backup Schedule"
                value={settings.cyberBackupCron}
                readOnly
              />
              <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>Maintenance Mode</strong>
                    <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                      Redirects public visitors and beneficiaries to maintenance page during ledger upgrades.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </Card>

        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Discard Changes</Button>
          <Button type="submit">Save System Configuration</Button>
        </div>
      </form>
    </div>
  );
};
