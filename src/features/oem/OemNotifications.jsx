import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import { notificationService } from '../../services/notification.service.js';

export default function OemNotifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await notificationService.getNotifications('oem');
      setNotifs(data);
    }
    load();
  }, []);

  return (
    <div className="oem-notifs-page">
      <PageHeader title="OEM Directives & Alerts" subtitle="Procurement and price updates from CSD Head Office" />
      <Card>
        {notifs.map((n) => (
          <div key={n.id} className="panel p-3 mb-2 bg-white">
            <span className="notif-type-tag mb-1 inline-block">{n.type}</span>
            <h4 className="font-semibold h4 mb-1">{n.title}</h4>
            <p className="small muted mb-0">{n.message}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
