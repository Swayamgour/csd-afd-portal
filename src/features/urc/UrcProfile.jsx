import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UrcProfile() {
  const { user } = useAuth();

  return (
    <div className="urc-profile-page">
      <PageHeader
        title="Unit Run Canteen (URC) Profile"
        subtitle="Unit establishment credentials and commanding authority"
      />
      <div className="grid-2-col gap-2">
        <Card title="Canteen Establishment">
          <div className="info-kv-list">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">URC Name:</span>
              <span className="font-semibold">{user?.urc || 'Delhi Cantt Central URC'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">URC Code:</span>
              <span className="font-mono font-bold text-brand">{user?.urcId || 'URC-DEL-04'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Officer-in-Charge:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Mapped Parent Depot:</span>
              <span>{user?.depot || 'Delhi Regional CSD Depot'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
