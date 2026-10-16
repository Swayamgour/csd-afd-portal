import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { notificationService } from '../../services/notification.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BeneficiaryNotifications() {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(role);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, [role]);

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="beneficiary-notifs-page">
      <PageHeader
        title="Notifications & Portal Alerts"
        subtitle="Live alerts on demand status updates, cyber treasury receipts, and supply order dispatches"
        actions={
          <Button
            size="sm"
            variant="outline"
            icon={CheckCheck}
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        }
      />

      <Card>
        <div className="notifications-feed">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`panel p-3 mb-2 between align-start ${item.read ? 'bg-white' : 'bg-brand-soft border-brand'}`}
            >
              <div>
                <div className="row align-center gap-1 mb-1">
                  <span className={`notif-type-tag notif-type-${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                  <span className="small muted">● {item.timestamp}</span>
                </div>
                <h4 className="font-semibold h4 mb-1">{item.title}</h4>
                <p className="small muted mb-2">{item.message}</p>
                {item.link && (
                  <Link to={item.link} className="link small font-semibold row align-center gap-1">
                    <span>View Record Details</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
