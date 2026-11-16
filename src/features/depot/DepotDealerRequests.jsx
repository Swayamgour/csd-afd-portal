import React from 'react';
import DealerRequestsBoard from '../dealerRequest/DealerRequestsBoard.jsx';
import DepotActions from '../dealerRequest/DepotActions.jsx';

const TABS = [
  { id: 'todo', label: 'To forward to URC', statuses: 'WITH_DEPOT' },
  { id: 'urc', label: 'With URC', statuses: 'WITH_URC' },
  { id: 'reported', label: 'URC reported', statuses: 'URC_SUBMITTED' },
  { id: 'done', label: 'Completed', statuses: 'DEALER_CREATED,REJECTED,CANCELLED' },
  { id: 'all', label: 'All', statuses: '' },
];

export default function DepotDealerRequests() {
  return (
    <DealerRequestsBoard
      title="Dealer Verification Requests"
      subtitle="New dealer requests forwarded by Admin. Assign one of your URCs to verify the dealer on site."
      breadcrumbs={[{ label: 'Depot Portal', href: '/depot/dashboard' }, { label: 'Dealer Requests' }]}
      tabs={TABS}
      showOem
      showUrc
      renderActions={(r, ctx) => <DepotActions request={r} close={ctx.close} />}
    />
  );
}
