import React from 'react';
import { X, FileText } from 'lucide-react';
import { useGetDemandSummaryQuery } from '../../demand/demandApi.js';
import { fmtINR } from '../../../utils/demandStatus.js';

const Row = ({ k, v }) => (
  <tr>
    <td className="muted" style={{ width: '38%' }}>{k}</td>
    <td><strong>{v ?? '—'}</strong></td>
  </tr>
);
const d8 = (x) => (x ? new Date(x).toLocaleDateString('en-GB') : '—');
const fileLink = (u) => (u ? <a href={u} target="_blank" rel="noreferrer" className="link">View</a> : '—');

/** Read-only "Summary" for the depot (Depot Manual): item, SKU-zone, price breakup, parties, documents, payment, supply order. */
export default function DemandSummaryModal({ isOpen, onClose, demand }) {
  const id = demand?._id || demand?.id;
  const { data: s, isLoading, error } = useGetDemandSummaryQuery(id, { skip: !isOpen || !id });
  if (!isOpen || !demand) return null;

  const pb = s?.priceBreakup;
  const t = demand.latestPayment?.transferDetails;
  const b = s?.beneficiary || {};
  const docs = Array.isArray(s?.documents) ? s.documents : [];
  const pd = s?.paymentDetails;

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container" style={{ maxWidth: 860, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <FileText size={18} className="text-brand" />
            <h3 className="csd-modal-title">Summary · {demand.demandNo || id}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>
        <div className="csd-modal-body">
          {isLoading && <p className="muted">Loading summary...</p>}
          {error && <div className="alert-banner error">Could not load summary.</div>}
          {s && (
            <>
              <h4>Item</h4>
              <table className="table"><tbody>
                <Row k="Status" v={s.statusLabel} />
                <Row k="Indent date" v={d8(s.createdAt)} />
                <Row k="Product" v={s.product?.name} />
                <Row k="SKU" v={s.product?.sku} />
                <Row k="Colour / Qty" v={`${s.product?.color || '—'} / ${s.product?.quantity || 1}`} />
                <Row k="Price zone" v={s.priceZone} />
                <Row k="Depot" v={s.depot?.name} />
                <Row k="URC" v={s.urc?.name} />
                <Row k="Dealer" v={s.dealer?.name} />
              </tbody></table>

              {pb && (
                <>
                  <h4 className="mt-2">Price breakup {pb.taxClass ? `(tax class ${pb.taxClass})` : ''}</h4>
                  <table className="table"><tbody>
                    {pb.skuZoneCode && <Row k="SKU-zone code" v={pb.skuZoneCode} />}
                    <Row k="Sub-total" v={fmtINR(pb.subtotal)} />
                    <Row k="Additional cost" v={fmtINR(pb.additionalCost)} />
                    <Row k="Cess" v={fmtINR(pb.cess)} />
                    <Row k="Incidental charges" v={fmtINR(pb.incidental)} />
                    <Row k="Net price to be paid" v={fmtINR(pb.net)} />
                    <Row k="Dealer price declared" v={s.dealerPriceDeclared != null ? fmtINR(s.dealerPriceDeclared) : '—'} />
                  </tbody></table>
                </>
              )}

              <h4 className="mt-2">Beneficiary</h4>
              <table className="table"><tbody>
                <Row k="Name" v={b.name} />
                <Row k="Canteen card" v={b.cardId} />
                <Row k="Mobile" v={b.mobile} />
                <Row k="Pay level" v={s.payLevel} />
                <Row k="Delivery address" v={[s.deliveryAddress?.address, s.deliveryAddress?.city, s.deliveryAddress?.state, s.deliveryAddress?.pinCode].filter(Boolean).join(', ')} />
              </tbody></table>

              <h4 className="mt-2">Documents</h4>
              <table className="table"><tbody>
                {docs.length === 0 && <tr><td className="muted">No documents</td></tr>}
                {docs.map((x, i) => <Row key={i} k={String(x.type || '').replace(/_/g, ' ')} v={fileLink(x.url)} />)}
                {s.loan?.isLoan && <Row k="Loan sanction letter" v={fileLink(s.loan.sanctionLetterUrl)} />}
              </tbody></table>

              <h4 className="mt-2">Payment by beneficiary ({s.paymentMethod || '—'})</h4>
              {t ? (
                <table className="table"><tbody>
                  <Row k="Receipt" v={fileLink(demand.latestPayment?.receiptUrl || t.receiptUrl)} />
                  <Row k="Bank / Account holder" v={`${t.self?.bankName || '—'} / ${t.self?.accountHolder || '—'}`} />
                  <Row k="Account no. / IFSC" v={`${t.self?.accountNumber || '—'} / ${t.self?.ifsc || '—'}`} />
                  <Row k="UTR" v={t.self?.utrNumber} />
                  <Row k="Amount / Date" v={`${fmtINR(t.self?.amountPaid)} / ${t.self?.paymentDate || '—'}`} />
                  {t.loan && <Row k="Loan: bank / UTR" v={`${t.loan.bankName} / ${t.loan.utrNumber}`} />}
                  {t.loan && <Row k="Loan: account / IFSC" v={`${t.loan.accountNumber} / ${t.loan.ifsc}`} />}
                  {t.loan && <Row k="Loan: amount / date" v={`${fmtINR(t.loan.amountPaid)} / ${t.loan.paymentDate || '—'}`} />}
                </tbody></table>
              ) : (
                <p className="small muted">{demand.latestPayment ? `Online payment ${demand.latestPayment.paymentNo || ''} (${demand.latestPayment.status})` : 'No payment recorded.'}</p>
              )}

              <h4 className="mt-2">Payment received by CSD</h4>
              {pd ? (
                <table className="table"><tbody>
                  <Row k="OR number / date" v={`${pd.orNumber} / ${d8(pd.orDate)}`} />
                  <Row k="Total amount received" v={fmtINR(pd.totalAmountReceived)} />
                  <Row k="CSD bank ref" v={pd.bankRefNumber} />
                  <Row k="PO number / date" v={`${pd.poNumber} / ${d8(pd.poDate)}`} />
                </tbody></table>
              ) : <p className="small muted">Pending — use “Payment Received By CSD”.</p>}

              <h4 className="mt-2">Local Supply Order</h4>
              {s.supplyOrder?.docs ? (
                <table className="table"><tbody>
                  <Row k="Supply order no." v={s.supplyOrder.no} />
                  <Row k="Official Receipt" v={fileLink(s.supplyOrder.docs.officialReceiptUrl)} />
                  <Row k="Supply Order" v={fileLink(s.supplyOrder.docs.supplyOrderUrl)} />
                  <Row k="Authority Letter" v={fileLink(s.supplyOrder.docs.authorityLetterUrl)} />
                </tbody></table>
              ) : <p className="small muted">Pending — use “Upload Local Supply Order”.</p>}
            </>
          )}
        </div>
        <div className="csd-modal-footer justify-end">
          <button type="button" className="btn-depot-manual-close" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}
