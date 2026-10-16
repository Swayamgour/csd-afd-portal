import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { notificationService } from '../../services/notification.service';
import { ROLE_LABELS } from '../../permissions/roles';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    type: 'SYSTEM',
    targetRole: 'ALL'
  });
  const [sentMsg, setSentMsg] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    await notificationService.broadcastNotification({
      ...newNotice,
      createdAt: 'Just now',
      read: false
    });
    setShowModal(false);
    setSentMsg(`System notification broadcasted to ${newNotice.targetRole === 'ALL' ? 'all users' : newNotice.targetRole}.`);
    fetchNotices();
    setTimeout(() => setSentMsg(''), 4000);
  };

  const columns = [
    { header: 'Notification Title', accessor: 'title', render: (n) => <strong>{n.title}</strong> },
    { header: 'Message Content', accessor: 'message', render: (n) => <span style={{ fontSize: '0.85rem' }}>{n.message}</span> },
    {
      header: 'Category / Type',
      accessor: 'type',
      render: (n) => <span className="badge" style={{ background: '#f1f5f9', color: 'var(--navy)' }}>{n.type}</span>
    },
    { header: 'Broadcasted At', accessor: 'createdAt' }
  ];

  return (
    <div className="admin-notifications-page">
      <PageHeader
        title="Emergency & System Broadcast Center"
        subtitle="Dispatch real-time advisory bulletins, maintenance warnings, and policy circulars to user trays"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Notifications' }
        ]}
        actions={
          <Button onClick={() => setShowModal(true)}>+ Dispatch System Broadcast</Button>
        }
      />

      {sentMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✓ {sentMsg}</div>
      )}

      <Card title="Active System Bulletins">
        <DataTable columns={columns} data={notifications} loading={loading} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Dispatch Enterprise Notification Bulletin">
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Bulletin Headline"
            placeholder="e.g. Scheduled Maintenance Window: SBI ePay Gateway Upgrade"
            value={newNotice.title}
            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            required
          />
          <Select
            label="Target Audience Scope"
            value={newNotice.targetRole}
            onChange={(e) => setNewNotice({ ...newNotice, targetRole: e.target.value })}
            options={[
              { value: 'ALL', label: 'All Registered Stakeholders (Global)' },
              ...Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))
            ]}
          />
          <Select
            label="Urgency Classification"
            value={newNotice.type}
            onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
            options={[
              { value: 'SYSTEM', label: 'System Advisory' },
              { value: 'SECURITY', label: 'Security Alert' },
              { value: 'DEMAND', label: 'AFD Demand Notice' },
              { value: 'PAYMENT', label: 'Treasury / Payment' }
            ]}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Detailed Message Body</label>
            <textarea
              rows={4}
              className="form-control"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              placeholder="Detail downtime duration, affected services, and citizen guidance..."
              value={newNotice.message}
              onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Broadcast Now</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
