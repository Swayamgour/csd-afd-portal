import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetNotificationsQuery } from '../notifications/notificationApi.js';

export default function DealerNotifications() {
  const { data: notifData, isLoading: loading, isFetching, refetch } = useGetNotificationsQuery();

  const notifs = Array.isArray(notifData?.items)
    ? notifData.items
    : Array.isArray(notifData)
    ? notifData
    : [];

  return (
    <div className="dealer-notifications-page">
      <PageHeader
        title="Dealership Notifications"
        subtitle="Verification requests, supply order dispatches, and delivery reminders"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />

      <Card>
        <div className="notif-feed">
          {notifs.length === 0 ? (
            <p className="muted small p-3 text-center">No notifications in your dealership feed.</p>
          ) : (
            notifs.map((n) => (
              <div key={n._id || n.id} className="panel p-3 mb-2 bg-white">
                <span className="notif-type-tag mb-1 inline-block">{n.event || 'NOTICE'}</span>
                <p className="small mb-0">{n.body || n.message}</p>
                <span className="micro muted mt-1 block">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
