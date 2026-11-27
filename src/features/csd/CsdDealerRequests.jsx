import React from 'react';
import DealerRequestsBoard from '../dealerRequest/DealerRequestsBoard.jsx';
import AdminActions from '../dealerRequest/AdminActions.jsx';

const TABS = [
  { id: 'action', label: 'Needs my action', statuses: 'PENDING_ADMIN,DEPOT_VERIFIED' },
  { id: 'field', label: 'With Depot', statuses: 'WITH_DEPOT' },
  { id: 'created', label: 'Dealer created', statuses: 'DEALER_CREATED' },
  { id: 'closed', label: 'Rejected / Cancelled', statuses: 'REJECTED,CANCELLED' },
  { id: 'all', label: 'All', statuses: '' },
];

export default function CsdDealerRequests() {
  return (
    <DealerRequestsBoard
      title="Dealer Requests"
      subtitle="OEM requests for new dealers. Forward to the depot (auto-selected by state), review the depot's verification, then approve to create the dealer automatically."
      breadcrumbs={[{ label: 'Admin', href: '/csd/dashboard' }, { label: 'Dealer Requests' }]}
      tabs={TABS}
      showOem
      showDepot
      renderActions={(r, ctx) => <AdminActions key={`${r._id}-${r.status}`} request={r} close={ctx.close} />}
    />
  );
}
