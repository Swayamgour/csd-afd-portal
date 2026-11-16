import React, { useState } from 'react';
import { RefreshCw, Download, CheckCircle2, AlertCircle, Phone, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { apiClient } from '../../services/apiClient.js';

// The 3 Local Supply Order documents uploaded by the depot.
// When the URC has downloaded all three, the backend marks the demand COMPLETED.
const DOCS = [
  { key: 'official-receipt', urlField: 'officialReceiptUrl', atField: 'officialReceiptAt', label: 'Official Receipt' },
  { key: 'supply-order', urlField: 'supplyOrderUrl', atField: 'supplyOrderAt', label: 'Supply Order' },
  { key: 'authority-letter', urlField: 'authorityLetterUrl', atField: 'authorityLetterAt', label: 'Authority Letter' },
];

const extOf = (url = '') => {
  const m = /\.[a-zA-Z0-9]{2,5}$/.exec(String(url).split('?')[0]);
  return m ? m[0] : '.pdf';
};

const fmtMoney = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
const pretty = (v) => (v ? String(v).replace(/_/g, ' ') : '—');

// Beneficiary details: name/phone/email come from the user (userId), card/category from beneficiaryId
const personOf = (r) => ({
  name: r.userId?.name || r.beneficiaryId?.fullName || 'Applicant',
  mobile: r.userId?.mobile || r.deliveryAddress?.mobile || '',
  email: r.userId?.email || '',
  cardId: r.beneficiaryId?.cardId || r.beneficiaryId?.serviceNumber || '',
  category: r.beneficiaryId?.category || '',
});

const Field = ({ label, children }) => (
  <div style={{ minWidth: 0 }}>
    <div className="micro muted">{label}</div>
    <div className="font-semibold" style={{ wordBreak: 'break-word' }}>{children || '—'}</div>
  </div>
);

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 16 }}>
    <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>{title}</h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      {children}
    </div>
  </section>
);

