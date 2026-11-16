import React, { useMemo, useState } from 'react';
import { RefreshCw, Search, Plus, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { useGetDealerRequestsQuery, useGetDealerRequestByIdQuery } from './dealerRequestApi.js';
import DealerRequestDetail from './DealerRequestDetail.jsx';
import { statusMeta, fmtDateTime } from './dealerRequestUtils.js';



export default function DealerRequestsBoard({ title, subtitle, breadcrumbs, tabs, renderActions, onNew, newLabel = 'New dealer request', showOem = false, showDepot = false, showUrc = false }) {
  const [tab, setTab] = useState(tabs[0].id);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  const active = tabs.find((t) => t.id === tab) || tabs[0];
  const params = useMemo(() => {
    const p = { page, limit: 15 };
    if (active.statuses) p.status = active.statuses;
    if (q.trim()) p.q = q.trim();
    return p;
  }, [active, q, page]);

  const { data, isLoading, isFetching, refetch } = useGetDealerRequestsQuery(params);
  const items = data?.items || [];
  const meta = data?.meta || {};

  // detail is fetched separately so the dialog always shows history + fresh status after an action
  const { data: detail, isFetching: loadingDetail } = useGetDealerRequestByIdQuery(openId, { skip: !openId });

  const columns = [
    {
      header: 'Request',
      accessor: 'requestNo',
      render: (r) => (
        <div>
          <span className="font-semibold text-brand block">{r.requestNo}</span>
          <span className="micro muted">{fmtDateTime(r.createdAt)}</span>
        </div>
      ),
    },
    {
      header: 'Proposed Dealer',
      accessor: 'dealer',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.dealer?.name}</span>
          <span className="micro muted">{[r.dealer?.city, r.dealer?.state].filter(Boolean).join(', ') || '—'}</span>
          {r.dealer?.phone && <span className="micro muted block">{r.dealer.phone}</span>}
        </div>
      ),
    },
    ...(showOem ? [{ header: 'OEM', accessor: 'oemId', render: (r) => r.oemId?.name || '—' }] : []),
    ...(showDepot ? [{ header: 'Depot', accessor: 'depotId', render: (r) => r.depotId?.name || '—' }] : []),
    ...(showUrc ? [{ header: 'URC', accessor: 'urcId', render: (r) => r.urcId?.name || '—' }] : []),
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => {
        const m = statusMeta(r.status);
        return (
          <div>
            <Badge variant={m.variant}>{m.label}</Badge>
            {r.status === 'URC_SUBMITTED' && r.verification?.result && (
              <span className="micro muted block">{r.verification.result === 'VERIFIED' ? 'Verified' : 'Not verified'}</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (r) => (
        <Button size="sm" variant="outline" icon={Eye} onClick={() => setOpenId(r._id)}>Open</Button>
      ),
    },
  ];

  const close = () => setOpenId(null);

  return (
    <div className="dealer-requests-page">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <Button variant="outline" size="sm" icon={RefreshCw} loading={isFetching} onClick={() => refetch()}>Refresh</Button>
            {onNew && <Button size="sm" icon={Plus} onClick={onNew}>{newLabel}</Button>}
          </>
        }
      />

      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label }))} activeTab={tab} onChange={(id) => { setTab(id); setPage(1); }} />

      <Card>
        <div className="fld" style={{ maxWidth: 360, marginBottom: 12 }}>
          <Search size={16} className="fld-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search request no, dealer name, city…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            aria-label="Search dealer requests"
          />
        </div>
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading}
          emptyTitle="No dealer requests"
          emptyText="Nothing to show in this tab."
          onRowClick={(r) => setOpenId(r._id)}
          pagination={{ page: meta.page || page, totalPages: meta.pages || 1, totalItems: meta.total, onPageChange: setPage }}
        />
      </Card>

      {openId && (
        <Modal
          isOpen
          onClose={close}
          title={detail ? `Dealer request ${detail.requestNo}` : 'Dealer request'}
          subtitle={detail?.dealer?.name}
          maxWidth="860px"
        >
          {!detail || (loadingDetail && detail._id !== openId) ? (
            <div className="py-8 text-center muted">Loading…</div>
          ) : (
            <>
              <DealerRequestDetail request={detail} />
              {renderActions && <div style={{ borderTop: '1px solid var(--border, #e2e8f0)', paddingTop: 14 }}>{renderActions(detail, { close })}</div>}
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
