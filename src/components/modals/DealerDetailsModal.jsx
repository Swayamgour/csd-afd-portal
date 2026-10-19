import React from 'react';
import { X, Building2 } from 'lucide-react';

export function DealerDetailsModal({ isOpen, onClose, dealer }) {
  if (!isOpen || !dealer) return null;

  return (
    <div className="csd-modal-backdrop" onClick={onClose}>
      <div className="csd-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header matching Fig. 7 */}
        <div className="csd-modal-header">
          <div className="row align-center gap-1">
            <Building2 size={20} color="#1e4fd8" />
            <h3 className="csd-modal-title">Dealer Details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="csd-modal-close-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content matching Fig. 7 */}
        <div className="csd-modal-body">
          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Dealer Code:</label>
            <input
              type="text"
              readOnly
              value={dealer.code || '1802'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Name of dealer:</label>
            <input
              type="text"
              readOnly
              value={dealer.name || 'EAKANSH WHEELS (AMBALA)'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Dealer's Address:</label>
            <textarea
              readOnly
              rows={3}
              value={dealer.address || 'KM STONE 126, VILL TEPLA, AMBALA JAGADHRI ROAD, AMBALA CANTT 133001, HARYANA'}
              className="csd-modal-form-input textarea-no-resize"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Contact Person Name:</label>
            <input
              type="text"
              readOnly
              value={dealer.contactPerson || 'ASHISH BANSAL, ANUJ BANSAL'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Mobile Number:</label>
            <input
              type="text"
              readOnly
              value={dealer.phone || '9991100009'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Email:</label>
            <input
              type="text"
              readOnly
              value={dealer.email || 'marutiarenadealer_1802@gmail.com'}
              className="csd-modal-form-input"
            />
          </div>
        </div>

        <div className="csd-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DealerDetailsModal;
