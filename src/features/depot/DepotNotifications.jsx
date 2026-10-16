import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import { notificationService } from '../../services/notification.service.js';

export default function DepotNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await notificationService.getNotifications('depot');
        setNotifs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="depot-notifications-page">
      <PageHeader
        title="Regional Depot Notifications"
        subtitle="Operational notices from CSD Head Office and payment alerts"
      />

      <Card>
        <div className="notif-feed">
          {notifs.map((n) => (
            <div key={n.id} className="panel p-3 mb-2 bg-white">
              <span className="notif-type-tag mb-1 inline-block">{n.type}</span>
              <h4 className="font-semibold h4 mb-1">{n.title}</h4>
              <p className="small muted mb-0">{n.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
