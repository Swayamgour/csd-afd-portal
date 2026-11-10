import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Lock, Bell, Shield, Smartphone, Mail, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDigilockerLinkStartMutation, useDigilockerUnlinkMutation } from '../auth/authApi.js';
import { digilockerMessage } from '../../utils/digilocker.js';

export default function BeneficiarySettings() {
  const { user, refreshMe, token } = useAuth();
  const location = useLocation();
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsAppAlerts, setWhatsAppAlerts] = useState(true);
  const [toast, setToast] = useState('');

  // ---- DigiLocker link / unlink (password is re-entered for both) ----
  const dlLinked = Boolean(user?.digilocker?.isLinked);
  const dlPasswordOnly = Array.isArray(user?.authMethods) && !user.authMethods.includes('PASSWORD');
  const [dlPassword, setDlPassword] = useState('');
  const [dlMsg, setDlMsg] = useState(location.state?.digilocker === 'linked' ? { type: 'success', text: 'DigiLocker account linked. You can now sign in with DigiLocker.' } : null);
  const [linkStart, { isLoading: linking }] = useDigilockerLinkStartMutation();
  const [unlink, { isLoading: unlinking }] = useDigilockerUnlinkMutation();

  const startLink = async () => {
    setDlMsg(null);
    if (!dlPassword) { setDlMsg({ type: 'error', text: 'Enter your current password to continue.' }); return; }
    try {
      const { url } = await linkStart({ currentPassword: dlPassword }).unwrap();
      if (!url) throw new Error('DigiLocker did not return a link.');
      window.location.assign(url);
    } catch (e) {
      setDlMsg({ type: 'error', text: digilockerMessage(e?.data?.code, e?.data?.message || e?.message) });
    }
  };

  const doUnlink = async () => {
    setDlMsg(null);
    if (!dlPassword) { setDlMsg({ type: 'error', text: 'Enter your current password to continue.' }); return; }
    try {
      await unlink({ currentPassword: dlPassword }).unwrap();
      setDlPassword('');
      await refreshMe(token);
      setDlMsg({ type: 'success', text: 'DigiLocker account unlinked.' });
    } catch (e) {
      setDlMsg({ type: 'error', text: e?.data?.message || e?.message || 'Could not unlink DigiLocker.' });
    }
  };

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

      <Card title="DigiLocker">
        <p className="small muted mb-2">
          Link your DigiLocker account to sign in without a password or OTP. Your Aadhaar number is never stored, and
          linking does not change your beneficiary approval status.
        </p>

        {dlMsg && (
          <div className={`alert-banner ${dlMsg.type === 'error' ? 'error' : 'success'} mb-2 small`} role="alert">
            {dlMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{dlMsg.text}</span>
          </div>
        )}

        <div className="kv-row between small py-1 border-bottom mb-2">
          <span className="muted">Status:</span>
          <span className={dlLinked ? 'text-green font-semibold' : 'muted'}>
            {dlLinked ? '● Linked' : 'Not linked'}
            {dlLinked && user?.digilocker?.linkedAt ? ` · since ${new Date(user.digilocker.linkedAt).toLocaleDateString('en-IN')}` : ''}
          </span>
        </div>

        {dlLinked && dlPasswordOnly ? (
          <p className="small muted">
            This account has no password, so DigiLocker cannot be unlinked (you would be locked out). Contact the helpdesk if you need a password set.
          </p>
        ) : (
          <>
            <div className="form-field mb-2" style={{ maxWidth: 360 }}>
              <Input
                id="dlPwd"
                type="password"
                autoComplete="current-password"
                placeholder="Current password"
                value={dlPassword}
                onChange={(e) => setDlPassword(e.target.value)}
              />
            </div>
            {dlLinked ? (
              <Button variant="outline" onClick={doUnlink} loading={unlinking}>Unlink DigiLocker</Button>
            ) : (
              <Button variant="primary" icon={ShieldCheck} onClick={startLink} loading={linking}>Link DigiLocker</Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
