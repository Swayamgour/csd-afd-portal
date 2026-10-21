import React, { useState } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Drawer from '../components/common/Drawer.jsx';
import Button from '../components/common/Button.jsx';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../features/notifications/notificationApi.js';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifData } = useGetNotificationsQuery();
  const [markAllAsRead] = useMarkAllNotificationsReadMutation();
  const [markNotificationRead] = useMarkNotificationReadMutation();

  const notifications = Array.isArray(notifData?.items)
    ? notifData.items
    : Array.isArray(notifData)
    ? notifData
    : [];

  const unreadCount = notifications.filter((n) => !n.readAt && n.status !== 'READ').length;

  const markAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const handleItemClick = async (item) => {
    if (!item.readAt) {
      try {
        await markNotificationRead(item._id || item.id).unwrap();
      } catch (e) {
        console.error(e);
      }
    }
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="header-icon-btn relative circle"
        onClick={() => setOpen(true)}
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notif-badge-dot">{unreadCount}</span>}
      </button>

      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Notification Center"
        subtitle={`${unreadCount} unread alerts`}
        width="400px"
        footer={
          unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              icon={CheckCheck}
              onClick={markAllRead}
              className="wide"
            >
              Mark all as read
            </Button>
          )
        }
      >
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="p-3 text-center muted small">No notifications right now.</div>
          ) : (
            notifications.map((item) => {
              const isRead = Boolean(item.readAt || item.status === 'READ');
              return (
                <div
                  key={item._id || item.id}
                  className={`notif-card panel mb-1 ${isRead ? 'notif-read' : 'notif-unread'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="between mb-1">
                    <span className="notif-type-tag notif-type-info">
                      {item.event || 'NOTIFICATION'}
                    </span>
                    <span className="notif-time muted small">
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="notif-desc small mb-1">{item.body || item.message}</p>
                </div>
              );
            })
          )}
        </div>
      </Drawer>
    </>
  );
}
