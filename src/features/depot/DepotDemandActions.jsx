import React, { useState } from 'react';
import { Eye, MessageSquare, Banknote, Upload, CheckCircle2, XCircle } from 'lucide-react';
import AddPaymentDetailsModal from './modals/AddPaymentDetailsModal.jsx';
import UploadSupplyOrderModal from './modals/UploadSupplyOrderModal.jsx';
import ApproveRejectModal from './modals/ApproveRejectModal.jsx';
import DepotNotesModal from './modals/DepotNotesModal.jsx';
import DemandSummaryModal from './modals/DemandSummaryModal.jsx';
import { useRecordPaymentDetailsMutation } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import {
  depotCanRecordPayment,
  depotCanUploadSupplyOrder,
  depotCanReject,
  hasPaymentDetails,
  hasSupplyOrderDocs,
  depotCanApprove,
  depotCanStage1Approve,
} from '../../utils/demandStatus.js';

/**
 * Depot Manual actions for a demand: Summary, Notes, Payment Received By CSD,
 * Upload Local Supply Order, Approve (=> Supply Order Issued), Reject (=> refund).
 */
export default function DepotDemandActions({ demand, onChanged }) {
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [recordPaymentDetails] = useRecordPaymentDetailsMutation();
  const close = () => { setModal(null); setErr(''); };
  const id = demand._id || demand.id;

  const savePayment = async (payload) => {
    setSaving(true);
    setErr('');
    try {
      await recordPaymentDetails({ id, ...payload }).unwrap();
      close();
      onChanged && onChanged();
    } catch (e) {
      setErr(getErrorMessage(e, 'Could not save payment details.'));
    } finally {
      setSaving(false);
    }
  };

  const btn = { display: 'inline-flex', alignItems: 'center', gap: 4 };
  return (
    <>
      <div className="row gap-1 flex-wrap">
        <button className="btn sm out" style={btn} onClick={() => setModal('summary')}><Eye size={13} /> Summary</button>
        <button className="btn sm out" style={btn} onClick={() => setModal('notes')}><MessageSquare size={13} /> Notes</button>
        {depotCanRecordPayment(demand) && !hasPaymentDetails(demand) && (
          <button className="btn sm" style={btn} onClick={() => setModal('payment')}><Banknote size={13} /> Payment Received By CSD</button>
        )}
        {depotCanUploadSupplyOrder(demand) && (
          <button className="btn sm out" style={btn} onClick={() => setModal('upload')}>
            <Upload size={13} /> {hasSupplyOrderDocs(demand) ? 'Re-upload Supply Order' : 'Upload Local Supply Order'}
          </button>
        )}
        {(depotCanStage1Approve(demand) || depotCanRecordPayment(demand)) && (
          <button
            className="btn sm"
            style={{ ...btn, background: '#16a34a', borderColor: '#16a34a', color: '#fff' }}
            title={depotCanApprove(demand) ? '' : 'Record payment details and upload supply order first'}
            onClick={() => setModal('approve')}
          >
            <CheckCircle2 size={13} /> {depotCanStage1Approve(demand) ? 'Approve (enable payment)' : 'Approve (issue supply order)'}
          </button>
        )}
        {depotCanReject(demand) && (
          <button className="btn sm out text-danger" style={btn} onClick={() => setModal('reject')}><XCircle size={13} /> Reject</button>
        )}
      </div>

      <DemandSummaryModal isOpen={modal === 'summary'} onClose={close} demand={demand} />
      <DepotNotesModal isOpen={modal === 'notes'} onClose={close} demand={demand} />
      <AddPaymentDetailsModal isOpen={modal === 'payment'} onClose={close} demand={demand} onSave={savePayment} saving={saving} serverError={err} />
      <UploadSupplyOrderModal isOpen={modal === 'upload'} onClose={close} demand={demand} onSaved={onChanged} />
      <ApproveRejectModal isOpen={modal === 'approve'} onClose={close} demand={demand} mode="approve" onDone={onChanged} />
      <ApproveRejectModal isOpen={modal === 'reject'} onClose={close} demand={demand} mode="reject" onDone={onChanged} />
    </>
  );
}
