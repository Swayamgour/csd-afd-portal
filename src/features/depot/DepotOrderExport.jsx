import React, { useMemo, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Search
} from 'lucide-react';

import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';

import { useGetDemandsQuery } from '../demand/demandApi.js';
import { apiClient } from '../../services/apiClient.js';

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

// Only paid demands with no supply order generated are exported
const DEMAND_STATUSES = [
  ['', 'All statuses'],
  ['PROCESSING', 'Processing']
];

const ORDER_STATUSES = [
  ['', 'All statuses'],
  ['PLACED', 'Placed'],
  ['PROCESSING', 'Processing'],
  ['DISPATCHED', 'Dispatched'],
  ['DELIVERED', 'Delivered'],
  ['CANCELLED', 'Cancelled'],
  ['RETURNED', 'Returned']
];

const pad = (n) => String(n).padStart(2, '0');

function monthRange(month, year) {
  if (month === 'ALL') {
    return { from: `${year}-01-01`, to: `${year}-12-31` };
  }
  const m = Number(month);
  const last = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return { from: `${year}-${pad(m)}-01`, to: `${year}-${pad(m)}-${pad(last)}` };
}

export default function DepotOrderExport() {
  const now = new Date();

  const [dataset, setDataset] = useState('DEMANDS');
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(now.getFullYear());
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const years = useMemo(
    () => Array.from({ length: 6 }, (_, i) => now.getFullYear() - i),
    []
  );

  const { from, to } = monthRange(month, year);
  const statuses = dataset === 'DEMANDS' ? DEMAND_STATUSES : ORDER_STATUSES;

  // Demand preview count
  const { data: preview, isFetching } = useGetDemandsQuery(
    {
      from,
      to,
      limit: 1,
      paymentStatus: 'PAID',
      pendingSupplyOrder: 'true',
      ...(status ? { status } : {})
    },
    { skip: dataset !== 'DEMANDS' }
  );

  const total = preview?.meta?.total;

  // XLSM query parameters
  const qs = (extra = {}) =>
    new URLSearchParams({
      from,
      to,
      format: 'xlsm',
      ...(status ? { status } : {}),
      ...extra
    }).toString();

  const periodLabel =
    month === 'ALL' ? `${year}` : `${MONTHS[Number(month) - 1]}-${year}`;

  // Download XLSM
  const download = async () => {
    setBusy(true);
    setMsg(null);

    try {
      const path = dataset === 'DEMANDS' ? '/demands' : '/orders';
      const name = `${dataset === 'DEMANDS' ? 'depot-demands' : 'depot-supply-orders'}-${periodLabel}.xlsm`;

      await apiClient.download(`${path}?${qs()}`, name);

      setMsg({ type: 'success', text: `${name} downloaded successfully.` });
    } catch (e) {
      setMsg({ type: 'error', text: e?.message || 'Export failed. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="depot-order-export-page">
      <PageHeader
        title="Order Export"
        subtitle="Download paid demands (supply order not yet generated) or supply orders as an Excel (XLSM) file."
        breadcrumbs={[
          { label: 'Depot', href: '/depot/dashboard' },
          { label: 'Order Export' }
        ]}
      />

      <Card title="Choose what to export" className="mb-3">
        <div className="row gap-2 flex-wrap align-end mb-2">
          {/* Dataset */}
          <div className="form-field">
            <label className="small font-semibold block mb-1" htmlFor="ex-set">Data</label>
            <select
              id="ex-set"
              className="form-control"
              value={dataset}
              onChange={(e) => {
                setDataset(e.target.value);
                setStatus('');
                setMsg(null);
              }}
            >
              <option value="DEMANDS">Received demands</option>
              <option value="ORDERS">Supply orders</option>
            </select>
          </div>

          {/* Month */}
          <div className="form-field">
            <label className="small font-semibold block mb-1" htmlFor="ex-month">Month</label>
            <select
              id="ex-month"
              className="form-control"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="ALL">Whole year</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="form-field">
            <label className="small font-semibold block mb-1" htmlFor="ex-year">Year</label>
            <select
              id="ex-year"
              className="form-control"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="form-field">
            <label className="small font-semibold block mb-1" htmlFor="ex-status">Status</label>
            <select
              id="ex-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview count */}
        <p className="small muted mb-2" aria-live="polite">
          <Search size={14} aria-hidden /> {periodLabel}
          {dataset === 'DEMANDS' && (
            isFetching
              ? ' · counting...'
              : typeof total === 'number'
                ? ` · ${total} paid demand${total === 1 ? '' : 's'} pending supply order`
                : ''
          )}
        </p>

        {/* Success / Error */}
        {msg && (
          <div
            className={`alert-banner ${msg.type === 'error' ? 'error' : 'success'} small mb-2 row align-center gap-1`}
            role="alert"
          >
            {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Download */}
        <Button
          variant="primary"
          icon={Download}
          loading={busy}
          onClick={download}
          disabled={busy || isFetching || (dataset === 'DEMANDS' && total === 0)}
        >
          Download XLSM
        </Button>

        <p className="micro muted mt-2">
          <FileSpreadsheet size={12} aria-hidden />
          {' '}Up to 10,000 rows per file. Each export is recorded in the audit log.
        </p>
      </Card>
    </div>
  );
}