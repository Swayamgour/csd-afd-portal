import React, { useState } from 'react';
import { Send, XCircle, UserPlus, Undo2, Warehouse, MailCheck } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import Input from '../../components/common/Input.jsx';
import {
  useGetDealerRequestDepotOptionsQuery,
  useForwardDealerRequestToDepotMutation,
  useSendBackDealerRequestMutation,
  useRejectDealerRequestMutation,
  useApproveDealerRequestMutation,
} from '../../redux/api/dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { ErrorBanner, RemarksField, ActionBox } from './ActionBits.jsx';

/**
 * Admin side of the flow
 *   PENDING_ADMIN   -> "Forward to depot"  (depot is selected automatically from the dealer's state)
 *   DEPOT_VERIFIED  -> "Approve & create dealer" (dealer + login are created automatically, email goes to the dealer)
 */
export default function AdminActions({ request, close }) {
  const [mode, setMode] = useState(null); // 'forward' | 'sendback' | 'reject' | 'approve'
  const [err, setErr] = useState('');
  const [depotId, setDepotId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState(null);
  const [adv, setAdv] = useState({ show: false, code: '', username: '', email: '' });

  const s = request.status;
  const needsDepot = s === 'PENDING_ADMIN';
  const { data: opt, isLoading: loadingDepots } = useGetDealerRequestDepotOptionsQuery(request._id, { skip: !needsDepot });
  const [forward, { isLoading: fwd }] = useForwardDealerRequestToDepotMutation();
  const [sendBack, { isLoading: sb }] = useSendBackDealerRequestMutation();
  const [reject, { isLoading: rej }] = useRejectDealerRequestMutation();
  const [approve, { isLoading: apr }] = useApproveDealerRequestMutation();

  const final = ['DEALER_CREATED', 'REJECTED', 'CANCELLED'].includes(s);

  // approved just now: show what happened instead of closing silently
  if (result) {
    return (
      <ActionBox title="Dealer created">
        <p className="small" style={{ margin: '0 0 6px' }}>
          <MailCheck size={14} aria-hidden /> Dealer <b>{result.dealer?.name}</b> ({result.dealer?.code}) is created. Username: <b>{result.user?.username}</b>
        </p>
        <p className="micro muted" style={{ margin: '0 0 10px' }}>
          {result.emailStatus === 'SENT' && 'Congratulation email with the username has been sent to the dealer. The dealer sets the password with “Forgot Password”.'}
          {result.emailStatus === 'QUEUED' && 'Email could not be sent right now and is queued for retry. Dealer can still use “Forgot Password”.'}
          {result.emailStatus === 'FAILED' && 'Email could not be sent. Please share the username with the dealer; the dealer sets the password with “Forgot Password”.'}
        </p>
        <Button size="sm" variant="outline" onClick={close}>Close</Button>
      </ActionBox>
    );
  }
  if (final) return null;

  const depots = opt?.depots || [];
  const auto = opt?.autoSelected || null;
  const stateLabel = opt?.state || request.dealer?.state || '—';
  const canForward = s === 'PENDING_ADMIN';
  const canApprove = s === 'DEPOT_VERIFIED';
  const canSendBack = s === 'DEPOT_VERIFIED';
  const waitingDepot = s === 'WITH_DEPOT' || s === 'WITH_URC' || s === 'URC_SUBMITTED';

  const fail = (e) => setErr(getErrorMessage(e));
  const open = (m) => { setErr(''); setMode(m); };

  const doForward = async () => {
    const chosen = auto ? undefined : depotId;
    if (!auto && !chosen) return setErr('Select a depot.');
    try { await forward({ id: request._id, depotId: chosen, remarks: remarks.trim() || undefined }).unwrap(); close(); } catch (e) { fail(e); }
  };
  const doSendBack = async () => {
    if (remarks.trim().length < 3) return setErr('Tell the depot what to re-check (min 3 characters).');
    try { await sendBack({ id: request._id, remarks: remarks.trim() }).unwrap(); close(); } catch (e) { fail(e); }
  };
  const doReject = async () => {
    if (reason.trim().length < 3) return setErr('Please give a reason (min 3 characters).');
    try { await reject({ id: request._id, reason: reason.trim() }).unwrap(); close(); } catch (e) { fail(e); }
  };
  const doApprove = async () => {
    const body = {};
    if (adv.code.trim()) {
      if (!/^[A-Za-z0-9_-]{2,40}$/.test(adv.code.trim())) return setErr('Dealer code: only letters, digits, - and _.');
      body.code = adv.code.trim();
    }
    if (adv.username.trim()) {
      if (!/^[a-z0-9._-]{3,50}$/i.test(adv.username.trim())) return setErr('Username: 3+ characters, letters, digits . _ - only.');
      body.username = adv.username.trim();
    }
    if (adv.email.trim()) {
      if (!/^\S+@\S+\.\S+$/.test(adv.email.trim())) return setErr('Enter a valid email.');
      body.email = adv.email.trim();
    }
    try { setResult(await approve({ id: request._id, ...body }).unwrap()); } catch (e) { fail(e); }
  };

  return (
    <div>
      {waitingDepot && (
        <p className="small" style={{ margin: '0 0 8px' }}>
          Waiting for the depot ({request.depotId?.name || '—'}) to verify the dealer and submit its report.
        </p>
      )}

      {!mode && (
        <div className="row gap-1 flex-wrap">
          {canForward && <Button size="sm" icon={Send} onClick={() => open('forward')}>Forward to depot</Button>}
          {canApprove && <Button size="sm" icon={UserPlus} onClick={() => open('approve')}>Approve &amp; create dealer</Button>}
          {canSendBack && <Button size="sm" variant="outline" icon={Undo2} onClick={() => open('sendback')}>Send back for re-verification</Button>}
          <Button size="sm" variant="danger" icon={XCircle} onClick={() => open('reject')}>Reject</Button>
        </div>
      )}

      {mode === 'forward' && (
        <ActionBox title="Forward to depot">
          <ErrorBanner message={err} />
          {loadingDepots && <p className="small muted">Finding depot for {stateLabel}…</p>}
          {!loadingDepots && auto && (
            <p className="small" style={{ margin: '0 0 6px' }}>
              <Warehouse size={14} aria-hidden /> Depot selected automatically for <b>{stateLabel}</b>: <b>{auto.name}</b> ({auto.code}){auto.city ? ` - ${auto.city}` : ''}
            </p>
          )}
          {!loadingDepots && !auto && depots.length > 1 && (
            <Select
              id="adm-depot"
              label={`Depot in ${stateLabel}`}
              required
              value={depotId}
              onChange={(e) => setDepotId(e.target.value)}
              placeholder="Select depot"
              options={depots.map((d) => ({ value: d._id, label: `${d.name} (${d.code})${d.city ? ` - ${d.city}` : ''}` }))}
            />
          )}
          {!loadingDepots && !auto && depots.length === 0 && (
            <p className="small text-danger">No active depot found for {stateLabel}. Create a depot for this state first.</p>
          )}
          <RemarksField id="adm-fwd" value={remarks} onChange={setRemarks} />
          <div className="row gap-1" style={{ marginTop: 10 }}>
            <Button size="sm" loading={fwd} disabled={loadingDepots || depots.length === 0} onClick={doForward}>Forward</Button>
            <Button size="sm" variant="outline" onClick={() => setMode(null)} disabled={fwd}>Back</Button>
          </div>
        </ActionBox>
      )}

      {mode === 'sendback' && (
        <ActionBox title="Send back to depot for re-verification">
          <ErrorBanner message={err} />
          <RemarksField id="adm-sb" label="What should be re-checked?" required value={remarks} onChange={setRemarks} />
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

      {mode === 'approve' && (
        <ActionBox title="Approve & create dealer">
          <p className="small" style={{ margin: '0 0 6px' }}>
            The dealer <b>{request.dealer?.name}</b> and its login are created automatically. A congratulation email with the username goes to{' '}
            <b>{request.dealer?.email || 'the dealer email'}</b>; the dealer sets the password using “Forgot Password”.
          </p>
          <p className="micro muted" style={{ margin: '0 0 8px' }}>
            Depot: {request.depotId?.name || '—'} · OEM: {request.oemId?.name || '—'} · Code: {request.dealer?.proposedCode || 'not given - enter below'}
          </p>
          <ErrorBanner message={err} />
          {!adv.show ? (
            <Button size="xs" variant="outline" onClick={() => setAdv((a) => ({ ...a, show: true }))}>Change code / username / email (optional)</Button>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
              <Input id="adm-code" label="Dealer code" value={adv.code} placeholder={request.dealer?.proposedCode || ''} onChange={(e) => setAdv((a) => ({ ...a, code: e.target.value }))} />
              <Input id="adm-user" label="Username" autoComplete="off" value={adv.username} placeholder="auto from code" onChange={(e) => setAdv((a) => ({ ...a, username: e.target.value }))} />
              <Input id="adm-email" label="Dealer email" type="email" value={adv.email} placeholder={request.dealer?.email || ''} onChange={(e) => setAdv((a) => ({ ...a, email: e.target.value }))} />
            </div>
          )}
          <div className="row gap-1" style={{ marginTop: 10 }}>
            <Button size="sm" icon={UserPlus} loading={apr} onClick={doApprove}>Approve &amp; create dealer</Button>
            <Button size="sm" variant="outline" onClick={() => setMode(null)} disabled={apr}>Back</Button>
          </div>
        </ActionBox>
      )}
    </div>
  );
}
