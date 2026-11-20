import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Edit3 } from 'lucide-react';
import { getRejectionReason, canResubmit } from '../../utils/demandStatus.js';

/** Shown to the beneficiary when the depot rejected the demand: remark + "Edit & Resubmit" entry point. */
export default function DemandRejectionBanner({ demand }) {
  if (!demand || demand.status !== 'REJECTED') return null;
  const reason = getRejectionReason(demand);
  const resubmittable = canResubmit(demand);
  return (
    <div className="csd-alert-banner danger mb-4" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
      <XCircle size={20} className="alert-banner-icon" color="#b91c1c" />
      <div style={{ flex: 1 }}>
        <strong style={{ color: '#b91c1c' }}>Rejected by Depot</strong>
        <p className="mb-0 text-xs" style={{ color: '#7f1d1d', marginTop: '2px' }}>
          <strong>Remark:</strong> {reason || 'No remark was provided.'}
        </p>
        {resubmittable && (
          <p className="mb-0 text-xs" style={{ color: '#7f1d1d', marginTop: '2px' }}>
            Correct the details / documents and resubmit — the demand goes back to the depot for approval.
          </p>
        )}
      </div>
      {resubmittable && (
        <Link to={`/demands/${demand._id || demand.id}/resubmit`} className="btn-primary-action flex-align-center-gap-xs" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
          <Edit3 size={15} /> Edit &amp; Resubmit
        </Link>
      )}
    </div>
  );
}
