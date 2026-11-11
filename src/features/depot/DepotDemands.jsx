import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DepotDemandActions from './DepotDemandActions.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { getStatusLabel, fmtINR, upper, hasPaymentDetails, hasSupplyOrderDocs } from '../../utils/demandStatus.js';

const TABS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'approval', label: 'To approve', test: (d) => upper(d.status) === 'CREATED' },
  { key: 'payment', label: 'Awaiting payment', test: (d) => upper(d.status) === 'APPROVED' },
  { key: 'pending', label: 'To verify', test: (d) => upper(d.status) === 'PROCESSING' },
  { key: 'issued', label: 'Supply order issued', test: (d) => ['SUPPLY_ORDER_ISSUED', 'COMPLETED'].includes(upper(d.status)) },
  { key: 'rejected', label: 'Rejected / Refunded', test: (d) => ['REJECTED', 'REFUNDED'].includes(upper(d.status)) },
];

export default function DepotDemands() {
  const { data, isLoading, isFetching, refetch } = useGetDemandsQuery();
  const [tab, setTab] = useState('approval');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');

  const demands = data?.items || [];

  const rows = useMemo(() => {
    const t = TABS.find((x) => x.key === tab) || TABS[0];
    const needle = q.trim().toLowerCase();
    return demands
      .filter(t.test)
      .filter((d) => {
        if (!needle) return true;
        return [d.demandNo, d.productSnapshot?.name, d.userId?.name, d.beneficiaryId?.cardId, d.dealerId?.name]
          .some((v) => String(v || '').toLowerCase().includes(needle));
      })
      .sort((a, b) => {
        const diff = new Date(b.createdAt) - new Date(a.createdAt);
        return sort === 'newest' ? diff : -diff;
      });
  }, [demands, tab, q, sort]);

  const columns = [
    {
      header: 'Demand',
      render: (d) => (
        <div className="cell-stack">
          <Link className="link nowrap" style={{ fontWeight: 700 }} to={`/depot/demands/${d._id || d.id}`}>
            {d.demandNo || String(d._id).slice(-8).toUpperCase()}
          </Link>
          <small>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : '—'}</small>
        </div>
      ),
    },
    {
      header: 'Item',
      render: (d) => (
        <div className="cell-stack" style={{ minWidth: 150 }}>
          <strong>{d.productSnapshot?.name || d.productId?.name || '—'}</strong>
          <small>{d.userId?.name || d.beneficiaryId?.cardId || '—'}</small>
        </div>
      ),
    },
    { header: 'Amount', render: (d) => <span className="nowrap" style={{ fontWeight: 600 }}>{fmtINR(d.totalAmount)}</span> },
    { header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    {
      header: 'Checklist',
      render: (d) => (
        <ul className="pill-steps nowrap">
          <li className={['PAID', 'PENDING_VERIFICATION'].includes(upper(d.paymentStatus)) ? 'ok' : ''}>
            {['PAID', 'PENDING_VERIFICATION'].includes(upper(d.paymentStatus)) ? '✓' : '○'} Payment
          </li>
          <li className={hasPaymentDetails(d) ? 'ok' : ''}>{hasPaymentDetails(d) ? '✓' : '○'} Receipt recorded</li>
          <li className={hasSupplyOrderDocs(d) ? 'ok' : ''}>{hasSupplyOrderDocs(d) ? '✓' : '○'} Supply order</li>
        </ul>
      ),
    },
    { header: 'Actions', render: (d) => <DepotDemandActions demand={d} onChanged={refetch} /> },
  ];

  return (
    <div className="depot-demands-page">
      <PageHeader
        title="Received demands"
        subtitle="First scrutinise a new demand and approve it to open payment. After the beneficiary pays, record the payment, upload the Local Supply Order and approve again."
        actions={
          <button className="btn out sm" onClick={refetch} disabled={isFetching} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="toolbar">
        <div className="seg" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
              {t.label}<span className="n">{demands.filter(t.test).length}</span>
            </button>
          ))}
        </div>
        <span className="spacer" />
        <label className="field-inline">
          <Search size={15} />
          <input className="form-control" placeholder="Search demand, item or beneficiary" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className="form-control" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} emptyTitle="No demands here" emptyText="Demands in this stage will appear here." />
    </div>
  );
}
export { DepotDemands };
