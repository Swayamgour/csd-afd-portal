import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DealerProfile() {
  const { user } = useAuth();

  return (
    <div className="dealer-profile-page">
      <PageHeader
        title="Authorized Showroom Profile & Compliance"
        subtitle="Official dealership registration and Ministry of Defence compliance rating"
      />
      <div className="grid-2-col gap-2">
        <Card title="Showroom Institutional Credentials">
          <div className="info-kv-list">
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Dealership Name:</span>
              <span className="font-semibold">{user?.dealershipName || 'Pratham Motors Pvt. Ltd.'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">CSD Dealer Code:</span>
              <span className="font-mono font-bold text-brand">{user?.dealerCode || 'DLR-ND-082'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Nodal Manager:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Phone:</span>
              <span>{user?.phone}</span>
            </div>
          </div>
        </Card>

        <Card title="Zero Handling Fee Undertaking">
          <div className="panel p-3 bg-green-soft border-green small">
            <p className="font-bold text-green mb-1">● 100% Compliant Partner</p>
            <p className="muted mb-0">
              This showroom has signed the statutory undertaking confirming that no handling charges, documentary fees, or mandatory accessory bundles are imposed on Defence personnel.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
