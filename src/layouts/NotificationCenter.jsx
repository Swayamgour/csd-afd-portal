import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Drawer from '../components/common/Drawer.jsx';
import Button from '../components/common/Button.jsx';
import { notificationService } from '../services/notification.service.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { role } = useAuth();

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(role);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
            notifications.map((item) => (
              <div
                key={item.id}
                className={`notif-card panel mb-1 ${item.read ? 'notif-read' : 'notif-unread'}`}
              >
                <div className="between mb-1">
                  <span className={`notif-type-tag notif-type-${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                  <span className="notif-time muted small">{item.timestamp}</span>
                </div>
                <h4 className="notif-title small font-semibold mb-1">{item.title}</h4>
                <p className="notif-desc small muted mb-1">{item.message}</p>
                {item.link && (
                  <Link
                    to={item.link}
                    onClick={() => setOpen(false)}
                    className="notif-link small link row align-center gap-1"
                  >
                    View Details <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </Drawer>
    </>
  );
}
