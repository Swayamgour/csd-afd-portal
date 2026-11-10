import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetPaymentsQuery,
  useGetPaymentStatusQuery,
  useReverifyGatewayPaymentMutation,
} from './paymentApi.js';
import { readPendingPayment, clearPendingPayment, gatewayLabel } from '../../utils/gatewayCheckout.js';
import { getErrorMessage } from '../../utils/apiError.js';

/**
 * Where SBIePay / NDML send the browser back to:  /payments/result?paymentNo=..&status=SUCCESS|FAILED|PENDING|ERROR
 * The `status` in the URL is only a hint - anyone can type it. The real state comes from
 * GET /payments/:id/status, which the server re-verifies with the gateway while the payment is in flight.
 */
const POLL_MS = 4000;
const MAX_POLLS = 30; // ~2 minutes, then offer a manual check

export default function PaymentResult() {
  const [params] = useSearchParams();
  const urlStatus = String(params.get('status') || '').toUpperCase();
  const pending = readPendingPayment();
  const paymentNo = params.get('paymentNo') || pending?.paymentNo || '';

  // /initiate returns paymentNo but the status endpoint is keyed by the payment id, so find it in the list
  const { data: list, isLoading: loadingList, refetch: refetchList } = useGetPaymentsQuery(undefined, { skip: !paymentNo });
  const payment = (list?.items || []).find((p) => p.paymentNo === paymentNo);
  const paymentId = payment?._id;

  const [polls, setPolls] = useState(0);
  const finalRef = useRef(false);
  const { data: live, error: statusError, refetch } = useGetPaymentStatusQuery(paymentId, {
    skip: !paymentId,
    pollingInterval: paymentId && !finalRef.current && polls < MAX_POLLS ? POLL_MS : 0,
    refetchOnMountOrArgChange: true,
  });
  const [reverify, { isLoading: reverifying }] = useReverifyGatewayPaymentMutation();
  const [manualError, setManualError] = useState('');

  const status = String(live?.status || payment?.status || '').toUpperCase();
  const isSuccess = status === 'SUCCESS';
  const isFailed = ['FAILED', 'CANCELLED'].includes(status);
  const isRefunded = ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(status);
  const settled = isSuccess || isFailed || isRefunded;

  useEffect(() => {
    if (live) setPolls((n) => n + 1);
  }, [live]);

  useEffect(() => {
    if (settled) {
      finalRef.current = true;
      clearPendingPayment();
    }
  }, [settled]);

  const checkNow = async () => {
    setManualError('');
    try {
      await reverify(paymentId).unwrap();
      setPolls(0);
      finalRef.current = false;
      refetch();
      refetchList();
    } catch (e) {
      setManualError(getErrorMessage(e, 'Could not check the payment right now. Please try again in a minute.'));
    }
  };

  const demandId = live?.demandId || payment?.demandId?._id || payment?.demandId || pending?.demandId;
  const gateway = payment?.provider || pending?.gateway;
  const amount = Number(live?.amount ?? payment?.amount ?? 0);

  let tone = 'pending';
  if (isSuccess) tone = 'success';
  else if (isFailed || urlStatus === 'ERROR') tone = 'failed';
  const stillChecking = !settled && urlStatus !== 'ERROR' && polls < MAX_POLLS;

  return (
    <div className="payment-result-page">
      <PageHeader
        title="Payment status"
        subtitle="We confirm every online payment directly with the bank."
        breadcrumbs={[{ label: 'Beneficiary', href: '/beneficiary/dashboard' }, { label: 'Payments', href: '/beneficiary/payments' }, { label: 'Status' }]}
      />

      <Card>
        <div className="text-center" style={{ padding: '1.5rem 1rem' }} role="status" aria-live="polite">
          {tone === 'success' && <CheckCircle2 size={56} color="#16a34a" aria-hidden />}
          {tone === 'failed' && <XCircle size={56} color="#dc2626" aria-hidden />}
          {tone === 'pending' && (stillChecking ? <Loader2 size={48} className="spin" aria-hidden /> : <Clock size={52} color="#d97706" aria-hidden />)}

          <h2 className="h2 mt-2 mb-1">
            {tone === 'success' && 'Payment successful'}
            {tone === 'failed' && (isFailed ? 'Payment failed' : 'We could not read the bank response')}
            {tone === 'pending' && (stillChecking ? 'Confirming your payment…' : 'Payment confirmation is taking longer than usual')}
          </h2>

          <p className="muted mb-3" style={{ maxWidth: 520, margin: '0 auto 1rem' }}>
            {tone === 'success' &&
              'The bank has confirmed your payment. Your demand is now with the depot, which will verify it and issue the Supply Order.'}
            {tone === 'failed' && isFailed &&
              (live?.failureReason && live.failureReason !== 'SUPERSEDED'
                ? `The bank reported: ${live.failureReason}. No money should be deducted; if it was, it will be returned by your bank. You can try again.`
                : 'The payment was not completed. If any money was deducted, it will be returned by your bank. You can try again.')}
            {tone === 'failed' && !isFailed &&
              'If money was deducted from your account, do not pay again. Open Payments to see whether it was confirmed, or contact the helpdesk.'}
            {tone === 'pending' &&
              (stillChecking
                ? 'Please wait on this page. Do not pay again.'
                : 'Your payment is still pending with the bank. If money was deducted it will be confirmed automatically within a few minutes. Do not pay again.')}
          </p>

          {(paymentNo || amount > 0 || gateway) && (
            <dl className="kv-list small" style={{ display: 'inline-grid', gridTemplateColumns: 'auto auto', gap: '.25rem 1rem', textAlign: 'left', marginBottom: '1rem' }}>
              {paymentNo && (<><dt className="muted">Payment no.</dt><dd className="font-mono m-0">{paymentNo}</dd></>)}
              {gateway && (<><dt className="muted">Gateway</dt><dd className="m-0">{gatewayLabel(gateway)}</dd></>)}
              {amount > 0 && (<><dt className="muted">Amount</dt><dd className="m-0">₹ {amount.toLocaleString('en-IN')}</dd></>)}
              {status && (<><dt className="muted">Status</dt><dd className="m-0">{status}</dd></>)}
            </dl>
          )}

          {manualError && (
            <div className="alert-banner error small mb-2 row align-center justify-center gap-1" role="alert">
              <AlertCircle size={16} /> <span>{manualError}</span>
            </div>
          )}
          {statusError && !manualError && (
            <p className="small muted">Could not refresh the status. {getErrorMessage(statusError, '')}</p>
          )}
          {!loadingList && paymentNo && !payment && (
            <p className="small muted">We could not find this payment in your account yet. Open Payments to check its status.</p>
          )}

          <div className="row gap-1 justify-center flex-wrap">
            {!settled && paymentId && (
              <Button variant="outline" onClick={checkNow} loading={reverifying} icon={RefreshCw}>Check status now</Button>
            )}
            {isFailed && demandId && (
              <Link to={`/beneficiary/demands/${demandId}`} className="btn">Try again</Link>
            )}
            {demandId && (
              <Link to={`/beneficiary/demands/${demandId}`} className={isSuccess ? 'btn' : 'btn out'}>View demand</Link>
            )}
            <Link to="/beneficiary/payments" className="btn out">Go to Payments</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
