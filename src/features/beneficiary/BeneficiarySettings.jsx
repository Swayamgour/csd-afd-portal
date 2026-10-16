import React, { useState } from 'react';
import { Lock, Bell, Shield, Smartphone, Mail, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BeneficiarySettings() {
  const { user } = useAuth();
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsAppAlerts, setWhatsAppAlerts] = useState(true);
  const [toast, setToast] = useState('');

  const handleSave = () => {
    setToast('Settings and preferences saved successfully.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="beneficiary-settings-page">
      <PageHeader
        title="Account Settings & Security"
        subtitle="Manage communication channels, security credentials, and active portal sessions"
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid-2-col gap-2 mb-3">
        {/* Notification Preferences */}
        <Card title="Alert Channels & Subscriptions">
          <p className="small muted mb-3">
            Receive statutory procurement status alerts on your verified contact devices.
          </p>

          <div className="settings-toggle-list flex-col gap-2 mb-3">
            <label className="checkbox-label between p-2 panel bg-bg cursor-pointer">
              <div className="row align-center gap-1">
                <Smartphone size={18} className="text-brand" />
                <div>
                  <span className="font-semibold small block">SMS Dispatch Alerts</span>
                  <span className="micro muted">Challis status and supply order SMS</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
              />
            </label>

            <label className="checkbox-label between p-2 panel bg-bg cursor-pointer">
              <div className="row align-center gap-1">
                <Mail size={18} className="text-brand" />
                <div>
                  <span className="font-semibold small block">Official Email Dispatch</span>
                  <span className="micro muted">Certified PDF Supply Orders & Invoices</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </label>

            <label className="checkbox-label between p-2 panel bg-bg cursor-pointer">
              <div className="row align-center gap-1">
                <Shield size={18} className="text-brand" />
                <div>
                  <span className="font-semibold small block">WhatsApp Delivery Updates</span>
                  <span className="micro muted">Live carrier tracking updates</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsAppAlerts}
                onChange={(e) => setWhatsAppAlerts(e.target.checked)}
              />
            </label>
          </div>

          <Button variant="primary" onClick={handleSave}>
            Save Notification Preferences
          </Button>
        </Card>

        {/* Security & Password */}
        <Card title="Two-Factor Security & Session Management">
          <div className="info-kv-list mb-3">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Multi-Factor Authentication (2FA):</span>
              <span className="text-green font-semibold">● Enabled (Aadhaar OTP)</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Last Security Sign-in:</span>
              <span>Today, 10:15 AM (New Delhi)</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Active IP Address:</span>
              <span className="font-mono">49.36.120.14</span>
            </div>
          </div>

          <h4 className="small font-semibold mb-2">Change Password</h4>
          <div className="form-field mb-2">
            <Input id="currentPwd" type="password" placeholder="Current password" />
          </div>
          <div className="form-field mb-2">
            <Input id="newPwd" type="password" placeholder="New strong password" />
          </div>
          <Button variant="outline" onClick={handleSave}>
            Update Password
          </Button>
        </Card>
      </div>
    </div>
  );
}
