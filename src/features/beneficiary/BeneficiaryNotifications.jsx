import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../notifications/notificationApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export default function BeneficiaryNotifications() {
  const {
    data: notifData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useGetNotificationsQuery();

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllReadMutation, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = notifData?.items || [];

  const markAllRead = async () => {
    try {
      await markAllReadMutation().unwrap();
      refetch();
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const handleItemClick = async (item) => {
    if (!item.readAt) {
      try {
        await markRead(item._id).unwrap();
      } catch (e) {
        console.error('Failed to mark as read', e);
      }
    }
  };

  return (
    <div className="beneficiary-notifs-page">
      <PageHeader
        title="Notifications & Portal Alerts"
        subtitle="Live alerts on demand status updates, cyber treasury receipts, and supply order dispatches"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => refetch()} title="Refresh">
              <RefreshCw size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={CheckCheck}
              onClick={markAllRead}
              disabled={isMarkingAll || notifications.length === 0}
            >
              {isMarkingAll ? 'Marking...' : 'Mark all as read'}
            </Button>
          </div>
        }
      />

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <span>{getErrorMessage(error, 'Failed to fetch notifications.')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No new notifications</p>
            <p className="text-xs">You will receive live alerts when your demand or payment updates.</p>
          </div>
        ) : (
          <div className="notifications-feed">
            {notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => handleItemClick(item)}
                className={`panel p-3 mb-2 between align-start cursor-pointer transition ${
                  item.readAt ? 'bg-white' : 'bg-brand-soft border-brand'
                }`}
              >
                <div>
                  <div className="row align-center gap-1 mb-1">
                    <span className="notif-type-tag notif-type-info font-bold text-xs">
                      {item.event || 'CSD ALERT'}
                    </span>
                    <span className="small muted">
                      ● {new Date(item.createdAt).toLocaleString('en-IN')}
                    </span>
                    {!item.readAt && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold ml-2">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 font-medium mb-1">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
