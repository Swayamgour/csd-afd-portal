import React, { useState } from 'react';
import { X, FileText, Printer, CheckCircle2, Eye, Download, FileCheck } from 'lucide-react';
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

export default function DepotOrderSummaryModal({ isOpen, onClose, demand }) {
  const [previewDoc, setPreviewDoc] = useState(null);

  if (!isOpen || !demand) return null;

  const handlePrint = () => {
    window.print();
  };

  const docs = Array.isArray(demand.documents) ? demand.documents : [];

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-summary-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <FileText size={18} className="text-brand" />
            <h3 className="csd-modal-title">Depot Order Summary · {demand.demandNo || demand.id}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="csd-modal-body">
          {/* Header Card */}
          <div className="depot-summary-header-card">
            <div>
              <span className="micro muted uppercase block font-semibold">Demand Number</span>
              <strong className="text-brand font-bold">{demand.demandNo || demand.id}</strong>
              <span className="small muted block">Indent Date: {demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('en-GB') : (demand.indentDate || demand.displayDate || 'Recent')}</span>
            </div>
            <div>
              <span className="micro muted uppercase block font-semibold">Current Status</span>
              <span className="badge-pill badge-primary">{demand.status}</span>
            </div>
            <div>
              <span className="micro muted uppercase block font-semibold">Total CSD Value</span>
              <strong className="text-green font-bold">₹{Number(demand.totalAmount || demand.pricing?.totalPrice || demand.csdPrice || 0).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Grid of Sections */}
          <div className="depot-summary-grid-2">
            {/* Product & Procurement Details */}
            <div className="depot-summary-section">
              <h4 className="depot-summary-heading">Vehicle / Item Procurement</h4>
              <div className="data-table-wrapper"><table className="data-table">
                <tbody>
                  <tr>
                    <td>Item Name:</td>
                    <td><strong>{demand.productName || demand.productId?.name || demand.productSnapshot?.name || 'Selected Item'}</strong></td>
                  </tr>
                  <tr>
                    <td>SKU Index:</td>
                    <td>{demand.productId?.sku || demand.productSnapshot?.sku || demand.sku || 'AFD-INDEX'}</td>
                  </tr>
                  <tr>
                    <td>Color:</td>
                    <td>{demand.selectedColor || demand.color || 'Standard'}</td>
                  </tr>
                  <tr>
                    <td>Price Zone:</td>
                    <td>{demand.priceZone || 'DELHI NCR'}</td>
                  </tr>
                  <tr>
                    <td>Depot:</td>
                    <td>{demand.depotId?.name || demand.depot || 'Regional Depot'}</td>
                  </tr>
                  <tr>
                    <td>URC:</td>
                    <td>{demand.urcId?.name || demand.urc || 'Assigned URC'}</td>
                  </tr>
                  <tr>
                    <td>Allotted Dealer:</td>
                    <td>{demand.dealerId?.name || demand.dealer || 'Authorized Dealership'}</td>
                  </tr>
                </tbody>
              </table></div>
            </div>

            {/* Beneficiary Details */}
            <div className="depot-summary-section">
              <h4 className="depot-summary-heading">Beneficiary Particulars</h4>
              <div className="data-table-wrapper"><table className="data-table">
                <tbody>
                  <tr>
                    <td>Username:</td>
                    <td><strong>{demand.userId?.username || demand.username || demand.beneficiaryName}</strong></td>
                  </tr>
                  <tr>
                    <td>Service No:</td>
                    <td>{demand.beneficiaryId?.serviceNumber || demand.serviceNumber || 'JC-765432X'}</td>
                  </tr>
                  <tr>
                    <td>Full Name:</td>
                    <td>{demand.beneficiaryId?.fullName || demand.beneficiaryName || demand.userId?.name}</td>
                  </tr>
                  <tr>
                    <td>Rank / Category:</td>
                    <td>{demand.beneficiaryId?.rank || demand.rank || 'JCO / Entitled Personnel'} ({demand.beneficiaryId?.category || 'SERVING'})</td>
                  </tr>
                  <tr>
                    <td>Payment Mode:</td>
                    <td>{demand.paymentMethod || 'Direct bank transfer / RTGS'}</td>
                  </tr>
                  <tr>
                    <td>Payment Status:</td>
                    <td><span className="text-green font-semibold">● {demand.paymentStatus || 'Verified'}</span></td>
                  </tr>
                </tbody>
              </table></div>
            </div>
          </div>

          {/* 4. Uploaded Beneficiary Verification Documents */}
          <div className="depot-summary-section mt-1">
            <div className="between align-center mb-1 border-b pb-1">
              <h4 className="depot-summary-heading m-0 border-0 p-0 row align-center gap-1">
                <FileCheck size={16} className="text-brand" />
                <span>Uploaded Beneficiary Verification Documents ({docs.length})</span>
              </h4>
              <span className="micro muted">Mandatory MoD / CSD Verification Records</span>
            </div>

            {docs.length > 0 ? (
              <div className="depot-summary-docs-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {docs.map((doc, idx) => {
                  const fullUrl = getFileUrl(doc.url);
                  const docLabel = DOCUMENT_LABELS[doc.type] || doc.type || 'Verification Document';
                  return (
                    <div
                      key={doc._id || idx}
                      className="between align-center p-2 rounded border"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                    >
                      <div className="row align-center gap-1" style={{ minWidth: 0, flex: 1 }}>
                        <div
                          className="doc-icon-wrap"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 6,
                            background: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1e4fd8',
                            flexShrink: 0
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span
                            className="badge-pill badge-primary badge-sm text-[10px] font-bold block mb-05"
                            style={{ width: 'fit-content', padding: '1px 6px', fontSize: '10px' }}
                          >
                            {docLabel}
                          </span>
                          <span
                            className="font-semibold text-xs text-ink block"
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}
                            title={doc.name || 'Document'}
                          >
                            {doc.name || `${docLabel}.pdf`}
                          </span>
                          {doc.uploadedAt && (
                            <span className="micro muted" style={{ fontSize: '11px' }}>
                              Uploaded: {new Date(doc.uploadedAt).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="row align-center gap-1" style={{ flexShrink: 0, marginLeft: '12px' }}>
                        {doc.url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ ...doc, label: docLabel })}
                            className="btn btn-sm btn-outline row align-center gap-05 font-semibold"
                            style={{
                              cursor: 'pointer',
                              padding: '5px 12px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              border: '1.5px solid #1e4fd8',
                              color: '#1e4fd8',
                              background: '#ffffff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Eye size={13} /> View Document
                          </button>
                        ) : (
                          <span className="micro muted">File Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center rounded border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <span className="small muted">No verification documents attached to this demand record.</span>
              </div>
            )}
          </div>

          {/* CSD & ICDS Status */}
          <div className="depot-summary-section mt-1">
            <h4 className="depot-summary-heading">CSD Treasury & ICDS Local Supply Order</h4>
            <div className="row between align-center">
              <div>
                <span className="small muted block">Official Receipt (OR):</span>
                <strong>{demand.csdPayment?.orNumber || 'Pending Entry via "Payment Received By CSD"'}</strong>
              </div>
              <div>
                <span className="small muted block">ICDS Supply Order:</span>
                <strong>{demand.supplyOrderDocs?.supplyOrderName || 'Pending Upload via "Upload Local Supply Order"'}</strong>
              </div>
              <div>
                <span className="small muted block">Authority Letter:</span>
                <strong>{demand.supplyOrderDocs?.authorityLetterName || 'Pending Upload'}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="csd-modal-footer between">
          <button type="button" className="btn-depot-manual-close" onClick={onClose}>
            CLOSE
          </button>
          <button type="button" className="btn-depot-action-print" onClick={handlePrint}>
            <Printer size={16} /> Print Summary
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
