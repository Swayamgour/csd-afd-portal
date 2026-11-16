import React from 'react';
import DealerRequestsBoard from '../dealerRequest/DealerRequestsBoard.jsx';
import UrcActions from '../dealerRequest/UrcActions.jsx';

const TABS = [
  { id: 'todo', label: 'To verify', statuses: 'WITH_URC' },
  { id: 'submitted', label: 'Submitted', statuses: 'URC_SUBMITTED' },
  { id: 'done', label: 'Completed', statuses: 'DEALER_CREATED,REJECTED' },
  { id: 'all', label: 'All', statuses: '' },
];

export default function UrcDealerRequests() {
  return (
    <DealerRequestsBoard
      title="Dealer Site Verification"
      subtitle="Visit the proposed dealer, record the location and photos, then submit your report to Admin."
      breadcrumbs={[{ label: 'URC Portal', href: '/urc/dashboard' }, { label: 'Dealer Verification' }]}
      tabs={TABS}
      showOem
      renderActions={(r, ctx) => <UrcActions key={`${r._id}-${r.status}`} request={r} close={ctx.close} />}
    />
  );
}
