import React from 'react';
import { X, FileText, Printer, CheckCircle2 } from 'lucide-react';

export default function DepotOrderSummaryModal({ isOpen, onClose, demand }) {
  if (!isOpen || !demand) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-summary-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <FileText size={18} className="text-brand" />
            <h3 className="csd-modal-title">Depot Order Summary · {demand.id}</h3>
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
              <strong className="text-brand font-bold">{demand.id}</strong>
              <span className="small muted block">Indent Date: {demand.indentDate || demand.displayDate || '14/12/20'}</span>
            </div>
            <div>
              <span className="micro muted uppercase block font-semibold">Current Status</span>
              <span className="badge-pill badge-primary">{demand.status}</span>
            </div>
            <div>
              <span className="micro muted uppercase block font-semibold">Total CSD Value</span>
              <strong className="text-green font-bold">₹{Number(demand.totalAmount || demand.csdPrice || 0).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Grid of Sections */}
          <div className="depot-summary-grid-2">
            {/* Product & Procurement Details */}
            <div className="depot-summary-section">
              <h4 className="depot-summary-heading">Vehicle / Item Procurement</h4>
              <table className="depot-summary-meta-table">
                <tbody>
                  <tr>
                    <td>Item Name:</td>
                    <td><strong>{demand.productName}</strong></td>
                  </tr>
                  <tr>
                    <td>SKU Index:</td>
                    <td>{demand.sku || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Color:</td>
                    <td>{demand.color || 'Standard'}</td>
                  </tr>
                  <tr>
                    <td>Price Zone:</td>
                    <td>{demand.priceZone || 'Default'}</td>
                  </tr>
                  <tr>
                    <td>Depot:</td>
                    <td>{demand.depot || 'Mydepot'}</td>
                  </tr>
                  <tr>
                    <td>URC:</td>
                    <td>{demand.urc || 'myurc'}</td>
                  </tr>
                  <tr>
                    <td>Allotted Dealer:</td>
                    <td>{demand.dealer || 'mydealer'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Beneficiary Details */}
            <div className="depot-summary-section">
              <h4 className="depot-summary-heading">Beneficiary Particulars</h4>
              <table className="depot-summary-meta-table">
                <tbody>
                  <tr>
                    <td>Username:</td>
                    <td><strong>{demand.username || demand.beneficiaryName}</strong></td>
                  </tr>
                  <tr>
                    <td>Service No:</td>
                    <td>{demand.serviceNumber || 'JC-765432X'}</td>
                  </tr>
                  <tr>
                    <td>Full Name:</td>
                    <td>{demand.beneficiaryName || 'Subedar Major M. Test'}</td>
                  </tr>
                  <tr>
                    <td>Rank / Category:</td>
                    <td>JCO / OR Entitlement</td>
                  </tr>
                  <tr>
                    <td>Payment Mode:</td>
                    <td>{demand.paymentMethod || 'Direct bank transfer'}</td>
                  </tr>
                  <tr>
                    <td>Payment Status:</td>
                    <td><span className="text-green font-semibold">● {demand.paymentStatus || 'Verified'}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
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
    </div>
  );
}
