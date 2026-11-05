import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useUploadFileMutation } from '../../beneficiary/beneficiaryApi.js';
import { useUploadSupplyOrderMutation } from '../../demand/demandApi.js';
import { getErrorMessage } from '../../../utils/apiError.js';

/**
 * UploadSupplyOrderModal (Fig. 6 in CSD Depot Manual)
 * Mandatory 3 documents generated from ICDS software:
 * 1. Official Receipt
 * 2. Supply Order
 * 3. Authority Letter
 */
export default function UploadSupplyOrderModal({ isOpen, onClose, demand, onSaved }) {
  const [files, setFiles] = useState({ officialReceipt: null, supplyOrder: null, authorityLetter: null });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const [uploadFile] = useUploadFileMutation();
  const [uploadSupplyOrder] = useUploadSupplyOrderMutation();

  if (!isOpen || !demand) return null;

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const upOne = async (f) => {
    const fd = new FormData();
    fd.append('files', f);
    const r = await uploadFile(fd).unwrap();
    const item = Array.isArray(r) ? r[0] : r?.data?.[0] || r?.[0];
    if (!item?.url) throw new Error(`Upload failed for ${f.name}`);
    return item.url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!files.officialReceipt) errs.officialReceipt = 'Official Receipt file is required';
    if (!files.supplyOrder) errs.supplyOrder = 'Supply Order file is required';
    if (!files.authorityLetter) errs.authorityLetter = 'Authority letter file is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setBusy(true);
    setServerError('');
    try {
      const officialReceiptUrl = await upOne(files.officialReceipt);
      const supplyOrderUrl = await upOne(files.supplyOrder);
      const authorityLetterUrl = await upOne(files.authorityLetter);
      await uploadSupplyOrder({ id: demand._id || demand.id, officialReceiptUrl, supplyOrderUrl, authorityLetterUrl }).unwrap();
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setServerError(getErrorMessage(err, err?.message || 'Upload failed'));
    } finally {
      setBusy(false);
    }
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
            {serverError && <div className="alert-banner error mb-2">{serverError}</div>}
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
            <button type="submit" className="btn-depot-manual-submit btn-gradient-red" disabled={busy}>
              {busy ? "UPLOADING..." : "UPLOAD"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
