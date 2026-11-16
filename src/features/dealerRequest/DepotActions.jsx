import React, { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import { useGetMyUrcsForDealerRequestsQuery, useForwardDealerRequestToUrcMutation } from './dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { ErrorBanner, RemarksField, ActionBox } from './ActionBits.jsx';

// Depot picks one of its own URCs to physically verify the dealer
export default function DepotActions({ request, close }) {
  const { data: urcs = [], isLoading: loadingUrcs } = useGetMyUrcsForDealerRequestsQuery(undefined, { skip: request.status !== 'WITH_DEPOT' });
  const [forward, { isLoading }] = useForwardDealerRequestToUrcMutation();
  const [urcId, setUrcId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [err, setErr] = useState('');

  if (request.status !== 'WITH_DEPOT') return null;

  const run = async () => {
    setErr('');
    if (!urcId) return setErr('Select a URC to verify the dealer.');
    try {
      await forward({ id: request._id, urcId, remarks: remarks.trim() || undefined }).unwrap();
      close();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <ActionBox title="Forward to URC for site verification">
      <ErrorBanner message={err} />
      <Select
        id="depot-urc"
        label="URC"
        required
        value={urcId}
        onChange={(e) => setUrcId(e.target.value)}
        placeholder={loadingUrcs ? 'Loading URCs…' : urcs.length ? 'Select URC' : 'No active URC under this depot'}
        options={urcs.map((u) => ({ value: u._id, label: `${u.name} (${u.code})${u.city ? ` - ${u.city}` : ''}` }))}
      />
      <RemarksField id="depot-remarks" label="Instructions for URC" value={remarks} onChange={setRemarks} />
      <div style={{ marginTop: 10 }}>
        <Button size="sm" loading={isLoading} disabled={!urcs.length} onClick={run}>Forward to URC</Button>
      </div>
    </ActionBox>
  );
}
