import React, { useState } from 'react';
import { X, Upload, FileCheck, AlertCircle } from 'lucide-react';

/**
 * UploadSupplyOrderModal (Fig. 6 in CSD Depot Manual)
 * Mandatory 3 documents generated from ICDS software:
 * 1. Official Receipt
 * 2. Supply Order
 * 3. Authority Letter
 */
export default function UploadSupplyOrderModal({ isOpen, onClose, demand, onSave }) {
  if (!isOpen || !demand) return null;

  const [files, setFiles] = useState({
    officialReceipt: null,
    supplyOrder: null,
    authorityLetter: null
  });

  const [errors, setErrors] = useState({});

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    const errs = {};
    if (!files.officialReceipt) errs.officialReceipt = 'Official Receipt file is required';
    if (!files.supplyOrder) errs.supplyOrder = 'Supply Order file is required';
    if (!files.authorityLetter) errs.authorityLetter = 'Authority letter file is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave({
      officialReceiptName: files.officialReceipt.name,
      supplyOrderName: files.supplyOrder.name,
      authorityLetterName: files.authorityLetter.name,
      uploadedDate: new Date().toLocaleDateString('en-GB')
    });
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-upload-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <Upload size={18} className="text-brand" />
            <h3 className="csd-modal-title">Upload Supply Order</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className="csd-modal-body">
            <div className="depot-upload-guideline-note">
              <AlertCircle size={16} className="text-brand flex-shrink-0" />
              <span>
                Upload documents generated from your depot's existing <strong>ICDS software</strong>. Files must be signed PDF/images.
              </span>
            </div>

            <div className="depot-upload-field-list">
              {/* Official Receipt */}
              <div className="depot-upload-item">
                <label className="depot-upload-label">
                  Official Receipt:<span className="text-danger">*</span>
                </label>
                <div className="depot-file-input-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="depot-real-file-input"
                    id="file-official-receipt"
                    onChange={(e) => handleFileChange('officialReceipt', e.target.files[0])}
                  />
                  <label htmlFor="file-official-receipt" className="btn-depot-choose-file">
                    Choose File
                  </label>
                  <span className="depot-chosen-filename">
                    {files.officialReceipt ? files.officialReceipt.name : 'no file selected'}
                  </span>
                </div>
                {errors.officialReceipt && (
                  <span className="depot-error-msg">{errors.officialReceipt}</span>
                )}
              </div>

              {/* Supply Order */}
              <div className="depot-upload-item">
                <label className="depot-upload-label">
                  Supply Order:<span className="text-danger">*</span>
                </label>
                <div className="depot-file-input-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="depot-real-file-input"
                    id="file-supply-order"
                    onChange={(e) => handleFileChange('supplyOrder', e.target.files[0])}
                  />
                  <label htmlFor="file-supply-order" className="btn-depot-choose-file">
                    Choose File
                  </label>
                  <span className="depot-chosen-filename">
                    {files.supplyOrder ? files.supplyOrder.name : 'no file selected'}
                  </span>
                </div>
                {errors.supplyOrder && (
                  <span className="depot-error-msg">{errors.supplyOrder}</span>
                )}
              </div>

              {/* Authority Letter */}
              <div className="depot-upload-item">
                <label className="depot-upload-label">
                  Authority letter:<span className="text-danger">*</span>
                </label>
                <div className="depot-file-input-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="depot-real-file-input"
                    id="file-authority-letter"
                    onChange={(e) => handleFileChange('authorityLetter', e.target.files[0])}
                  />
                  <label htmlFor="file-authority-letter" className="btn-depot-choose-file">
                    Choose File
                  </label>
                  <span className="depot-chosen-filename">
                    {files.authorityLetter ? files.authorityLetter.name : 'no file selected'}
                  </span>
                </div>
                {errors.authorityLetter && (
                  <span className="depot-error-msg">{errors.authorityLetter}</span>
                )}
              </div>
            </div>
          </div>

          <div className="csd-modal-footer depot-manual-footer-center">
            <button type="button" className="btn-depot-manual-close" onClick={onClose}>
              CLOSE
            </button>
            <button type="submit" className="btn-depot-manual-submit btn-gradient-red">
              UPLOAD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
