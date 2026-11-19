import React, { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { useCancelDealerRequestMutation } from '../../redux/api/dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { ErrorBanner, RemarksField, ActionBox } from './ActionBits.jsx';

// OEM can withdraw a request until it reaches the URC
export default function OemActions({ request, close }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [cancel, { isLoading }] = useCancelDealerRequestMutation();

  if (!['PENDING_ADMIN', 'WITH_DEPOT'].includes(request.status)) return null;

  const run = async () => {
    setErr('');
    if (reason.trim().length < 3) return setErr('Please give a reason (min 3 characters).');
    try {
      await cancel({ id: request._id, reason: reason.trim() }).unwrap();
      close();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return !open ? (
    <Button variant="danger" size="sm" onClick={() => setOpen(true)}>Cancel this request</Button>
  ) : (
    <ActionBox title="Cancel request">
      <ErrorBanner message={err} />
      <RemarksField id="oem-cancel" label="Reason" required value={reason} onChange={setReason} />
      <div className="row gap-1" style={{ marginTop: 10 }}>
        <Button variant="danger" size="sm" loading={isLoading} onClick={run}>Confirm cancel</Button>
        <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isLoading}>Back</Button>
      </div>
    </ActionBox>
  );
}
