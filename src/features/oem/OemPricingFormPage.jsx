import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Search, Wand2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetOemPricingByIdQuery,
  useGetOemPricingQuery,
  useCreateOemPricingMutation,
  useUpdateOemPricingMutation,
  useGetOemProductsQuery,
} from './oemApi.js';

const INDIAN_STATES = [
  'ANDAMAN AND NICOBAR ISLANDS', 'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM',
  'BIHAR', 'CHANDIGARH', 'CHHATTISGARH', 'DADRA AND NAGAR HAVELI', 'DAMAN AND DIU',
  'DELHI', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JAMMU AND KASHMIR',
  'JHARKHAND', 'KARNATAKA', 'KERALA', 'LADAKH', 'LAKSHADWEEP', 'MADHYA PRADESH',
  'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ODISHA',
  'PUDUCHERRY', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA',
  'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL',
];

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const baseFromFinal = (final, gst) => round2(Number(final) / (1 + (Number(gst) || 0) / 100));
const idOf = (x) => String(x?._id || x?.id || x || '');

/**
 * State price manager - one screen:
 *   1. pick the product
 *   2. every state is listed with one price box (final price the beneficiary pays)
 *   3. type prices (or apply one price to many states) and press Save once.
 * Base price is calculated automatically from final price and GST.
 */
