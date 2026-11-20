import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { ErrorState } from '../../components/common/States.jsx';
import DepotDemandActions from './DepotDemandActions.jsx';
import { useGetDemandByIdQuery, useGetDemandsQuery } from '../../redux/api/demandApi.js';
import { fmtINR, getStatusLabel, hasPaymentDetails, hasSupplyOrderDocs } from '../../utils/demandStatus.js';
import Loader from '../../components/common/Loader.jsx';

const Step = ({ done, label }) => (
  <li style={{ listStyle: 'none', margin: '4px 0' }}>{done ? '✅' : '⬜'} {label}</li>
);

export function DepotDemandDetail() {
  const { id } = useParams();
  const { data: raw, isLoading, error, refetch } = useGetDemandByIdQuery(id);
  // list items carry latestPayment (incl. bank-transfer details); the single-demand endpoint may not
  const { data: list } = useGetDemandsQuery();

  if (isLoading) return <Loader label="Loading demand..." />;
  if (error || !raw) return <ErrorState message="Demand could not be loaded." />;

  const fromList = (list?.items || []).find((d) => String(d._id || d.id) === String(id));
  const demand = { ...(raw?.data || raw), latestPayment: fromList?.latestPayment || raw?.latestPayment, statusLabel: fromList?.statusLabel || raw?.statusLabel };

  return (
    <div>
      <div className="mb-2">
        <Link to="/depot/demands" className="row align-center gap-1 link small font-semibold"><ArrowLeft size={16} /> Back to Demands</Link>
      </div>
      <PageHeader
        title={`Demand ${demand.demandNo || String(demand._id).slice(-8).toUpperCase()}`}
        subtitle={`${demand.productSnapshot?.name || ''} · ${fmtINR(demand.totalAmount)}`}
        badge={<StatusBadge status={demand.status} />}
      />
      {Number(demand.resubmissionCount) > 0 && (
        <div className="csd-alert-banner info mb-2">
          <div>
            <strong>Resubmitted by beneficiary ({demand.resubmissionCount})</strong>
            <p className="mb-0 text-xs">
              Previously rejected: {(demand.rejectionHistory || []).map((r) => r.reason).filter(Boolean).join(' | ') || demand.rejectionReason || '—'}. Please re-verify the corrected details and documents.
            </p>
          </div>
        </div>
      )}
      <Card title="Depot workflow" subtitle={getStatusLabel(demand)}>
        <ol style={{ padding: 0 }}>
          <Step done={!['CREATED'].includes(String(demand.status).toUpperCase())} label="Stage 1: demand scrutinised and approved (payment enabled)" />
          <Step done={['PAID', 'PENDING_VERIFICATION'].includes(String(demand.paymentStatus).toUpperCase())} label="Payment made by beneficiary" />
          <Step done={hasPaymentDetails(demand)} label="Payment Received By CSD recorded (OR, bank ref, PO)" />
          <Step done={hasSupplyOrderDocs(demand)} label="Local Supply Order uploaded (Official Receipt, Supply Order, Authority Letter)" />
          <Step done={['SUPPLY_ORDER_ISSUED', 'COMPLETED'].includes(String(demand.status).toUpperCase())} label="Stage 2: approved — Supply Order issued to URC" />
        </ol>
        <div className="mt-2"><DepotDemandActions demand={demand} onChanged={refetch} /></div>
      </Card>
    </div>
  );
}
export default DepotDemandDetail;
