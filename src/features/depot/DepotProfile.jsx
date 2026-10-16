import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DepotProfile() {
  const { user } = useAuth();

  return (
    <div className="depot-profile-page">
      <PageHeader
        title="Regional Depot Profile & Authority"
        subtitle="Command jurisdiction and operational parameters"
      />

      <div className="grid-2-col gap-2">
        <Card title="Depot Command Details">
          <div className="info-kv-list">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Depot Designation:</span>
              <span className="font-semibold">{user?.depot || 'Delhi Regional CSD Depot'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Depot Code:</span>
              <span className="font-mono font-bold text-brand">{user?.depotId || 'DEP-DEL-01'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Commanding Officer:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Official Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Phone / Helpline:</span>
              <span>{user?.phone}</span>
            </div>
          </div>
        </Card>

        <Card title="Jurisdiction Scope">
          <p className="small muted mb-2">
            This depot exercises sanction authority for all URCs in Delhi, Haryana, and Western UP sectors. All payment confirmations reconcile directly through State Bank of India Cyber Treasury (New Delhi branch).
          </p>
        </Card>
      </div>
    </div>
  );
}
