import React, { useState } from 'react';
import { MapPin, Phone, Mail, Camera, ExternalLink, CheckCircle2, XCircle, AlertTriangle, FileText, RefreshCw, Building, UserCheck } from 'lucide-react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import { STAGES, statusMeta, fmtDateTime, fileSrc, mapsLink, placeholderPhoto } from './dealerRequestUtils.js';
import { useRecalculateScrutinyMutation } from '../../redux/api/dealerRequestApi.js';

const MANDATORY_DOC_LABELS = {
  dealerRegistrationRequest: '1. Dealer Registration Request (OEM Letter)',
  dealerAcceptanceLetter: '2. Dealer Acceptance Letter',
  gstCertificate: '3. GST Registration Certificate',
  caCertificateGst: '4. CA Certificate for GST Turnover/Status',
  panCard: '5. PAN Card of Firm/Dealer',
  electricityBillAddressProof: '6. Showroom Electricity Bill / Address Proof',
  idProof: '7. ID Proof of Authorized Signatory',
  bankCancelledCheque: '8. Bank Cancelled Cheque / Mandate',
  authorizedDealershipCert: '10. Dealership Agreement / Authorization Certificate',
  ownersContactDetails: '11. Owners / Directors / Partners Contact Details',
  gstCompositionCert: '12. GST Composition / Non-Composition Declaration',
  indemnityBond: 'Indemnity Bond Document',
};

const Field = ({ label, children }) => (
  <div style={{ minWidth: 0 }}>
    <div className="micro muted">{label}</div>
    <div className="font-semibold" style={{ wordBreak: 'break-word' }}>
      {children || '—'}
    </div>
  </div>
);

const Section = ({ title, children, extra }) => (
  <section style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <h4 style={{ margin: 0, fontSize: 14 }}>{title}</h4>
      {extra}
    </div>
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


/** 12 Mandatory Documents (Letter 902) & Showroom Photos */
function MandatoryDocumentsList({ documents, indemnityBondSubmitted }) {
  const [zoom, setZoom] = useState(null);
  const docs = documents || {};
  const photos = Array.isArray(docs.showroomPhotos) ? docs.showroomPhotos : [];

  return (
    <Section title="12 Mandatory Documents Checklist (CSD Letter 902)">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 14 }}>
        {Object.entries(MANDATORY_DOC_LABELS).map(([k, label]) => {
          const url = docs[k];
          const isBond = k === 'indemnityBond';
          const hasBond = isBond ? Boolean(url || indemnityBondSubmitted) : Boolean(url);
          return (
            <div
              key={k}
              style={{
                border: hasBond ? '1px solid #86efac' : '1px dashed #cbd5e1',
                background: hasBond ? '#f0fdf4' : '#fafafa',
                borderRadius: 6,
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ minWidth: 0, paddingRight: 6 }}>
                <div className="small font-semibold" style={{ fontSize: 12 }}>
                  {label}
                </div>
                {url ? (
                  <a href={fileSrc(url)} target="_blank" rel="noreferrer" className="micro text-brand row align-center gap-0-5" style={{ marginTop: 2 }}>
                    <FileText size={11} /> View document <ExternalLink size={10} />
                  </a>
                ) : isBond && indemnityBondSubmitted ? (
                  <span className="micro text-success">Submitted (Physical/Signed)</span>
                ) : (
                  <span className="micro muted">Not uploaded</span>
                )}
              </div>
              {hasBond ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} className="text-muted" />}
            </div>
          );
        })}
      </div>

      {/* Showroom Photos (Doc #9: Min 5 Photos) */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="small font-semibold">9. Showroom Photographs (Minimum 5 Photos Required)</span>
          <Badge variant={photos.length >= 5 ? 'success' : 'warning'}>{photos.length}/5 Photos</Badge>
        </div>
        {photos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {photos.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setZoom(url)}
                style={{ padding: 0, border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden', background: '#fff', cursor: 'zoom-in' }}
              >
                <img
                  src={fileSrc(url)}
                  alt={`Showroom Photo ${i + 1}`}
                  style={{ width: '100%', height: 75, objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholderPhoto(`Showroom Photo ${i + 1}`);
                  }}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="micro muted">No showroom photos uploaded.</div>
        )}
      </div>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}
        >
          <img src={fileSrc(zoom)} alt="Zoomed document" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
        </div>
      )}
    </Section>
  );
}

