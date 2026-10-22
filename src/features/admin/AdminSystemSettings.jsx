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
        <div className="alert alert-success mb-lg">✓ {savedMsg}</div>
      )}

      <form onSubmit={handleSave}>
        <div className="admin-settings-grid">
          
          <Card title="Session & Authentication Policy">
            <div className="flex-col-gap-md">
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
            <div className="flex-col-gap-md">
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
              <div className="admin-maintenance-box">
                <div className="flex-between-center">
                  <div>
                    <strong className="admin-maintenance-title">Maintenance Mode</strong>
                    <div className="admin-maintenance-desc">
                      Redirects public visitors and beneficiaries to maintenance page during ledger upgrades.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="checkbox-lg"
                  />
                </div>
              </div>
            </div>
          </Card>

        </div>

        <div className="flex-end-gap-sm mt-xl">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Discard Changes</Button>
          <Button type="submit">Save System Configuration</Button>
        </div>
      </form>
    </div>
  );
};
