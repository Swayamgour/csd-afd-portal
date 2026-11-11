import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2, RefreshCw, Trash2, Download,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetDemandsQuery, useBulkUploadSupplyOrdersMutation } from '../demand/demandApi.js';
import { useUploadFileMutation } from '../beneficiary/beneficiaryApi.js';
import { UPLOAD_CONFIG, validateFile, formatFileSize } from '../../config/uploadConfig.js';
import { DOC_TYPES, newFileItem } from '../../utils/orderImportMatch.js';
import { getErrorMessage } from '../../utils/apiError.js';

const CHUNK = 20; // POST /files accepts up to 20 files per request
const MAX_FILES = 120;

/**
 * Order Import: upload Official Receipt + Supply Order + Authority Letter for MANY demands in one go.
 *  1. choose / drop all files, 2. check the automatic matching (file name -> demand number + document type),
 *  3. import. Demands with all three documents are imported; incomplete ones are left untouched.
 */
export default function DepotOrderImport() {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState({}); // demandId -> { ok, message }

  const { data, isLoading, refetch, isFetching } = useGetDemandsQuery({ status: 'PROCESSING', limit: 200 });
  const demands = useMemo(() => data?.items || [], [data]);
  const [uploadFile] = useUploadFileMutation();
  const [bulkUpload] = useBulkUploadSupplyOrdersMutation();

  const demandById = useMemo(() => new Map(demands.map((d) => [String(d._id || d.id), d])), [demands]);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const bad = [];
    const good = [];
    incoming.forEach((f) => {
      const v = validateFile(f);
      const dup = items.some((i) => i.file.name === f.name && i.file.size === f.size) || good.some((g) => g.file.name === f.name && g.file.size === f.size);
      if (!v.valid) bad.push(`${f.name}: ${v.error}`);
      else if (dup) bad.push(`${f.name}: already added`);
      else good.push(newFileItem(f, demands));
    });
    const room = MAX_FILES - items.length;
    if (good.length > room) bad.push(`Only ${MAX_FILES} files can be imported at a time; ${good.length - room} file(s) were skipped.`);
    setItems((prev) => [...prev, ...good.slice(0, Math.max(room, 0))]);
    setRejected(bad);
    setResults({});
  };

  const update = (id, patch) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearAll = () => { setItems([]); setRejected([]); setResults({}); };

  // ---- group by demand ------------------------------------------------------
  const groups = useMemo(() => {
    const map = new Map();
    items.forEach((i) => {
      if (!i.demandId) return;
      if (!map.has(i.demandId)) map.set(i.demandId, { demandId: i.demandId, docs: {}, extras: [] });
      const g = map.get(i.demandId);
      if (!i.docType) g.extras.push(i);
      else if (g.docs[i.docType]) g.extras.push(i); // second file for the same slot
      else g.docs[i.docType] = i;
    });
    return Array.from(map.values()).map((g) => ({
      ...g,
      demand: demandById.get(String(g.demandId)),
      complete: DOC_TYPES.every((t) => g.docs[t.key]) && g.extras.length === 0,
      missing: DOC_TYPES.filter((t) => !g.docs[t.key]).map((t) => t.label),
    }));
  }, [items, demandById]);

  const unmatched = items.filter((i) => !i.demandId);
  const ready = groups.filter((g) => g.complete && !results[g.demandId]?.ok);
  const issues = groups.filter((g) => !g.complete);

  // ---- import ---------------------------------------------------------------
  const runImport = async () => {
    if (!ready.length || running) return;
    setRunning(true);
    setProgress({ done: 0, total: ready.length });
    try {
      // 1) upload every needed file that has no url yet, in chunks of 20
      const need = ready.flatMap((g) => Object.values(g.docs)).filter((i) => !i.url);
      const uploaded = new Map();
      for (let s = 0; s < need.length; s += CHUNK) {
        const part = need.slice(s, s + CHUNK);
        try {
          const fd = new FormData();
          part.forEach((i) => fd.append('files', i.file));
          const res = await uploadFile(fd).unwrap();
          const list = Array.isArray(res) ? res : res?.data || [];
          if (list.length !== part.length) throw new Error('Upload response did not match the files sent.');
          part.forEach((i, idx) => uploaded.set(i.id, list[idx].url));
        } catch (e) {
          const msg = getErrorMessage(e, e?.message || 'File upload failed');
          part.forEach((i) => uploaded.set(i.id, { error: msg }));
        }
      }
      setItems((prev) => prev.map((i) => (typeof uploaded.get(i.id) === 'string' ? { ...i, url: uploaded.get(i.id) } : i)));
      const urlOf = (i) => (typeof uploaded.get(i.id) === 'string' ? uploaded.get(i.id) : i.url);

      // 2) attach the three documents to the demands: one request per 100 demands, per-demand result comes back
      const BULK = 100;
      let done = 0;
      for (let s = 0; s < ready.length; s += BULK) {
        const part = ready.slice(s, s + BULK);
        const payload = [];
        const early = {};
        part.forEach((g) => {
          const urls = Object.fromEntries(DOC_TYPES.map((t) => [t.field, urlOf(g.docs[t.key])]));
          const failedUpload = DOC_TYPES.map((t) => uploaded.get(g.docs[t.key].id)).find((u) => u && typeof u === 'object');
          if (failedUpload || Object.values(urls).some((u) => !u)) {
            early[g.demandId] = { ok: false, message: failedUpload?.error || 'File upload failed' };
          } else {
            payload.push({ demandId: g.demandId, ...urls });
          }
        });
        const out = { ...early };
        if (payload.length) {
          try {
            const res = await bulkUpload(payload).unwrap();
            (res.results || []).forEach((r) => { out[r.demandId] = r.ok ? { ok: true, message: 'Imported' } : { ok: false, message: r.message || 'Could not attach the documents' }; });
          } catch (e) {
            const msg = getErrorMessage(e, e?.message || 'Could not attach the documents');
            payload.forEach((p) => { out[p.demandId] = { ok: false, message: msg }; });
          }
        }
        done += part.length;
        setResults((prev) => ({ ...prev, ...out }));
        setProgress({ done, total: ready.length });
      }
    } finally {
      setRunning(false);
      refetch();
    }
  };

  const okCount = Object.values(results).filter((r) => r.ok).length;
  const failCount = Object.values(results).filter((r) => !r.ok).length;

  const demandOptions = demands.map((d) => (
    <option key={d._id || d.id} value={d._id || d.id}>
      {d.demandNo} · {d.beneficiaryId?.fullName || d.userId?.name || 'Beneficiary'}
    </option>
  ));

  return (
    <div className="depot-order-import-page">
      <PageHeader
        title="Order Import"
        subtitle="Upload the Official Receipt, Supply Order and Authority Letter for many demands at once."
        breadcrumbs={[{ label: 'Depot', href: '/depot/dashboard' }, { label: 'Order Import' }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching} icon={RefreshCw}>
            Refresh demands
          </Button>
        }
      />

      <Card title="1. Choose files" subtitle={`PDF, JPG or PNG, up to ${UPLOAD_CONFIG.maxSizeMB} MB each. Max ${MAX_FILES} files at a time.`} className="mb-3">
        <div className="alert-banner info small mb-2 row gap-1">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>
            Name each file with the demand number and the document, e.g. <code>DEM2026000001_receipt.pdf</code>,{' '}
            <code>DEM2026000001_supply_order.pdf</code>, <code>DEM2026000001_authority_letter.pdf</code>. Matching is automatic and
            you can correct it below. Only demands that are <strong>Processing</strong> at your depot ({isLoading ? '…' : demands.length}) can be imported.
          </span>
        </div>

        <div
          className={`dropzone ${dragOver ? 'is-over' : ''}`}
          style={{
            border: '2px dashed var(--color-border, #cbd5e1)', borderRadius: 10, padding: '1.75rem 1rem',
            textAlign: 'center', background: dragOver ? 'var(--color-bg-hover, #eff6ff)' : 'transparent', cursor: 'pointer',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          <UploadCloud size={32} aria-hidden />
          <p className="m-0 mt-1"><strong>Drop files here</strong> or click to select multiple files</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept={UPLOAD_CONFIG.acceptString}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>

        {rejected.length > 0 && (
          <ul className="small text-danger mt-2" style={{ paddingLeft: '1.1rem' }}>
            {rejected.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        )}
      </Card>

      {items.length > 0 && (
        <>
          <Card
            title={`2. Check matching (${items.length} file${items.length > 1 ? 's' : ''})`}
            subtitle="Every file needs a demand and a document type. Each demand needs all three documents."
            className="mb-3"
            headerActions={<Button variant="outline" size="sm" onClick={clearAll} disabled={running} icon={Trash2}>Clear all</Button>}
          >
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>File</th><th>Demand</th><th>Document</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <div className="row align-center gap-1">
                          <FileText size={16} aria-hidden />
                          <div>
                            <div className="small font-semibold" style={{ wordBreak: 'break-all' }}>{i.file.name}</div>
                            <div className="micro muted">{formatFileSize(i.file.size)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select className="form-control" value={i.demandId} disabled={running} onChange={(e) => update(i.id, { demandId: e.target.value })}>
                          <option value="">— select demand —</option>
                          {demandOptions}
                        </select>
                      </td>
                      <td>
                        <select className="form-control" value={i.docType} disabled={running} onChange={(e) => update(i.id, { docType: e.target.value })}>
                          <option value="">— select document —</option>
                          {DOC_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                        </select>
                      </td>
                      <td>
                        <button type="button" className="icon sm" aria-label={`Remove ${i.file.name}`} disabled={running} onClick={() => remove(i.id)}>
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="3. Import" className="mb-3">
            <div className="grid-3-col gap-2 mb-2">
              <div className="panel p-2"><span className="small muted block">Ready to import</span><strong className="h3">{ready.length}</strong></div>
              <div className="panel p-2"><span className="small muted block">Incomplete / need attention</span><strong className="h3">{issues.length + (unmatched.length ? 1 : 0)}</strong></div>
              <div className="panel p-2"><span className="small muted block">Imported</span><strong className="h3 text-green">{okCount}</strong>{failCount > 0 && <span className="small text-danger"> · {failCount} failed</span>}</div>
            </div>

            {unmatched.length > 0 && (
              <div className="alert-banner warning small mb-2 row gap-1">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{unmatched.length} file(s) are not matched to a demand yet and will be skipped.</span>
              </div>
            )}

            <div className="data-table-wrapper mb-2">
              <table className="data-table">
                <thead><tr><th>Demand</th><th>Beneficiary</th>{DOC_TYPES.map((t) => <th key={t.key}>{t.label}</th>)}<th>Result</th></tr></thead>
                <tbody>
                  {groups.map((g) => {
                    const r = results[g.demandId];
                    return (
                      <tr key={g.demandId}>
                        <td className="font-mono font-semibold">{g.demand?.demandNo || g.demandId}</td>
                        <td className="small">{g.demand?.beneficiaryId?.fullName || g.demand?.userId?.name || '—'}</td>
                        {DOC_TYPES.map((t) => (
                          <td key={t.key}>
                            {g.docs[t.key] ? <CheckCircle2 size={16} color="#16a34a" aria-label="added" /> : <span className="text-danger small">missing</span>}
                          </td>
                        ))}
                        <td className="small">
                          {r ? (
                            r.ok
                              ? <span className="text-green"><CheckCircle2 size={14} /> Imported</span>
                              : <span className="text-danger"><AlertCircle size={14} /> {r.message}</span>
                          ) : g.complete ? (
                            g.demand?.supplyOrderDocs?.supplyOrderUrl
                              ? <span className="muted">Ready · replaces earlier documents</span>
                              : <span className="muted">Ready</span>
                          ) : (
                            <span className="text-danger">
                              {g.extras.length ? 'Two files for one document / no type chosen' : `Missing: ${g.missing.join(', ')}`}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {groups.length === 0 && (
                    <tr><td colSpan={DOC_TYPES.length + 3} className="small muted text-center">Select a demand for each file to continue.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="row between align-center flex-wrap gap-2">
              <span className="small muted" aria-live="polite">
                {running ? <><Loader2 size={14} className="spin" /> Importing {progress.done} / {progress.total}…</> : 'Imported demands move on to “Approve” in Received Demands once payment details are also recorded.'}
              </span>
              <div className="row gap-1">
                <Link to="/depot/demands" className="btn out">Received Demands</Link>
                <Button variant="primary" icon={UploadCloud} onClick={runImport} loading={running} disabled={!ready.length || running}>
                  {ready.length ? `Import ${ready.length} demand${ready.length > 1 ? 's' : ''}` : 'Nothing ready to import'}
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
