import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function OemProfile() {
  const { user } = useAuth();

  return (
    <div className="oem-profile-page">
      <PageHeader
        title="OEM Corporate Profile & Empanelment"
        subtitle="Automobile manufacturer institutional credentials and factory contact details"
      />
      <div className="grid-2-col gap-2">
        <Card title="Corporate Institutional Details">
          <div className="info-kv-list">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Company:</span>
              <span className="font-semibold">{user?.company || 'Tata Motors Passenger Vehicles Ltd.'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Institutional Head:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Designation:</span>
              <span>{user?.designation}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Official Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Helpline:</span>
              <span>{user?.phone}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
