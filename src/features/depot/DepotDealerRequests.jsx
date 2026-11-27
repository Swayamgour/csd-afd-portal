// import React from 'react';
import DealerRequestsBoard from '../dealerRequest/DealerRequestsBoard.jsx';
import DepotActions from '../dealerRequest/DepotActions.jsx';

const TABS = [
  { id: 'all', label: 'All', statuses: '' },
  { id: 'todo', label: 'To verify', statuses: 'WITH_DEPOT' },
  { id: 'submitted', label: 'Submitted to Admin', statuses: 'DEPOT_VERIFIED' },
  { id: 'done', label: 'Completed', statuses: 'DEALER_CREATED,REJECTED,CANCELLED' },
];

export default function DepotDealerRequests() {
  return (
    <DealerRequestsBoard
      title="Dealer Verification Requests"
      subtitle="New dealer requests forwarded by Admin. Verify the dealer, upload the report and photos, then submit to Admin."
      breadcrumbs={[{ label: 'Depot Portal', href: '/depot/dashboard' }, { label: 'Dealer Requests' }]}
      tabs={TABS}
      showOem
      depotView
      renderActions={(r, ctx) => <DepotActions request={r} close={ctx.close} />}
    />
  );
}
