import React, { useMemo, useState } from 'react';
import { RefreshCw, Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/apiError.js';
import {
  useGetProductApprovalsQuery,
  useGetProductApprovalSummaryQuery,
  useApproveProductMutation,
  useApproveProductsManyMutation,
  useRejectProductMutation,
} from '../../redux/api/productApprovalApi.js';

const TYPE_CHIPS = [
  { key: '', label: 'All' },
  { key: 'NEW', label: 'New products' },
  { key: 'UPDATE', label: 'Price & image updates' },
];

const Row = ({ label, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 12, padding: '6px 0', borderBottom: '1px solid #edf0f6' }}>
    <span className="small muted">{label}</span>
    <span className="small">{children ?? '—'}</span>
  </div>
);

const Thumbs = ({ urls = [] }) =>
  urls.length ? (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {urls.slice(0, 8).map((u) => (
        <img key={u} src={u} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #dde3ee' }} />
      ))}
      {urls.length > 8 && <span className="micro muted">+{urls.length - 8} more</span>}
    </div>
  ) : (
    '—'
  );

/** what the OEM changed (UPDATE) or the main facts of a new product (NEW) */
function ReviewBody({ p }) {
  const ap = p.approval || {};
  const ch = ap.pendingChanges || {};
  if (ap.type === 'UPDATE') {
    return (
      <div>
        <p className="small" style={{ marginTop: 0 }}>
          The OEM changed the price / images of a live product. The product is Draft until you approve; on rejection it goes back with its old values.
        </p>
        {ch.price !== undefined && <Row label="CSD price">{formatCurrency(p.price)} → <b>{formatCurrency(ch.price)}</b></Row>}
        {ch.mrp !== undefined && <Row label="Civil MRP">{p.mrp ? formatCurrency(p.mrp) : '—'} → <b>{formatCurrency(ch.mrp)}</b></Row>}
        {(ch.statePrices || []).map((r) => (
          <Row key={r.state} label={`State price - ${r.state}`}>
            Base {formatCurrency(r.basePrice)} · Sale <b>{formatCurrency(r.salePrice)}</b>{r.taxPercent ? ` · GST ${r.taxPercent}%` : ''}
          </Row>
        ))}
        {ch.images !== undefined && (
          <>
            <Row label="Current images"><Thumbs urls={p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : []} /></Row>
            <Row label="New images"><Thumbs urls={ch.images} /></Row>
          </>
        )}
      </div>
    );
  }
  return (
    <div>
      <Row label="SKU / Index">{p.indexNo || p.sku}</Row>
      <Row label="Category">{p.categoryId?.name}</Row>
      <Row label="Variant / Fuel">{[p.variant, p.fuelType].filter(Boolean).join(' · ')}</Row>
      <Row label="AFD type">{p.afdType}</Row>
      <Row label="CSD price">{formatCurrency(p.price)}</Row>
      <Row label="Civil MRP">{p.mrp ? formatCurrency(p.mrp) : '—'}</Row>
      <Row label="GST">{p.taxPercent !== undefined ? `${p.taxPercent}%` : '—'}</Row>
      <Row label="Description">{p.description}</Row>
      <Row label="Images"><Thumbs urls={p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : []} /></Row>
    </div>
  );
}

