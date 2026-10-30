import React, { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useGetOrgMetaQuery } from './orgApi.js';

/**
 * Shared dropdown block for creating / editing OEM, Depot, URC and Dealer.
 * All values come from the server (GET /org-accounts/meta): states, price zones, OEMs, categories, depots.
 *
 * role  : 'OEM' | 'DEPOT_OFFICIAL' | 'URC' | 'DEALER'
 * value : { state, priceZoneId, depotId, oemId, categoryId }   (see emptyOrgLink)
 *
 * DEALER: OEM (ek) -> State -> Depot (ek).  Category OEM se aur state depot se automatic aate hain.
 */

export const ORG_ROLE_BY_WP = { oem: 'OEM', depot: 'DEPOT_OFFICIAL', urc: 'URC', dealer: 'DEALER' };

export const normState = (s) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase();

export const emptyOrgLink = () => ({
  state: '',
  priceZoneId: '',
  depotId: '',
  urcIds: [], // depot: multiple URCs
  oemId: '',
  categoryId: '',
});

const idOf = (x) => String(x?._id || x?.id || x || '');

/** Returns an error message, or '' when the selection is valid. */
export function validateOrgLink(role, v) {
  if (role === 'OEM') return v.categoryId ? '' : 'Please select the Category Type.';
  if (role === 'DEPOT_OFFICIAL') return v.state ? '' : 'Please select a State for this depot.';
  if (role === 'URC') return v.depotId ? '' : 'Please select the parent Depot.';
  if (role === 'DEALER') {
    if (!v.oemId) return 'Please select the OEM of this dealer.';
    if (!v.depotId) return 'Please select the Depot of this dealer.';
  }
  return '';
}

/** Fields to merge into the POST /org-accounts body. */
export function orgLinkPayload(role, v) {
  if (role === 'OEM') return { categoryId: v.categoryId };
  if (role === 'DEPOT_OFFICIAL') {
    return { state: v.state, urcIds: v.urcIds || [], ...(v.priceZoneId ? { priceZoneId: v.priceZoneId } : {}) };
  }
  if (role === 'URC') return { depotId: v.depotId };
  return { oemId: v.oemId, depotId: v.depotId, ...(v.state ? { state: v.state } : {}) };
}