/** Depot Physical Verification Section (Letter 201, 04 Aug 2026) */
function DepotVerificationCard({ depotVerification, depotView = false }) {
  const [zoom, setZoom] = useState(null);
  const dv = depotVerification;
  if (!dv?.submittedAt && !dv?.physicalVerificationReportUrl) return null;

  const photos = Array.isArray(dv.showroomPhotos) ? dv.showroomPhotos : [];

  return (
    <Section
      title="Depot Physical Verification (CSD Letter 201, 04 Aug 2026)"
      extra={<Badge variant="success">Physical Verification Completed</Badge>}
    >
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
        <div style={{ ...grid, marginBottom: 12 }}>
          <Field label="Verifying Officer">
            <span className="row align-center gap-0-5">
              <UserCheck size={14} /> {dv.verifyingOfficerName}
            </span>
          </Field>
          <Field label="Personnel Number">{dv.verifyingOfficerPersonnelNo}</Field>
          {!depotView && <Field label="Signatory Role">{dv.signatoryRole?.replace(/_/g, ' ')}</Field>}
          <Field label="Verification Date">{fmtDateTime(dv.submittedAt)}</Field>
          {dv.comments && <Field label="Depot Remarks">{dv.comments}</Field>}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          {dv.physicalVerificationReportUrl && (
            <a
              href={fileSrc(dv.physicalVerificationReportUrl)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-xs row align-center gap-0-5"
            >
              <FileText size={12} /> 1. Physical Verification Report <ExternalLink size={11} />
            </a>
          )}
          {dv.depotConfirmationLetterUrl && (
            <a
              href={fileSrc(dv.depotConfirmationLetterUrl)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-xs row align-center gap-0-5"
            >
              <Building size={12} /> 3. Signed Depot Confirmation Letter <ExternalLink size={11} />
            </a>
          )}
        </div>

        {photos.length > 0 && (
          <div>
            <div className="micro muted mb-0-5">2. Showroom Photographs Verified by Depot ({photos.length}):</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              {photos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setZoom(url)}
                  style={{ padding: 0, border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden', background: '#fff', cursor: 'zoom-in' }}
                >
                  <img src={fileSrc(url)} alt={`Depot Photo ${i + 1}`} style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}
        >
          <img src={fileSrc(zoom)} alt="Depot Photo" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
        </div>
      )}
    </Section>
  );
}


export default function DealerRequestDetail({ request: r, oemView = false, depotView = false }) {
  if (!r) return null;
  const d = r.dealer || {};
  const meta = statusMeta(r.status);
  return (
    <div>
      
      {/* progress strip (OEM request → Admin → Depot → Dealer created) is shown in the OEM portal only */}
      {oemView && <ProgressStrip status={r.status} />}

      {/* Automated Scrutiny Section */}
      {/* <ScrutinyReportCard requestId={r._id} scrutinyReport={r.scrutinyReport} /> */}

      {/* Proposed Dealer (17-Column details) */}
      <Section title="Proposed Dealership Details">
        <div style={grid}>
          <Field label="Dealer Name">{d.name}</Field>
          <Field label="Proposed Code">{d.proposedCode}</Field>
          <Field label="Dealership Type">{d.dealershipType}</Field>
          <Field label="Contact Person">{d.person}</Field>
          <Field label="Mobile Phone">
            {d.phone && (
              <span className="row align-center gap-1">
                <Phone size={13} aria-hidden /> {d.phone}
              </span>
            )}
          </Field>
          <Field label="Landline / Alt">{d.landline}</Field>
          <Field label="Email">
            {d.email && (
              <span className="row align-center gap-1">
                <Mail size={13} aria-hidden /> {d.email}
              </span>
            )}
          </Field>
          <Field label="GSTIN">{d.gstin}</Field>
          <Field label="PAN">{d.panNumber}</Field>
          <Field label="State Code">{d.stateCode}</Field>
          <Field label="State">{d.state}</Field>
          <Field label="District">{d.district}</Field>
          <Field label="City">{d.city}</Field>
          <Field label="Pincode">{d.pincode}</Field>
          <Field label="Address">{d.address}</Field>
          <Field label="Indemnity Bond">{r.indemnityBondSubmitted ? 'Submitted' : 'Pending'}</Field>
          <Field label="OEM Remarks">{r.remarks}</Field>
        </div>
      </Section>

      {/* 12 Mandatory Documents Checklist (CSD Letter 902) */}
      <MandatoryDocumentsList documents={r.documents} indemnityBondSubmitted={r.indemnityBondSubmitted} />

      {/* Depot Physical Verification (CSD Letter 201) */}
      <DepotVerificationCard depotVerification={r.depotVerification} depotView={depotView} />

      {/* Routing Info */}
      <Section title="Routing Information">
        <div style={grid}>
          <Field label="Request No">{r.requestNo}</Field>
          <Field label="OEM">{r.oemId ? `${r.oemId.name} (${r.oemId.code})` : ''}</Field>
          <Field label="Depot">{r.depotId ? `${r.depotId.name} (${r.depotId.code})` : ''}</Field>
          <Field label="Admin Remarks">{r.adminRemarks}</Field>
          {r.dealerId && <Field label="Created Dealer">{`${r.dealerId.name} (${r.dealerId.code})`}</Field>}
          {r.dealerAccount?.username && <Field label="Dealer Username">{r.dealerAccount.username}</Field>}
          {r.dealerAccount?.emailStatus && <Field label="Login Email">{`${r.dealerAccount.emailStatus === 'SENT' ? 'Sent' : r.dealerAccount.emailStatus === 'QUEUED' ? 'Queued' : 'Failed'} to ${r.dealerAccount.emailTo || ''}`}</Field>}
          {r.rejectionReason && <Field label="Rejection Reason">{r.rejectionReason}</Field>}
        </div>
      </Section>

      {/* History */}
      {!depotView && Array.isArray(r.history) && r.history.length > 0 && (
        <Section title="Request Workflow History">
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