export default function UrcDemands() {
  const { data: demandsData, isLoading: loading, isFetching, refetch } = useGetDemandsQuery();

  const [busyKey, setBusyKey] = useState(null); // `${demandId}:${docKey|all}`
  const [msg, setMsg] = useState(null);
  const [selected, setSelected] = useState(null); // demand shown in the detail modal

  const demands = Array.isArray(demandsData?.items)
    ? demandsData.items
    : Array.isArray(demandsData)
      ? demandsData
      : [];

  const downloadDoc = (r, doc) =>
    apiClient.download(
      `/demands/${r._id}/supply-order-docs/${doc.key}`,
      `${r.demandNo || r._id}-${doc.key}${extOf(r.supplyOrderDocs?.[doc.urlField])}`
    );

  const handleDownload = async (r, doc) => {
    setBusyKey(`${r._id}:${doc.key}`);
    setMsg(null);
    try {
      await downloadDoc(r, doc);
      await refetch(); // status may have become COMPLETED
    } catch (e) {
      setMsg({ type: 'error', text: e?.message || `Could not download ${doc.label}.` });
    } finally {
      setBusyKey(null);
    }
  };

  const handleDownloadAll = async (r) => {
    setBusyKey(`${r._id}:all`);
    setMsg(null);
    try {
      for (const doc of DOCS) {
        // one after another so the browser does not block multiple downloads
        // eslint-disable-next-line no-await-in-loop
        await downloadDoc(r, doc);
      }
      await refetch();
      setMsg({ type: 'success', text: `All documents of ${r.demandNo || 'the demand'} downloaded. Demand marked as completed.` });
    } catch (e) {
      setMsg({ type: 'error', text: e?.message || 'Could not download all documents.' });
      refetch();
    } finally {
      setBusyKey(null);
    }
  };

  const columns = [
    {
      header: 'Demand ID',
      accessor: 'demandNo',
      render: (r) => <span className="font-semibold text-brand">{r.demandNo || r._id}</span>,
    },
    {
      header: 'Beneficiary',
      accessor: 'userId',
      render: (r) => {
        const p = personOf(r);
        return (
          <div>
            <span className="font-semibold block">{p.name}</span>
            {p.mobile && (
              <span className="micro muted row align-center gap-1">
                <Phone size={12} aria-hidden /> {p.mobile}
              </span>
            )}
            {p.cardId && <span className="micro muted block">Card: {p.cardId}</span>}
          </div>
        );
      },
    },
    {
      header: 'Vehicle / Item',
      accessor: 'productSnapshot',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.productSnapshot?.name || r.productId?.name || 'AFD Product'}</span>
          <span className="micro muted">
            Qty: {r.quantity || 1}
            {r.selectedColor ? ` · ${r.selectedColor}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Delivery / Depot',
      accessor: 'deliveryAddress',
      render: (r) => (
        <div>
          <span className="block">
            {[r.deliveryAddress?.city, r.deliveryAddress?.state || r.state].filter(Boolean).join(', ') || '—'}
          </span>
          <span className="micro muted block">Depot: {r.depotId?.name || '—'}</span>
          <span className="micro muted block">Dealer: {r.dealerId?.name || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Sanction Price',
      accessor: 'totalAmount',
      render: (r) => fmtMoney(r.totalAmount),
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (r) => (
        <div>
          <span className="font-semibold block">{pretty(r.paymentStatus)}</span>
          <span className="micro muted">{pretty(r.paymentMethod)}</span>
        </div>
      ),
    },
    {
      header: 'Supply Order / Date',
      accessor: 'supplyOrderNo',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.supplyOrderNo || '—'}</span>
          <span className="micro muted">Created: {fmtDate(r.createdAt)}</span>
        </div>
      ),
    },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Supply Order Documents',
      accessor: 'supplyOrderDocs',
      render: (r) => {
        const docs = r.supplyOrderDocs || {};
        const available = ['SUPPLY_ORDER_ISSUED', 'COMPLETED'].includes(r.status) && DOCS.every((d) => docs[d.urlField]);
        if (!available) return <span className="micro muted">Not issued yet</span>;

        const downloads = docs.downloads || {};
        const doneCount = DOCS.filter((d) => downloads[d.atField]).length;

        return (
          <div>
            <div className="row gap-1 flex-wrap mb-1">
              {DOCS.map((doc) => {
                const done = Boolean(downloads[doc.atField]);
                return (
                  <Button
                    key={doc.key}
                    variant="outline"
                    size="sm"
                    icon={done ? CheckCircle2 : Download}
                    loading={busyKey === `${r._id}:${doc.key}`}
                    disabled={Boolean(busyKey)}
                    onClick={() => handleDownload(r, doc)}
                  >
                    {doc.label}
                  </Button>
                );
              })}
              {r.status !== 'COMPLETED' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  loading={busyKey === `${r._id}:all`}
                  disabled={Boolean(busyKey)}
                  onClick={() => handleDownloadAll(r)}
                >
                  Download all
                </Button>
              )}
            </div>
            <span className="micro muted">
              {r.status === 'COMPLETED' ? 'All documents downloaded · Completed' : `${doneCount}/3 downloaded`}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Details',
      accessor: '_details',
      render: (r) => (
        <Button variant="outline" size="sm" icon={Eye} onClick={() => setSelected(r)}>
          View
        </Button>
      ),
    },
  ];

  const sel = selected;
  const selPerson = sel ? personOf(sel) : null;

  return (
    <div className="urc-demands-page">
      <PageHeader
        title="Unit Run Canteen Demands"
        subtitle="Applications submitted by unit officers and service personnel"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />

      {msg && (
        <div
          className={`alert-banner ${msg.type === 'error' ? 'error' : 'success'} small mb-2 row align-center gap-1`}
          role="alert"
        >
          {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <Card>
        <DataTable columns={columns} data={demands} loading={loading} />
      </Card>

      {sel && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={`Demand ${sel.demandNo || sel._id}`}
          subtitle={sel.statusLabel || pretty(sel.status)}
          maxWidth="820px"
        >
          <Section title="Beneficiary">
            <Field label="Name">{selPerson.name}</Field>
            <Field label="Phone">{selPerson.mobile}</Field>
            <Field label="Email">{selPerson.email}</Field>
            <Field label="Card ID">{selPerson.cardId}</Field>
            <Field label="Category">{selPerson.category}</Field>
            <Field label="Username">{sel.userId?.username}</Field>
          </Section>

          <Section title="Vehicle / Item">
            <Field label="Name">{sel.productSnapshot?.name || sel.productId?.name}</Field>
            <Field label="SKU">{sel.productSnapshot?.sku || sel.productId?.sku}</Field>
            <Field label="Quantity">{sel.quantity}</Field>
            <Field label="Colour">{sel.selectedColor}</Field>
            <Field label="Unit price">{fmtMoney(sel.unitPrice)}</Field>
            <Field label="Total amount">{fmtMoney(sel.totalAmount)}</Field>
          </Section>

          <Section title="Delivery Address">
            <Field label="Address">{sel.deliveryAddress?.address}</Field>
            <Field label="City">{sel.deliveryAddress?.city}</Field>
            <Field label="State">{sel.deliveryAddress?.state || sel.state}</Field>
            <Field label="Pin code">{sel.deliveryAddress?.pinCode}</Field>
            <Field label="Mobile">{sel.deliveryAddress?.mobile}</Field>
          </Section>

          <Section title="Depot / Dealer / URC">
            <Field label="Depot">{sel.depotId ? `${sel.depotId.name} (${sel.depotId.code})` : ''}</Field>
            <Field label="Dealer">{sel.dealerId ? `${sel.dealerId.name} (${sel.dealerId.code})` : ''}</Field>
            <Field label="Dealer phone">{sel.dealerId?.phone}</Field>
            <Field label="Dealer email">{sel.dealerId?.email}</Field>
            <Field label="URC">{sel.urcId ? `${sel.urcId.name} (${sel.urcId.code})` : ''}</Field>
          </Section>

          <Section title="Payment">
            <Field label="Method">{pretty(sel.paymentMethod)}</Field>
            <Field label="Status">{pretty(sel.paymentStatus)}</Field>
            <Field label="Payment No">{sel.latestPayment?.paymentNo}</Field>
            <Field label="UTR / Txn ID">{sel.latestPayment?.gatewayTxnId}</Field>
            <Field label="Paid at">{fmtDateTime(sel.latestPayment?.paidAt)}</Field>
            <Field label="OR number">{sel.paymentDetails?.orNumber}</Field>
            <Field label="Loan">{sel.loan?.isLoan ? `Yes · ${fmtMoney(sel.loan.loanAmount)} · ${sel.loan.bankName}` : 'No'}</Field>
          </Section>

          <Section title="Supply Order & Timeline">
            <Field label="Supply Order No">{sel.supplyOrderNo}</Field>
            <Field label="Created">{fmtDateTime(sel.createdAt)}</Field>
            <Field label="Supply order issued">{fmtDateTime(sel.supplyOrderIssuedAt)}</Field>
            <Field label="Completed">{fmtDateTime(sel.completedAt)}</Field>
          </Section>

          {Array.isArray(sel.statusHistory) && sel.statusHistory.length > 0 && (
            <section>
              <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Status History</h4>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {sel.statusHistory.map((h, i) => (
                  <li key={h._id || i} className="small" style={{ marginBottom: 4 }}>
                    <b>{pretty(h.to)}</b> · <span className="muted">{fmtDateTime(h.at)}</span>
                    {h.note ? <div className="micro muted">{h.note}</div> : null}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Modal>
      )}
    </div>
  );
}