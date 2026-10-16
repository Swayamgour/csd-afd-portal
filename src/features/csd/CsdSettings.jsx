import React, { useState } from 'react';
import { Settings, Shield, Bell, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export default function CsdSettings() {
  const [toast, setToast] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoSanctionThreshold, setAutoSanctionThreshold] = useState('200000');

  const handleSave = () => {
    setToast('Operational parameters saved successfully.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="csd-settings-page">
      <PageHeader
        title="Head Office Operational Configuration"
        subtitle="Manage national sanction rules, financial limits, and automated treasury integration triggers"
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid-2-col gap-2">
        <Card title="Sanction & Procurement Rules">
          <div className="form-field mb-2">
            <label className="form-label font-semibold small">
              Automated Two-Wheeler Sanction Ceiling (₹)
            </label>
            <input
              type="number"
              className="fld"
              value={autoSanctionThreshold}
              onChange={(e) => setAutoSanctionThreshold(e.target.value)}
            />
            <span className="micro muted">Demands below this threshold bypass manual scrutiny if service records match 100%.</span>
          </div>

          <label className="checkbox-label between p-2 panel bg-bg cursor-pointer mb-3">
            <div>
              <span className="font-semibold small block">Strict Dealer Fee Enforcement Mode</span>
              <span className="micro muted">Automatically flag orders where dealer charges exceed sanctioned ex-showroom.</span>
            </div>
            <input type="checkbox" defaultChecked />
          </label>

          <Button variant="primary" onClick={handleSave}>
            Save Operational Rules
          </Button>
        </Card>

        <Card title="System Security & Portal Maintenance">
          <div className="info-kv-list mb-3">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">NIC RailWire Gateway:</span>
              <span className="text-green font-semibold">● Operational</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">SBI Cyber Treasury Connector:</span>
              <span className="text-green font-semibold">● Active (Polling 5m)</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">UIDAI e-KYC Service:</span>
              <span className="text-green font-semibold">● Operational</span>
            </div>
          </div>

          <Button variant="outline" onClick={handleSave}>
            Sync Treasury Heartbeat
          </Button>
        </Card>
      </div>
    </div>
  );
}
