import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Store, ShieldCheck, MapPin, Phone, Mail, FileText } from 'lucide-react';

export default function DealerProfile() {
  const { user } = useAuth();
  const dealer = user?.dealer || {
    name: user?.dealershipName || 'SUPREME MOBILES PVT. LTD.- HISAR',
    code: user?.dealerCode || 'DLR-SUPREME-HSR',
    city: 'Hisar',
    state: 'HARYANA',
    address: 'Delhi Road, Near Model Town, Hisar, Haryana - 125001',
    phone: user?.mobile || '+91 98120 12345',
    email: user?.email || 'csd@suprememobileshisar.com'
  };

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
              <span className="font-semibold text-navy">{dealer.name}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">CSD Dealer Code:</span>
              <span className="font-mono font-bold text-brand">{dealer.code}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Station City / State:</span>
              <span className="font-medium">{dealer.city ? `${dealer.city}, ${dealer.state}` : 'Hisar, Haryana'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Showroom Address:</span>
              <span className="font-medium small">{dealer.address || 'Showroom Address on File'}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Nodal Manager:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="kv-row between small py-1 border-bottom">
              <span className="muted">Official Email:</span>
              <span className="font-mono">{dealer.email || user?.email}</span>
            </div>
            <div className="kv-row between small py-1">
              <span className="muted">Contact Phone:</span>
              <span className="font-mono">{dealer.phone || user?.mobile}</span>
            </div>
          </div>
        </Card>

        <Card title="Zero Handling Fee Undertaking">
          <div className="panel p-3 bg-green-soft border-green small">
            <p className="font-bold text-green mb-1 row align-center gap-0-5">
              <ShieldCheck size={18} />
              <span>100% Compliant Partner · MoD Undertaking</span>
            </p>
            <p className="muted mb-2">
              This showroom has executed the statutory undertaking confirming that no handling charges, documentary fees, or mandatory accessory bundles are imposed on Defence personnel.
            </p>
            <div className="p-2 bg-white rounded border">
              <span className="micro muted block">Statutory Compliance Status</span>
              <span className="small font-semibold text-brand">✓ All CSD Rate Concessions Strictly Applied</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