export default function CsdProductApprovals() {
  const [tab, setTab] = useState('PENDING');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null); // product being reviewed
  const [mode, setMode] = useState(null); // 'approve' | 'reject'
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [confirmAll, setConfirmAll] = useState(false);

  const params = useMemo(() => {
    const p = { status: tab, page, limit: 15 };
    if (type) p.type = type;
    if (q.trim()) p.q = q.trim();
    return p;
  }, [tab, type, q, page]);

  const { data, isLoading, isFetching, refetch } = useGetProductApprovalsQuery(params);
  const { data: summary } = useGetProductApprovalSummaryQuery();
  const [approve, { isLoading: approving }] = useApproveProductMutation();
  const [approveMany, { isLoading: approvingMany }] = useApproveProductsManyMutation();
  const [reject, { isLoading: rejecting }] = useRejectProductMutation();

  const items = data?.items || [];
  const meta = data?.meta || {};

  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 5000); };
  const closeReview = () => { setOpen(null); setMode(null); setText(''); setErr(''); };

  const doApprove = async (p, remarks) => {
    try {
      await approve({ id: p._id, remarks: remarks?.trim() || undefined }).unwrap();
      say(p.approval?.type === 'UPDATE' ? `Update of "${p.name}" approved and live.` : `"${p.name}" approved - product is now active.`);
      closeReview();
    } catch (e) { setErr(getErrorMessage(e)); }
  };
  const doReject = async () => {
    if (text.trim().length < 3) return setErr('Give the OEM a reason (min 3 characters).');
    try {
      await reject({ id: open._id, reason: text.trim() }).unwrap();
      say(`"${open.name}" rejected. The OEM has been told why.`);
      closeReview();
    } catch (e) { setErr(getErrorMessage(e)); }
  };
  const doApproveAll = async () => {
    try {
      const r = await approveMany({ ids: items.map((i) => i._id) }).unwrap();
      say(`${r.approved} approved${r.failed?.length ? `, ${r.failed.length} could not be approved` : ''}.`);
    } catch (e) { say(getErrorMessage(e)); }
    setConfirmAll(false);
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (r) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {(r.imageUrl || r.images?.[0]) && <img src={r.imageUrl || r.images[0]} alt="" style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 6, border: '1px solid #dde3ee' }} />}
          <div>
            <b>{r.name}</b>
            <div className="micro muted">{r.indexNo || r.sku}</div>
          </div>
        </div>
      ),
    },
    { header: 'OEM', accessor: 'oemId', render: (r) => r.oemId?.name || '—' },
    {
      header: 'Request',
      accessor: 'approval',
      render: (r) => (
        <div>
          <span className="badge status-badge">{r.approval?.type === 'UPDATE' ? 'Price / image update' : 'New product'}</span>
          {r.approval?.type === 'UPDATE' && r.approval?.pendingChanges?.price !== undefined && (
            <div className="micro">{formatCurrency(r.price)} → <b>{formatCurrency(r.approval.pendingChanges.price)}</b></div>
          )}
          {r.approval?.type !== 'UPDATE' && <div className="micro muted">{formatCurrency(r.price)}</div>}
        </div>
      ),
    },
    {
      header: tab === 'PENDING' ? 'Requested' : 'Reviewed',
      accessor: 'createdAt',
      render: (r) => <span className="small">{formatDate(tab === 'PENDING' ? r.approval?.requestedAt : r.approval?.reviewedAt || r.approval?.requestedAt, true)}</span>,
    },
    ...(tab === 'REJECTED' ? [{ header: 'Reason', accessor: 'remarks', render: (r) => <span className="small">{r.approval?.remarks || '—'}</span> }] : []),
    {
      header: 'Actions',
      accessor: '_id',
      render: (r) => (
        <div className="row gap-1">
          <Button size="sm" variant="outline" icon={Eye} onClick={() => { setOpen(r); setMode(null); }}>Review</Button>
          {tab === 'PENDING' && <Button size="sm" icon={CheckCircle2} loading={approving} onClick={() => doApprove(r)}>Approve</Button>}
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'PENDING', label: 'Waiting for approval', badge: summary?.PENDING?.total },
    { id: 'REJECTED', label: 'Rejected', badge: summary?.REJECTED?.total },
    { id: 'APPROVED', label: 'Approved', badge: summary?.APPROVED?.total },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Product Approvals"
        subtitle="New products and price / image updates sent by OEMs. Nothing goes live until you approve it."
        breadcrumbs={[{ label: 'CSD-HO Directorate', href: '/csd/dashboard' }, { label: 'Product Approvals' }]}
        actions={<Button variant="outline" icon={RefreshCw} onClick={refetch} loading={isFetching}>Refresh</Button>}
      />

      {toast && <div className="alert-banner success small mb-2" role="status">{toast}</div>}

      <Card>
        <Tabs tabs={tabs} activeTab={tab} onChange={(t) => { setTab(t); setPage(1); }} />

        <div className="row gap-1 flex-wrap align-center" style={{ margin: '12px 0' }}>
          {TYPE_CHIPS.map((c) => (
            <button key={c.key} type="button" className={`btn sm ${type === c.key ? 'primary' : 'out'}`} onClick={() => { setType(c.key); setPage(1); }}>
              {summary && c.key ? `${c.label} (${summary[tab]?.[c.key] ?? 0})` : c.label}
            </button>
          ))}
          <div className="fld" style={{ marginLeft: 'auto', minWidth: 240 }}>
            <input type="search" placeholder="Search product, SKU…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search products" />
            <Search size={16} aria-hidden />
          </div>
          {tab === 'PENDING' && items.length > 1 && (
            <Button size="sm" icon={CheckCircle2} onClick={() => setConfirmAll(true)}>Approve all shown ({items.length})</Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={items}
          loading={isLoading}
          emptyTitle={tab === 'PENDING' ? 'Nothing is waiting for approval' : 'No products here'}
          emptyText={tab === 'PENDING' ? 'New products and price / image updates from OEMs will appear here.' : 'Nothing matched this view.'}
          pagination={{
            page: meta.page || page,
            totalPages: meta.totalPages || meta.pages || Math.ceil((meta.total || 0) / 15) || 1,
            totalItems: meta.total ?? items.length,
            pageSize: 15,
            onPageChange: setPage,
          }}
        />
      </Card>

      <Modal
        isOpen={Boolean(open)}
        onClose={closeReview}
        title={open ? `${open.approval?.type === 'UPDATE' ? 'Review update' : 'Review new product'}: ${open.name}` : ''}
        subtitle={open ? `${open.oemId?.name || 'OEM'} · ${open.indexNo || open.sku}` : ''}
        maxWidth="720px"
        footer={
          open && open.approval?.status === 'PENDING' ? (
            <div className="modal-footer-btns">
              {!mode && (
                <>
                  <Button variant="danger" icon={XCircle} onClick={() => { setMode('reject'); setErr(''); }}>Reject</Button>
                  <Button icon={CheckCircle2} loading={approving} onClick={() => doApprove(open)}>Approve</Button>
                </>
              )}
              {mode === 'reject' && (
                <>
                  <Button variant="outline" onClick={() => setMode(null)} disabled={rejecting}>Back</Button>
                  <Button variant="danger" loading={rejecting} onClick={doReject}>Confirm reject</Button>
                </>
              )}
            </div>
          ) : (
            <Button variant="outline" onClick={closeReview}>Close</Button>
          )
        }
      >
        {open && (
          <div>
            {err && <div className="alert-banner danger small mb-2" role="alert">{err}</div>}
            <ReviewBody p={open} />
            {open.approval?.status === 'REJECTED' && <Row label="Rejection reason">{open.approval.remarks}</Row>}
            {mode === 'reject' && (
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label" htmlFor="rej-reason">Reason for the OEM *</label>
                <textarea id="rej-reason" className="form-control" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What should the OEM correct?" />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmAll}
        onClose={() => setConfirmAll(false)}
        onConfirm={doApproveAll}
        loading={approvingMany}
        variant="primary"
        title="Approve all shown?"
        message={`${items.length} request(s) on this page will be approved. New products go live and price / image updates are applied.`}
        confirmLabel="Approve all"
      />
    </div>
  );
}