export default function OrgLinkFields({ role, value, onChange, disabled = false }) {
  const { data: meta, isLoading, isError, refetch } = useGetOrgMetaQuery();
  const set = (patch) => onChange({ ...value, ...patch });

  const states = meta?.states || [];
  const oems = meta?.oems || [];
  const categories = meta?.categories || [];
  const allDepots = meta?.depots || [];
  const allUrcs = meta?.urcs || [];

  const curState = normState(value.state);

  // every state known to the system + the currently selected one (so an existing value never disappears)
  const stateList = useMemo(() => {
    const set2 = new Set(states.map((s) => s.state));
    allDepots.forEach((d) => d.state && set2.add(normState(d.state)));
    if (curState) set2.add(curState);
    return [...set2].sort();
  }, [states, allDepots, curState]);

  const zones = states.find((s) => s.state === curState)?.priceZones || [];

  const depots = useMemo(
    () => (curState ? allDepots.filter((d) => normState(d.state) === curState) : allDepots),
    [allDepots, curState]
  );

  const urcs = useMemo(
    () => (curState ? allUrcs.filter((u) => !u.state || normState(u.state) === curState) : []),
    [allUrcs, curState]
  );

  const toggle = (key, id) => {
    const cur = value[key] || [];
    set({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };

  // checkbox list used for "URCs of this depot"
  const multiPick = ({ label, key, items, emptyText }) => (
    <div style={{ gridColumn: '1 / -1' }}>
      <label className="form-label required">
        {label} <span className="micro muted">({(value[key] || []).length} selected)</span>
      </label>
      <div className="d-flex flex-wrap gap-2 p-2 border rounded" style={{ maxHeight: 180, overflowY: 'auto' }}>
        {items.map((it) => {
          const id = idOf(it);
          return (
            <label key={id} className="d-flex align-items-center gap-1" style={{ cursor: 'pointer', minWidth: 240 }}>
              <input
                type="checkbox"
                disabled={disabled}
                checked={(value[key] || []).includes(id)}
                onChange={() => toggle(key, id)}
              />
              <span>
                {it.name} ({it.code}){it.city ? ` - ${it.city}` : ''}
              </span>
            </label>
          );
        })}
        {!items.length && <span className="micro muted">{emptyText}</span>}
      </div>
    </div>
  );

  const catName = (id) => categories.find((c) => idOf(c) === String(id))?.name;
  const oemCategoryText = (o) => (o.categoryIds || []).map((c) => catName(idOf(c))).filter(Boolean).join(', ');

  if (isLoading) return <p className="micro muted">Loading dropdown data...</p>;
  if (isError) {
    return (
      <div className="alert alert-danger">
        Dropdown data load nahi hua.{' '}
        <button type="button" className="btn out" onClick={refetch}>
          Retry
        </button>
      </div>
    );
  }

  const stateSelect = (label, required) => (
    <div>
      <label className={`form-label ${required ? 'required' : ''}`}>{label}</label>
      <select
        className="form-control"
        disabled={disabled}
        value={curState}
        onChange={(e) => set({ state: e.target.value, priceZoneId: '', depotId: '', urcIds: [] })}
      >
        <option value="">{required ? '-- Select State --' : '-- All States --'}</option>
        {stateList.map((st) => (
          <option key={st} value={st}>
            {st}
          </option>
        ))}
      </select>
    </div>
  );

  const depotSelect = (label) => (
    <div>
      <label className="form-label required">{label}</label>
      <select
        className="form-control"
        disabled={disabled}
        value={value.depotId}
        onChange={(e) => set({ depotId: e.target.value })}
      >
        <option value="">-- Select Depot --</option>
        {depots.map((d) => (
          <option key={idOf(d)} value={idOf(d)}>
            {d.name} ({d.code}){d.city ? ` - ${d.city}` : ''}
          </option>
        ))}
      </select>
      {!depots.length && <p className="micro muted mt-xs">Is state me koi active depot nahi hai.</p>}
    </div>
  );

  /* ---------------- OEM ---------------- */
  if (role === 'OEM') {
    return (
      <div>
        <label className="form-label required">Category Type</label>
        <select
          className="form-control"
          disabled={disabled}
          value={value.categoryId}
          onChange={(e) => set({ categoryId: e.target.value })}
        >
          <option value="">-- Select Category --</option>
          {categories.map((c) => (
            <option key={idOf(c)} value={idOf(c)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  /* ---------------- DEPOT ---------------- */
  if (role === 'DEPOT_OFFICIAL') {
    return (
      <div className="grid-3-col gap-3">
        {stateSelect('State', true)}
        {zones.length > 1 && (
          <div>
            <label className="form-label required">Price Zone</label>
            <select
              className="form-control"
              disabled={disabled}
              value={value.priceZoneId}
              onChange={(e) => set({ priceZoneId: e.target.value })}
            >
              <option value="">-- Select Price Zone --</option>
              {zones.map((z) => (
                <option key={idOf(z)} value={idOf(z)}>
                  {z.name} {z.code ? `(${z.code})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        {curState && zones.length === 1 && (
          <div>
            <label className="form-label">Price Zone</label>
            <input className="form-control" disabled value={`${zones[0].name} (auto)`} readOnly />
          </div>
        )}
        {curState && zones.length === 0 && (
          <p className="micro" style={{ color: '#b42318', alignSelf: 'end' }}>
            Is state ka koi active Price Zone nahi hai. Depot banane se pehle price zone banao.
          </p>
        )}
        {curState &&
          multiPick({
            label: 'URCs of this depot',
            key: 'urcIds',
            items: urcs,
            emptyText: 'Is state me abhi koi active URC nahi hai.',
          })}
      </div>
    );
  }

  /* ---------------- URC ---------------- */
  if (role === 'URC') {
    return (
      <div className="grid-3-col gap-3">
        {stateSelect('State (filter)', false)}
        {depotSelect('Parent Depot')}
      </div>
    );
  }

  /* ---------------- DEALER ---------------- */
  const selectedOem = oems.find((o) => idOf(o) === value.oemId);
  const autoCategory = selectedOem ? oemCategoryText(selectedOem) : '';
  return (
    <div>
      <div className="grid-3-col gap-3">
        <div>
          <label className="form-label required">OEM</label>
          <select className="form-control" disabled={disabled} value={value.oemId} onChange={(e) => set({ oemId: e.target.value })}>
            <option value="">-- Select OEM --</option>
            {oems.map((o) => (
              <option key={idOf(o)} value={idOf(o)}>
                {o.name} {o.code ? `(${o.code})` : ''}
                {oemCategoryText(o) ? ` - ${oemCategoryText(o)}` : ''}
              </option>
            ))}
          </select>
        </div>
        {stateSelect('State', false)}
        {depotSelect('Depot')}
      </div>
      {selectedOem && (
        <p className="micro muted mt-xs">
          Category (OEM se automatic): <strong>{autoCategory || 'is OEM me category set nahi hai'}</strong>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* login credentials block (username + password) - create mode only   */
/* value: { username, password, confirmPassword }                      */
/* ------------------------------------------------------------------ */

export const emptyLogin = () => ({ username: '', password: '', confirmPassword: '' });

export function validateLogin(v) {
  const u = v.username.trim();
  if (u.length < 3) return 'Username must be at least 3 characters.';
  if (!/^[A-Za-z0-9._-]+$/.test(u)) return 'Username me sirf letters, digits, . _ - allowed hain.';
  if (v.password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(v.password) || !/[a-z]/.test(v.password) || !/\d/.test(v.password)) {
    return 'Password me capital letter, small letter aur digit hona chahiye.';
  }
  if (v.password !== v.confirmPassword) return 'Passwords do not match.';
  return '';
}

export const orgErrorMessage = (err, fallback = 'Request failed') => {
  const details = (err?.data?.details || []).map((d) => d.message).filter(Boolean).join(', ');
  return [err?.data?.message || err?.message || fallback, details].filter(Boolean).join(': ');
};

export function LoginFields({ value, onChange, disabled = false }) {
  const [show, setShow] = useState(false);
  const set = (patch) => onChange({ ...value, ...patch });
  const eye = (
    <button type="button" className="btn ghost" onClick={() => setShow(!show)} tabIndex={-1} aria-label="Show or hide password">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
  return (
    <div className="grid-3-col gap-3">
      <div>
        <label className="form-label required">Login Username</label>
        <input
          className="form-control"
          disabled={disabled}
          autoComplete="off"
          value={value.username}
          onChange={(e) => set({ username: e.target.value.toLowerCase() })}
          placeholder="e.g. depot_kanpur"
        />
      </div>
      <div>
        <label className="form-label required">Password</label>
        <div className="d-flex gap-1">
          <input
            className="form-control"
            type={show ? 'text' : 'password'}
            disabled={disabled}
            autoComplete="new-password"
            value={value.password}
            onChange={(e) => set({ password: e.target.value })}
          />
          {eye}
        </div>
        <p className="micro muted mt-xs">Min 8 chars, capital + small + digit.</p>
      </div>
      <div>
        <label className="form-label required">Confirm Password</label>
        <input
          className="form-control"
          type={show ? 'text' : 'password'}
          disabled={disabled}
          autoComplete="new-password"
          value={value.confirmPassword}
          onChange={(e) => set({ confirmPassword: e.target.value })}
        />
      </div>
    </div>
  );
}
