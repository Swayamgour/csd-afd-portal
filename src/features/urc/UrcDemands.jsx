import React, { useState } from 'react';
import { RefreshCw, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
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

export default function UrcDemands() {
  const { data: demandsData, isLoading: loading, isFetching, refetch } = useGetDemandsQuery();

  const [busyKey, setBusyKey] = useState(null); // `${demandId}:${docKey|all}`
  const [msg, setMsg] = useState(null);

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
      accessor: 'beneficiaryId',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.beneficiaryId?.fullName || 'Applicant'}</span>
          <span className="micro muted">{r.beneficiaryId?.serviceNumber || ''}</span>
        </div>
      ),
    },
    {
      header: 'Vehicle / Item',
      accessor: 'productSnapshot',
      render: (r) => r.productSnapshot?.name || r.productId?.name || 'AFD Product',
    },
    {
      header: 'Sanction Price',
      accessor: 'totalAmount',
      render: (r) => `₹ ${(r.totalAmount || 0).toLocaleString('en-IN')}`,
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
  ];

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
    </div>
  );
}