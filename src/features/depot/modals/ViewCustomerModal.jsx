import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Award, CreditCard, FileText, Eye, FileCheck } from 'lucide-react';
import DocumentPreviewModal from '../../../components/common/DocumentPreviewModal.jsx';

const DOCUMENT_LABELS = {
  CANTEEN_CARD: 'CSD Smart Card / Canteen Card',
  AVAILABILITY_CERTIFICATE: 'Dealer Availability Certificate',
  PAN_CARD: 'PAN Card',
  PPO_DISCHARGE_BOOK: 'PPO / Discharge Book',
  PENSION_SLIP: 'Latest Pension Slip / Pay Slip',
  PAYMENT_RECEIPT: 'CSD Payment Receipt',
  SANCTION_LETTER: 'Bank Loan Sanction Letter',
  OTHER: 'Supporting Identity Document'
};

const getFileUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:5000';
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ViewCustomerModal({ isOpen, onClose, demand }) {
  const [previewDoc, setPreviewDoc] = useState(null);

  if (!isOpen || !demand) return null;

  const docs = Array.isArray(demand.documents) ? demand.documents : [];

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-customer-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <User size={18} className="text-brand" />
            <h3 className="csd-modal-title">Customer Details · {demand.username || demand.beneficiaryName || demand.userId?.name}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="csd-modal-body">
          <div className="depot-customer-profile-card">
            <div className="depot-customer-avatar">
              <User size={32} />
            </div>
            <div>
              <h4 className="depot-customer-name">
                {demand.beneficiaryId?.fullName || demand.beneficiaryName || demand.userId?.name || 'Verified Defence Beneficiary'}
              </h4>
              <span className="badge-pill badge-primary badge-sm">Verified Defence Beneficiary</span>
              <p className="micro muted mt-05">
                Username: <strong>{demand.userId?.username || demand.username || demand.beneficiaryName}</strong>
              </p>
            </div>
          </div>

          <div className="data-table-wrapper"><table className="data-table mt-15">
            <tbody>
              <tr>
                <td className="w-40"><span className="row align-center gap-05"><Award size={14} className="text-muted" /> Service Number:</span></td>
                <td><strong>{demand.beneficiaryId?.serviceNumber || demand.serviceNumber || 'N/A'}</strong></td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Award size={14} className="text-muted" /> Rank / Category:</span></td>
                <td><strong>{demand.beneficiaryId?.rank || demand.rank || 'Entitled Personnel'}</strong> ({demand.beneficiaryId?.category || 'SERVING'})</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><CreditCard size={14} className="text-muted" /> Grocery / Smart Card ID:</span></td>
                <td>{demand.beneficiaryId?.cardId || demand.canteenCardNo || 'N/A'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><CreditCard size={14} className="text-muted" /> PAN Number:</span></td>
                <td>{demand.beneficiaryId?.panNumber || demand.panNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Phone size={14} className="text-muted" /> Registered Mobile:</span></td>
                <td>{demand.beneficiaryId?.mobile || demand.userId?.mobile || demand.mobile || 'N/A'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Mail size={14} className="text-muted" /> Email Address:</span></td>
                <td>{demand.userId?.email || demand.beneficiaryId?.email || (demand.username ? `${demand.username}@defence.gov.in` : 'N/A')}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><MapPin size={14} className="text-muted" /> Allotted URC:</span></td>
                <td><strong>{demand.urcId?.name || demand.urc || 'Base Hospital Canteen'}</strong></td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><MapPin size={14} className="text-muted" /> Jurisdictional Depot:</span></td>
                <td><strong>{demand.depotId?.name || demand.depot || 'Delhi Regional Depot'}</strong></td>
              </tr>
            </tbody>
          </table></div>

          {/* Attached Customer Verification Documents */}
          {docs.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <div className="between align-center mb-1">
                <h5 className="font-bold text-xs uppercase text-slate-700 m-0 row align-center gap-05">
                  <FileCheck size={14} className="text-brand" />
                  <span>Attached Documents ({docs.length})</span>
                </h5>
                <span className="micro muted">Submitted at Checkout</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {docs.map((doc, idx) => (
                  <div
                    key={doc._id || idx}
                    className="between align-center p-2 rounded border"
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span
                        className="badge-pill badge-primary badge-sm text-[10px] font-bold block mb-05"
                        style={{ width: 'fit-content', padding: '1px 5px', fontSize: '9px' }}
                      >
                        {DOCUMENT_LABELS[doc.type] || doc.type}
                      </span>
                      <span
                        className="font-medium text-xs text-ink block"
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={doc.name}
                      >
                        {doc.name}
                      </span>
                    </div>
                    {doc.url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            ...doc,
                            label: DOCUMENT_LABELS[doc.type] || doc.type
                          })
                        }
                        className="btn btn-sm btn-outline font-semibold"
                        style={{
                          cursor: 'pointer',
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: '1px solid #1e4fd8',
                          color: '#1e4fd8',
                          background: '#fff',
                          flexShrink: 0,
                          marginLeft: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={11} /> View
                      </button>
                    ) : (
                      <span className="micro muted">File Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="csd-modal-footer justify-end">
          <button type="button" className="btn-depot-manual-close" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>

      {/* In-Portal Document Previewer Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          doc={previewDoc}
        />
      )}
    </div>
  );
}
