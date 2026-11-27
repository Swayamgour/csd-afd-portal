import React from 'react';
import { useNavigate } from 'react-router-dom';
import DealerRequestsBoard from '../dealerRequest/DealerRequestsBoard.jsx';
import OemActions from '../dealerRequest/OemActions.jsx';

const TABS = [
  { id: 'all', label: 'All', statuses: '' },
  { id: 'progress', label: 'In progress', statuses: 'PENDING_ADMIN,WITH_DEPOT,DEPOT_VERIFIED' },
  { id: 'created', label: 'Dealer created', statuses: 'DEALER_CREATED' },
  { id: 'closed', label: 'Rejected / Cancelled', statuses: 'REJECTED,CANCELLED' },
];

export default function OemDealerRequests() {
  const navigate = useNavigate();
  return (
    <>
      <DealerRequestsBoard
        title="New Dealer Requests"
        subtitle="Request a new authorized dealer. Admin forwards it to the depot of the dealer's state for verification; once approved, the dealer is created automatically and gets a login email."
        breadcrumbs={[{ label: 'OEM Portal', href: '/oem/dashboard' }, { label: 'Dealer Requests' }]}
        tabs={TABS}
        onNew={() => navigate('/oem/dealer-requests/new')}
        showDepot
        oemView
        renderActions={(r, ctx) => <OemActions request={r} close={ctx.close} />}
      />
    </>
  );
}
