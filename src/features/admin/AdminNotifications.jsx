import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import {
  useGetNotificationsQuery,
  useBroadcastNotificationMutation,
} from '../notifications/notificationApi';
import { ROLE_LABELS } from '../../permissions/roles';

export const AdminNotifications = () => {
  const { data: notifData, isLoading: loading, isFetching, refetch } = useGetNotificationsQuery();
  const [broadcastNotification, { isLoading: isBroadcasting }] = useBroadcastNotificationMutation();

  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    type: 'SYSTEM',
    targetRole: 'ALL',
  });
  const [sentMsg, setSentMsg] = useState('');

  const notifications = Array.isArray(notifData?.items)
    ? notifData.items
    : Array.isArray(notifData)
    ? notifData
    : [];

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await broadcastNotification({
        title: newNotice.title,
        message: newNotice.message,
        targetRole: newNotice.targetRole,
        type: newNotice.type,
      }).unwrap();

      setShowModal(false);
      setNewNotice({ title: '', message: '', type: 'SYSTEM', targetRole: 'ALL' });
      setSentMsg(
        `System notification broadcasted to ${
          newNotice.targetRole === 'ALL' ? 'all users' : newNotice.targetRole
        }.`
      );
      setTimeout(() => setSentMsg(''), 4000);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Error broadcasting notice');
    }
  };

  const columns = [
    {
      header: 'Event / Type',
      accessor: 'event',
      render: (n) => <span className="badge-perm-count">{n.event || 'SYSTEM'}</span>,
    },
    {
      header: 'Message Content',
      accessor: 'body',
      render: (n) => <span className="fs-sm">{n.body || n.message}</span>,
    },
    {
      header: 'Channel',
      accessor: 'channel',
      render: (n) => <span className="badge-role-tag">{n.channel || 'IN_APP'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (n) => <span>{n.status || 'SENT'}</span>,
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      render: (n) => (n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : 'Recent'),
    },
  ];

  return (
    <div className="admin-notifications-page">
      <PageHeader
        title="System Notifications & Broadcast Dispatch"
        subtitle="Manage global bulletins, critical system maintenance notices, and role broadcasts"
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <div className="flex-gap-sm">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button onClick={() => setShowModal(true)}>+ Dispatch Global Bulletin</Button>
          </div>
        }
      />

      {sentMsg && (
        <div className="alert alert-success mb-lg">✓ {sentMsg}</div>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={notifications}
          loading={loading}
          emptyMessage="No broadcast notifications logged."
        />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Dispatch System Notification">
        <form onSubmit={handleBroadcast} className="flex-col-gap-md">
          <Input
            label="Notice Title"
            placeholder="e.g. Scheduled Maintenance Notice"
            value={newNotice.title}
            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            required
          />
          <Select
            label="Target Role"
            value={newNotice.targetRole}
            onChange={(e) => setNewNotice({ ...newNotice, targetRole: e.target.value })}
            options={[
              { value: 'ALL', label: 'All Roles (Global)' },
              ...Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ]}
          />
          <div className="form-field">
            <label className="form-label">Message Content</label>
            <textarea
              rows={4}
              className="form-control"
              placeholder="Enter system announcement..."
              value={newNotice.message}
              onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
              required
            />
          </div>
          <div className="flex-end-gap-sm mt-sm">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={isBroadcasting}>Broadcast</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
