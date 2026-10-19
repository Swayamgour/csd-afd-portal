import React from 'react';
import { X, Store } from 'lucide-react';

export function URCDetailsModal({ isOpen, onClose, urc }) {
  if (!isOpen || !urc) return null;

  return (
    <div className="csd-modal-backdrop" onClick={onClose}>
      <div className="csd-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header matching Fig. 8 */}
        <div className="csd-modal-header">
          <div className="row align-center gap-1">
            <Store size={20} color="#0f766e" />
            <h3 className="csd-modal-title">URC Details</h3>
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

        {/* Content matching Fig. 8 */}
        <div className="csd-modal-body">
          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">URC Code:</label>
            <input
              type="text"
              readOnly
              value={urc.code || '685'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Name of URC:</label>
            <input
              type="text"
              readOnly
              value={urc.name || '7 WING AF'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">URC's Address:</label>
            <textarea
              readOnly
              rows={3}
              value={urc.address || 'C/O 56 APO'}
              className="csd-modal-form-input textarea-no-resize"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Contact Person Name:</label>
            <input
              type="text"
              readOnly
              value={urc.contactPerson || '-'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Mobile Number:</label>
            <input
              type="text"
              readOnly
              value={urc.phone || '-'}
              className="csd-modal-form-input"
            />
          </div>

          <div className="csd-modal-form-group">
            <label className="csd-modal-form-label">Email:</label>
            <input
              type="text"
              readOnly
              value={urc.email || 'urc-685@gmail.com'}
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

export default URCDetailsModal;
