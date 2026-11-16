import React from 'react';
import DealerRequestsBoard from '../dealerRequest/DealerRequestsBoard.jsx';
import AdminActions from '../dealerRequest/AdminActions.jsx';

const TABS = [
  { id: 'action', label: 'Needs my action', statuses: 'PENDING_ADMIN,URC_SUBMITTED' },
  { id: 'field', label: 'With Depot / URC', statuses: 'WITH_DEPOT,WITH_URC' },
  { id: 'created', label: 'Dealer created', statuses: 'DEALER_CREATED' },
  { id: 'closed', label: 'Rejected / Cancelled', statuses: 'REJECTED,CANCELLED' },
  { id: 'all', label: 'All', statuses: '' },
];

export default function CsdDealerRequests() {
  return (
    <DealerRequestsBoard
      title="Dealer Requests"
      subtitle="OEM requests for new dealers. Forward to a depot, review the URC site-verification report, then create the dealer."
      breadcrumbs={[{ label: 'Admin', href: '/csd/dashboard' }, { label: 'Dealer Requests' }]}
      tabs={TABS}
      showOem
      showDepot
      showUrc
      renderActions={(r, ctx) => <AdminActions key={`${r._id}-${r.status}`} request={r} close={ctx.close} />}
    />
  );
}
