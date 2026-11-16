import React, { useState } from 'react';
import DealerRequestsBoard from '../dealerRequest/DealerRequestsBoard.jsx';
import NewDealerRequestModal from '../dealerRequest/NewDealerRequestModal.jsx';
import OemActions from '../dealerRequest/OemActions.jsx';

const TABS = [
  { id: 'all', label: 'All', statuses: '' },
  { id: 'progress', label: 'In progress', statuses: 'PENDING_ADMIN,WITH_DEPOT,WITH_URC,URC_SUBMITTED' },
  { id: 'created', label: 'Dealer created', statuses: 'DEALER_CREATED' },
  { id: 'closed', label: 'Rejected / Cancelled', statuses: 'REJECTED,CANCELLED' },
];

export default function OemDealerRequests() {
  const [showNew, setShowNew] = useState(false);
  return (
    <>
      <DealerRequestsBoard
        title="New Dealer Requests"
        subtitle="Request a new authorized dealer. It is verified on site through Depot and URC, and the Admin then creates the dealer."
        breadcrumbs={[{ label: 'OEM Portal', href: '/oem/dashboard' }, { label: 'Dealer Requests' }]}
        tabs={TABS}
        onNew={() => setShowNew(true)}
        showDepot
        showUrc
        renderActions={(r, ctx) => <OemActions request={r} close={ctx.close} />}
      />
      {showNew && <NewDealerRequestModal onClose={() => setShowNew(false)} />}
    </>
  );
}
