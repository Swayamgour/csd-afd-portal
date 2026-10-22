import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import {
  useGetNotificationsQuery,
  useBroadcastNotificationMutation,
} from '../notifications/notificationApi';
import { ROLE_LABELS } from '../../permissions/roles';

export function CsdNotifications() {
  const { data: notifData, isLoading: loading, isFetching, refetch } = useGetNotificationsQuery();
  const [broadcastNotification, { isLoading: isBroadcasting }] = useBroadcastNotificationMutation();

  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    type: 'DIRECTORATE',
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
      setNewNotice({ title: '', message: '', type: 'DIRECTORATE', targetRole: 'ALL' });
      setSentMsg(
        `Directorate notification successfully broadcasted to ${
          newNotice.targetRole === 'ALL' ? 'all stakeholders' : newNotice.targetRole
        }.`
      );
      setTimeout(() => setSentMsg(''), 4000);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Error broadcasting notice');
    }
  };

  return (
    <div className="csd-notifications-page">
      <PageHeader
        title="CSD Head Office Notification Center"
        subtitle="Operational directives, cyber treasury reconciliations, and policy communications"
        breadcrumbs={[
          { label: 'CSD HQ', href: '/csd/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <div className="portal-flex-gap-sm">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button onClick={() => setShowModal(true)}>+ Issue Directorate Circular Notice</Button>
          </div>
        }
      />

      {sentMsg && (
        <div className="alert alert-success mb-md">✓ {sentMsg}</div>
      )}

      <Card>
        <div className="csd-notif-list">
          {notifications.length === 0 ? (
            <p className="csd-notif-empty">
              No current notifications in the directorate tray.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id || n.id}
                className="csd-notif-item"
              >
                <div className="csd-notif-header">
                  <span className="badge csd-badge-notif">
                    {n.event || 'DIRECTORATE'}
                  </span>
                  <span className="csd-notif-date">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : 'Recent'}
                  </span>
                </div>
                <p className="csd-notif-body">{n.body || n.message}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Issue Directorate Advisory Bulletin">
        <form onSubmit={handleBroadcast} className="director-modal-form">
          <Input
            label="Notification Title"
            placeholder="e.g. FY 2024-25 Q3 Demand Allocation Quotas"
            value={newNotice.title}
            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            required
          />
          <Select
            label="Target Audience"
            value={newNotice.targetRole}
            onChange={(e) => setNewNotice({ ...newNotice, targetRole: e.target.value })}
            options={[
              { value: 'ALL', label: 'All Stakeholders (Global)' },
              ...Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ]}
          />
          <Select
            label="Category"
            value={newNotice.type}
            onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
            options={[
              { value: 'DIRECTORATE', label: 'Directorate Advisory' },
              { value: 'POLICY', label: 'Policy Update' },
              { value: 'PAYMENT', label: 'Treasury / Payment' },
              { value: 'DEPOT', label: 'Depot Instruction' },
            ]}
          />
          <div className="portal-form-group">
            <label className="director-field-label">Circular / Message Content</label>
            <textarea
              rows={4}
              className="director-field-input"
              placeholder="Enter message details for broadcast..."
              value={newNotice.message}
              onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
              required
            />
          </div>
          <div className="director-modal-actions">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={isBroadcasting}>Publish Circular</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CsdNotifications;