export default function OemPricingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: editDoc, isLoading: loadingEditDoc } = useGetOemPricingByIdQuery(id, { skip: !id });
  const { data: productsData, isLoading: loadingProducts } = useGetOemProductsQuery({ limit: 100, status: 'ACTIVE' });
  const products = productsData?.items || [];

  const [productId, setProductId] = useState('');
  useEffect(() => {
    if (productId) return;
    const fromEdit = editDoc && idOf((editDoc.data || editDoc).productId);
    if (fromEdit) setProductId(fromEdit);
  }, [editDoc, productId]);

  const product = useMemo(() => products.find((p) => idOf(p) === productId) || null, [products, productId]);

  const { data: existingData, isFetching: loadingExisting } = useGetOemPricingQuery(
    { productId, status: 'PUBLISHED', limit: 100 },
    { skip: !productId }
  );
  const existing = useMemo(() => {
    const map = {};
    (existingData?.items || []).forEach((r) => {
      map[String(r.state).toUpperCase()] = r;
    });
    return map;
  }, [existingData]);

  const [createPricing] = useCreateOemPricingMutation();
  const [updatePricing] = useUpdateOemPricingMutation();

  const defaultGst = product?.taxPercent ?? 18;
  const [gst, setGst] = useState('18'); // GST used for every row of this screen
  const [rows, setRows] = useState({}); // state -> price string ('' = not set)
  const [selected, setSelected] = useState(new Set());
  const [bulkPrice, setBulkPrice] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('ALL'); // ALL | SET | UNSET
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // (re)load rows when the product or its saved prices change
  useEffect(() => {
    if (!productId) return;
    const next = {};
    INDIAN_STATES.forEach((s) => {
      next[s] = existing[s] ? String(existing[s].salePrice) : '';
    });
    setRows(next);
    setSelected(new Set());
    const firstTax = Object.values(existing)[0]?.taxPercent;
    setGst(String(firstTax ?? defaultGst));
  }, [productId, existing, defaultGst]);

  const original = (s) => (existing[s] ? String(existing[s].salePrice) : '');
  const isChanged = (s) => (rows[s] ?? '') !== original(s) || (existing[s] && Number(existing[s].taxPercent) !== Number(gst) && rows[s] !== '');

  const changedStates = INDIAN_STATES.filter((s) => rows[s] !== undefined && isChanged(s));
  const setCount = INDIAN_STATES.filter((s) => rows[s] !== '' && rows[s] !== undefined).length;

  const visible = INDIAN_STATES.filter((s) => {
    if (search && !s.toLowerCase().includes(search.toLowerCase())) return false;
    if (view === 'SET') return rows[s] !== '' && rows[s] !== undefined;
    if (view === 'UNSET') return !rows[s];
    return true;
  });

  const toggle = (s) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  const allVisibleSelected = visible.length > 0 && visible.every((s) => selected.has(s));
  const toggleAllVisible = () =>
    setSelected((prev) => {
      const n = new Set(prev);
      visible.forEach((s) => (allVisibleSelected ? n.delete(s) : n.add(s)));
      return n;
    });

  const applyBulk = (targets) => {
    if (!bulkPrice || Number(bulkPrice) <= 0) {
      setError('Pehle upar price box me price likho.');
      return;
    }
    setError('');
    setRows((prev) => {
      const n = { ...prev };
      targets.forEach((s) => (n[s] = String(bulkPrice)));
      return n;
    });
  };

  const fillWithProductPrice = () => {
    if (!product?.price) return;
    setRows((prev) => {
      const n = { ...prev };
      INDIAN_STATES.forEach((s) => {
        if (!n[s]) n[s] = String(product.price);
      });
      return n;
    });
  };

  const handleSave = async () => {
    setError('');
    if (!productId) return setError('Pehle product select karo.');
    if (!changedStates.length) return setError('Koi change nahi hai.');
    const bad = changedStates.find((s) => rows[s] !== '' && Number(rows[s]) <= 0);
    if (bad) return setError(`${bad}: price 0 se zyada hona chahiye.`);

    setSaving(true);
    const failed = [];
    for (const s of changedStates) {
      const price = rows[s];
      try {
        if (price === '') {
          // cleared row -> retire the old published price
          await updatePricing({ id: idOf(existing[s]), status: 'INACTIVE' }).unwrap();
        } else if (existing[s]) {
          await updatePricing({
            id: idOf(existing[s]),
            salePrice: Number(price),
            basePrice: baseFromFinal(price, gst),
            taxPercent: Number(gst) || 0,
          }).unwrap();
        } else {
          await createPricing({
            productId,
            state: s,
            salePrice: Number(price),
            basePrice: baseFromFinal(price, gst),
            taxPercent: Number(gst) || 0,
            status: 'PUBLISHED',
            effectiveFrom: new Date(),
          }).unwrap();
        }
      } catch (err) {
        failed.push(`${s}: ${err?.data?.message || err?.message || 'failed'}`);
      }
    }
    setSaving(false);

    if (failed.length) {
      setError(`${changedStates.length - failed.length} saved, ${failed.length} failed - ${failed.join(' | ')}`);
      return;
    }
    navigate('/oem/pricing', { state: { toast: `✓ ${changedStates.length} state price(s) saved for ${product?.name || 'product'}.` } });
  };

  if ((id && loadingEditDoc) || loadingProducts) {
    return (
      <div className="py-12">
        <LoadingState text="Loading..." />
      </div>
    );
  }

  const chip = (key, label) => (
    <button
      type="button"
      key={key}
      onClick={() => setView(key)}
      className="oem-photo-toggle-btn"
      style={view === key ? { background: 'var(--color-primary-soft, #eff6ff)', borderColor: 'var(--color-primary, #1e4fd8)' } : undefined}
    >
      {label}
    </button>
  );

  return (
    <div className="oem-pricing-form-page space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="State-wise Price"
        subtitle="Product chuno, har state ka price likho, ek baar Save karo"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'State Pricing', href: '/oem/pricing' },
          { label: 'Set Prices' },
        ]}
        actions={
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/oem/pricing')}>
            Back
          </Button>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1 */}
      <Card title="Step 1 · Product chuno">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-field md:col-span-2">
            <label className="form-label font-medium">Product</label>
            <select className="form-control" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">-- Select product --</option>
              {products.map((p) => (
                <option key={idOf(p)} value={idOf(p)}>
                  {p.name} · {p.sku}
                </option>
              ))}
            </select>
            {product && (
              <p className="text-xs text-slate-500 mt-1">
                Standard (national) price: <strong>{formatCurrency(product.price || 0)}</strong> - jis state me price set nahi hoga, wahi lagega.
              </p>
            )}
          </div>
          <div className="form-field">
            <label className="form-label font-medium">GST % (sab states ke liye)</label>
            <input type="number" min="0" max="100" className="form-control font-mono" value={gst} onChange={(e) => setGst(e.target.value)} />
            <p className="text-xs text-slate-500 mt-1">Base price isi se auto-calculate hota hai.</p>
          </div>
        </div>
      </Card>

      {!productId ? (
        <Card>
          <p className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
            Upar se product chuno - phir saare states yahin dikhenge.
          </p>
        </Card>
      ) : (
        <>
          {/* STEP 2 */}
          <Card title="Step 2 · Ek price kai states me lagao (optional shortcut)">
            <div className="flex flex-wrap items-end gap-3">
              <div className="form-field" style={{ minWidth: 200 }}>
                <label className="form-label font-medium">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control font-mono"
                  placeholder="e.g. 1180000"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" size="sm" icon={Wand2} disabled={!selected.size} onClick={() => applyBulk([...selected])}>
                Selected states ({selected.size}) me lagao
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyBulk(INDIAN_STATES)}>
                Saare states me lagao
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={!product?.price} onClick={fillWithProductPrice}>
                Khaali states me standard price bharo
              </Button>
            </div>
          </Card>

          {/* STEP 3 */}
          <Card title={`Step 3 · States (${setCount} / ${INDIAN_STATES.length} me price set)`}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: '#98a2b3' }} />
                <input className="form-control" style={{ paddingLeft: 30 }} placeholder="State search..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {chip('ALL', 'Sab')}
              {chip('SET', 'Price set')}
              {chip('UNSET', 'Price baki')}
              {loadingExisting && <span className="muted small">loading saved prices...</span>}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all visible" />
                    </th>
                    <th>State</th>
                    <th style={{ width: 220 }}>Final price (₹)</th>
                    <th style={{ width: 150 }}>Base (auto)</th>
                    <th style={{ width: 140 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s) => {
                    const v = rows[s] ?? '';
                    const changed = isChanged(s);
                    return (
                      <tr key={s} style={changed ? { background: '#fffbeb' } : undefined}>
                        <td>
                          <input type="checkbox" checked={selected.has(s)} onChange={() => toggle(s)} aria-label={`Select ${s}`} />
                        </td>
                        <td className="font-semibold">{s}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="form-control font-mono"
                            placeholder="—"
                            value={v}
                            onChange={(e) => setRows((prev) => ({ ...prev, [s]: e.target.value }))}
                          />
                        </td>
                        <td className="font-mono muted">{v ? formatCurrency(baseFromFinal(v, gst)) : '—'}</td>
                        <td className="small">
                          {changed ? (
                            <span style={{ color: '#b54708' }}>{v === '' ? 'Hatega' : 'Unsaved'}</span>
                          ) : v ? (
                            <span style={{ color: '#067647', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                              <CheckCircle2 size={14} /> Saved
                            </span>
                          ) : (
                            <span className="muted">Standard price</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!visible.length && (
                    <tr>
                      <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 16 }}>
                        Koi state nahi mila.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div
            className="flex items-center justify-between pt-3 border-t border-slate-200"
            style={{ position: 'sticky', bottom: 0, background: 'var(--color-bg, #fff)', padding: '12px 0' }}
          >
            <span className="small muted">{changedStates.length ? `${changedStates.length} state(s) me unsaved change` : 'Koi unsaved change nahi'}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/oem/pricing')}>
                Cancel
              </Button>
              <Button type="button" variant="primary" icon={Save} loading={saving} disabled={!changedStates.length} onClick={handleSave}>
                Save {changedStates.length ? `${changedStates.length} price(s)` : ''}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
