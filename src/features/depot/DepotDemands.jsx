import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DepotDemandActions from './DepotDemandActions.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { getStatusLabel, fmtINR, upper, hasPaymentDetails, hasSupplyOrderDocs } from '../../utils/demandStatus.js';

const TABS = [
  { key: 'approval', label: 'Awaiting approval', test: (d) => upper(d.status) === 'CREATED' },
  { key: 'payment', label: 'Approved – awaiting payment', test: (d) => upper(d.status) === 'APPROVED' },
  { key: 'pending', label: 'Payment done – verify', test: (d) => upper(d.status) === 'PROCESSING' },
  { key: 'issued', label: 'Supply order issued', test: (d) => ['SUPPLY_ORDER_ISSUED', 'COMPLETED'].includes(upper(d.status)) },
  { key: 'rejected', label: 'Rejected / Refunded', test: (d) => ['REJECTED', 'REFUNDED'].includes(upper(d.status)) },
  { key: 'all', label: 'All', test: () => true },
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
    { header: 'Demand No.', render: (d) => <Link className="font-mono font-bold link" to={`/depot/demands/${d._id || d.id}`}>{d.demandNo || String(d._id).slice(-8).toUpperCase()}</Link> },
    { header: 'Date', render: (d) => (d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : '—') },
    { header: 'Item', render: (d) => d.productSnapshot?.name || d.productId?.name || '—' },
    { header: 'Beneficiary', render: (d) => d.userId?.name || d.beneficiaryId?.cardId || '—' },
    { header: 'Amount', render: (d) => fmtINR(d.totalAmount) },
    { header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    {
      header: 'Progress',
      render: (d) => (
        <div className="small">
          <div>{`Payment: ${String(d.paymentStatus || 'UNPAID').replace(/_/g, ' ')}`}</div>
          <div className="muted">{hasPaymentDetails(d) ? '✓ OR recorded' : '• OR pending'} · {hasSupplyOrderDocs(d) ? '✓ SO uploaded' : '• SO pending'}</div>
        </div>
      ),
    },
    { header: 'Actions', render: (d) => <DepotDemandActions demand={d} onChanged={refetch} /> },
  ];

  return (
    <div className="depot-demands-page">
      <PageHeader
        title="Demands"
        subtitle="Step 1: scrutinise a new demand and approve it to enable payment. Step 2: after the beneficiary pays, record the payment, upload the Local Supply Order and approve again."
        actions={
          <button className="btn sm out" onClick={refetch} disabled={isFetching} title="Refresh"><RefreshCw size={14} /></button>
        }
      />

      <Card>
        <div className="row gap-1 flex-wrap align-center mb-2">
          {TABS.map((t) => (
            <button key={t.key} className={`btn sm ${tab === t.key ? '' : 'out'}`} onClick={() => setTab(t.key)}>
              {t.label} ({demands.filter(t.test).length})
            </button>
          ))}
          <div className="row align-center gap-1" style={{ marginLeft: 'auto' }}>
            <Search size={14} />
            <input className="form-control" placeholder="Search demand no., item, beneficiary" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={rows} loading={isLoading} emptyTitle="No demands" emptyText="No demands match this view." />
      </Card>
    </div>
  );
}
export { DepotDemands };
