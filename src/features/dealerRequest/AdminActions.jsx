import React, { useMemo, useState } from 'react';
import { Send, XCircle, UserPlus, Undo2 } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import Input from '../../components/common/Input.jsx';
import { useGetDepotsQuery } from '../../redux/api/orgApi.js';
import {
  useForwardDealerRequestToDepotMutation,
  useSendBackDealerRequestMutation,
  useRejectDealerRequestMutation,
  useCreateDealerFromRequestMutation,
} from '../../redux/api/dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { ErrorBanner, RemarksField, ActionBox } from './ActionBits.jsx';

const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase();
const PASSWORD_RE = { upper: /[A-Z]/, lower: /[a-z]/, digit: /\d/ };

export default function AdminActions({ request, close }) {
  const [mode, setMode] = useState(null); // 'forward' | 'sendback' | 'reject' | 'create'
  const [err, setErr] = useState('');
  const [depotId, setDepotId] = useState(request.depotId?._id || '');
  const [remarks, setRemarks] = useState('');
  const [reason, setReason] = useState('');
  const [acc, setAcc] = useState({ code: request.dealer?.proposedCode || '', username: '', password: '' });

  const { data: depots = [], isLoading: loadingDepots } = useGetDepotsQuery({ active: true, limit: 200 });
  const [forward, { isLoading: fwd }] = useForwardDealerRequestToDepotMutation();
  const [sendBack, { isLoading: sb }] = useSendBackDealerRequestMutation();
  const [reject, { isLoading: rej }] = useRejectDealerRequestMutation();
  const [createDealer, { isLoading: crt }] = useCreateDealerFromRequestMutation();

  const reqState = norm(request.dealer?.state);
  // depots in the dealer's state first (backend also enforces the state match)
  const depotOptions = useMemo(() => {
    const list = Array.isArray(depots) ? depots : [];
    const same = reqState ? list.filter((d) => !d.state || norm(d.state) === reqState) : list;
    return same.map((d) => ({ value: d._id, label: `${d.name} (${d.code})${d.city ? ` - ${d.city}` : ''}${d.state ? `, ${d.state}` : ''}` }));
  }, [depots, reqState]);

  const s = request.status;
  const final = ['DEALER_CREATED', 'REJECTED', 'CANCELLED'].includes(s);
  if (final) return null;

  const canForward = s === 'PENDING_ADMIN';
  const canSendBack = ['WITH_URC', 'URC_SUBMITTED'].includes(s);
  const verified = s === 'URC_SUBMITTED' && request.verification?.result === 'VERIFIED';

  const fail = (e) => setErr(getErrorMessage(e));
  const open = (m) => { setErr(''); setMode(m); };

  const doForward = async () => {
    if (!depotId) return setErr('Select a depot.');
    try { await forward({ id: request._id, depotId, remarks: remarks.trim() || undefined }).unwrap(); close(); } catch (e) { fail(e); }
  };
  const doSendBack = async () => {
    if (!depotId) return setErr('Select a depot.');
    try { await sendBack({ id: request._id, depotId, remarks: remarks.trim() || undefined }).unwrap(); close(); } catch (e) { fail(e); }
  };
  const doReject = async () => {
    if (reason.trim().length < 3) return setErr('Please give a reason (min 3 characters).');
    try { await reject({ id: request._id, reason: reason.trim() }).unwrap(); close(); } catch (e) { fail(e); }
  };
  const doCreate = async () => {
    const code = acc.code.trim();
    if (!code) return setErr('Dealer code is required.');
    if (!/^[A-Za-z0-9_-]{2,40}$/.test(code)) return setErr('Dealer code: only letters, digits, - and _.');
    if (!/^[a-z0-9._-]{3,50}$/i.test(acc.username.trim())) return setErr('Username: 3+ characters, letters, digits . _ - only.');
    const p = acc.password;
    if (p.length < 8 || !PASSWORD_RE.upper.test(p) || !PASSWORD_RE.lower.test(p) || !PASSWORD_RE.digit.test(p)) {
      return setErr('Password needs 8+ characters with a capital letter, a small letter and a digit.');
    }
    try {
      await createDealer({ id: request._id, code, username: acc.username.trim(), password: p }).unwrap();
      close();
    } catch (e) { fail(e); }
  };

  const depotSelect = (
    <Select
      id="adm-depot"
      label="Depot"
      required
      value={depotId}
      onChange={(e) => setDepotId(e.target.value)}
      placeholder={loadingDepots ? 'Loading depots…' : depotOptions.length ? 'Select depot' : `No active depot${reqState ? ` in ${reqState}` : ''}`}
      options={depotOptions}
    />
  );

  return (
    <div>
      {s === 'URC_SUBMITTED' && !verified && (
        <p className="small" style={{ margin: '0 0 8px' }}>
          The URC could not verify this dealer. You can send it back to the depot for another verification, or reject it.
        </p>
      )}

      {!mode && (
        <div className="row gap-1 flex-wrap">
          {canForward && <Button size="sm" icon={Send} onClick={() => open('forward')}>Forward to depot</Button>}
          {verified && <Button size="sm" icon={UserPlus} onClick={() => open('create')}>Create dealer</Button>}
          {canSendBack && <Button size="sm" variant="outline" icon={Undo2} onClick={() => open('sendback')}>Send back for re-verification</Button>}
          <Button size="sm" variant="danger" icon={XCircle} onClick={() => open('reject')}>Reject</Button>
        </div>
      )}

      {mode === 'forward' && (
        <ActionBox title="Forward to depot">
          <ErrorBanner message={err} />
          {depotSelect}
          <RemarksField id="adm-fwd" value={remarks} onChange={setRemarks} />
          <div className="row gap-1" style={{ marginTop: 10 }}>
            <Button size="sm" loading={fwd} onClick={doForward}>Forward</Button>
            <Button size="sm" variant="outline" onClick={() => setMode(null)} disabled={fwd}>Back</Button>
          </div>
        </ActionBox>
      )}

      {mode === 'sendback' && (
        <ActionBox title="Send back to depot for re-verification">
          <ErrorBanner message={err} />
          {depotSelect}
          <RemarksField id="adm-sb" label="What should be re-checked?" value={remarks} onChange={setRemarks} />
          <div className="row gap-1" style={{ marginTop: 10 }}>
            <Button size="sm" loading={sb} onClick={doSendBack}>Send back</Button>
            <Button size="sm" variant="outline" onClick={() => setMode(null)} disabled={sb}>Back</Button>
          </div>
        </ActionBox>
      )}

      {mode === 'reject' && (
        <ActionBox title="Reject request">
          <ErrorBanner message={err} />
          <RemarksField id="adm-rej" label="Reason" required value={reason} onChange={setReason} />
          <div className="row gap-1" style={{ marginTop: 10 }}>
            <Button size="sm" variant="danger" loading={rej} onClick={doReject}>Confirm reject</Button>
            <Button size="sm" variant="outline" onClick={() => setMode(null)} disabled={rej}>Back</Button>
          </div>
        </ActionBox>
      )}

      {mode === 'create' && (
        <ActionBox title="Create dealer account">
          <p className="micro muted" style={{ margin: '0 0 8px' }}>
            The dealer and its login are created only now, by you. Depot: {request.depotId?.name || '—'} · OEM: {request.oemId?.name || '—'}
          </p>
          <ErrorBanner message={err} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            <Input id="adm-code" label="Dealer code" required value={acc.code} onChange={(e) => setAcc((a) => ({ ...a, code: e.target.value }))} />
            <Input id="adm-user" label="Login username" required autoComplete="off" value={acc.username} onChange={(e) => setAcc((a) => ({ ...a, username: e.target.value }))} />
            <Input id="adm-pass" label="Temporary password" type="password" required autoComplete="new-password" value={acc.password} onChange={(e) => setAcc((a) => ({ ...a, password: e.target.value }))} helperText="Dealer must change it at first login" />
          </div>
          <div className="row gap-1" style={{ marginTop: 10 }}>
            <Button size="sm" icon={UserPlus} loading={crt} onClick={doCreate}>Create dealer</Button>
            <Button size="sm" variant="outline" onClick={() => setMode(null)} disabled={crt}>Back</Button>
          </div>
        </ActionBox>
      )}
    </div>
  );
}
