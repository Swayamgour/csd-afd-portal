import React, { useState } from 'react';
import { MapPin, Phone, Mail, Camera, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../../components/common/Badge.jsx';
import { STAGES, statusMeta, fmtDateTime, fileSrc, mapsLink } from './dealerRequestUtils.js';

const Field = ({ label, children }) => (
  <div style={{ minWidth: 0 }}>
    <div className="micro muted">{label}</div>
    <div className="font-semibold" style={{ wordBreak: 'break-word' }}>{children || '—'}</div>
  </div>
);

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 18 }}>
    <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>{title}</h4>
    {children}
  </section>
);

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 };

/** 5-step progress strip */
function ProgressStrip({ status }) {
  const failed = ['REJECTED', 'CANCELLED'].includes(status);
  const idx = STAGES.findIndex((s) => s.key === status);
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }} aria-label="Request progress">
      {STAGES.map((s, i) => {
        const reached = !failed && idx >= i;
        return (
          <div
            key={s.key}
            style={{
              flex: '1 1 110px',
              padding: '6px 8px',
              borderRadius: 6,
              fontSize: 12,
              textAlign: 'center',
              border: '1px solid var(--border, #d8dee6)',
              background: reached ? 'var(--brand, #1f4e8c)' : 'transparent',
              color: reached ? '#fff' : 'inherit',
              opacity: reached ? 1 : 0.65,
            }}
          >
            {s.label}
          </div>
        );
      })}
    </div>
  );
}

export function VerificationReport({ verification }) {
  const [zoom, setZoom] = useState(null);
  if (!verification?.result) return null;
  const ok = verification.result === 'VERIFIED';
  const loc = verification.location;
  const link = mapsLink(loc);
  return (
    <Section title="URC Verification Report">
      <div className="row align-center gap-1 mb-1">
        {ok ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
        <Badge variant={ok ? 'success' : 'danger'}>{ok ? 'Verified on site' : 'Not verified'}</Badge>
        <span className="micro muted">Submitted {fmtDateTime(verification.submittedAt)}</span>
      </div>
      {verification.remarks && <p className="small" style={{ margin: '0 0 10px' }}>{verification.remarks}</p>}

      {loc && (
        <div style={{ ...grid, marginBottom: 12 }}>
          <Field label="Location (lat, lng)">
            <span className="row align-center gap-1">
              <MapPin size={14} aria-hidden /> {Number(loc.lat).toFixed(6)}, {Number(loc.lng).toFixed(6)}
            </span>
          </Field>
          <Field label="GPS accuracy">{loc.accuracy != null ? `±${Math.round(loc.accuracy)} m` : ''}</Field>
          <Field label="Address noted by URC">{loc.address}</Field>
          {link && (
            <div>
              <div className="micro muted">Map</div>
              <a href={link} target="_blank" rel="noreferrer" className="font-semibold row align-center gap-1">
                Open in Google Maps <ExternalLink size={13} aria-hidden />
              </a>
            </div>
          )}
        </div>
      )}

      {verification.photos?.length > 0 && (
        <>
          <div className="micro muted mb-1 row align-center gap-1"><Camera size={13} aria-hidden /> Photos ({verification.photos.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {verification.photos.map((p, i) => (
              <button
                key={p.url || i}
                type="button"
                onClick={() => setZoom(p)}
                style={{ padding: 0, border: '1px solid var(--border, #d8dee6)', borderRadius: 8, overflow: 'hidden', background: 'none', cursor: 'zoom-in', textAlign: 'left' }}
                aria-label={`Open photo ${i + 1}`}
              >
                <img src={fileSrc(p.url)} alt={p.caption || `Verification photo ${i + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                {p.caption && <div className="micro muted" style={{ padding: '4px 6px' }}>{p.caption}</div>}
              </button>
            ))}
          </div>
        </>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}
        >
          <img src={fileSrc(zoom.url)} alt={zoom.caption || 'Verification photo'} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
        </div>
      )}
    </Section>
  );
}

export default function DealerRequestDetail({ request: r }) {
  if (!r) return null;
  const d = r.dealer || {};
  const meta = statusMeta(r.status);
  return (
    <div>
      <div className="row align-center gap-1 mb-2 flex-wrap">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <span className="micro muted">Raised {fmtDateTime(r.createdAt)} by {r.oemId?.name || 'OEM'}</span>
      </div>
      <ProgressStrip status={r.status} />

      <Section title="Proposed Dealer">
        <div style={grid}>
          <Field label="Dealer name">{d.name}</Field>
          <Field label="Proposed code">{d.proposedCode}</Field>
          <Field label="Contact person">{d.person}</Field>
          <Field label="Phone">{d.phone && <span className="row align-center gap-1"><Phone size={13} aria-hidden /> {d.phone}</span>}</Field>
          <Field label="Email">{d.email && <span className="row align-center gap-1"><Mail size={13} aria-hidden /> {d.email}</span>}</Field>
          <Field label="GSTIN">{d.gstin}</Field>
          <Field label="Address">{d.address}</Field>
          <Field label="City / State">{[d.city, d.state].filter(Boolean).join(', ')}</Field>
          <Field label="Pincode">{d.pincode}</Field>
          <Field label="OEM remarks">{r.remarks}</Field>
        </div>
      </Section>

      <Section title="Routing">
        <div style={grid}>
          <Field label="Request No">{r.requestNo}</Field>
          <Field label="OEM">{r.oemId ? `${r.oemId.name} (${r.oemId.code})` : ''}</Field>
          <Field label="Depot">{r.depotId ? `${r.depotId.name} (${r.depotId.code})` : ''}</Field>
          <Field label="URC">{r.urcId ? `${r.urcId.name} (${r.urcId.code})` : ''}</Field>
          <Field label="Admin remarks">{r.adminRemarks}</Field>
          <Field label="Depot remarks">{r.depotRemarks}</Field>
          {r.dealerId && <Field label="Created dealer">{`${r.dealerId.name} (${r.dealerId.code})`}</Field>}
          {r.rejectionReason && <Field label="Rejection reason">{r.rejectionReason}</Field>}
        </div>
      </Section>

      <VerificationReport verification={r.verification} />

      {Array.isArray(r.history) && r.history.length > 0 && (
        <Section title="History">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {[...r.history].reverse().map((h, i) => (
              <li key={i} className="small" style={{ marginBottom: 4 }}>
                <b>{statusMeta(h.to).label}</b> · <span className="muted">{fmtDateTime(h.at)}</span>
                {h.byRole ? <span className="micro muted"> · {String(h.byRole).replace(/_/g, ' ')}</span> : null}
                {h.note ? <div className="micro muted">{h.note}</div> : null}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
