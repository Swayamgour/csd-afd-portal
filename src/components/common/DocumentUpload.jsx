import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { UPLOAD_CONFIG, validateFile, formatFileSize } from '../../config/uploadConfig.js';

export function DocumentUpload({
  label,
  required = false,
  helperText = 'Allowed: PDF, JPG, PNG (Max 5MB)',
  accept = UPLOAD_CONFIG.acceptString,
  file,
  onFileSelect,
  onFileRemove,
  error,
  disabled = false,
  id
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState('');
  const inputRef = useRef(null);

  const elementId = id || `upload-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    setInternalError('');

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setInternalError(validation.error);
      return;
    }

    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setInternalError('');
    if (inputRef.current) inputRef.current.value = '';
    if (onFileRemove) onFileRemove();
  };

  const displayError = error || internalError;

  return (
    <div className="doc-upload-field">
      {label && (
        <label htmlFor={elementId} className="doc-upload-label">
          {label}
          {required && <span className="doc-upload-required-star">*</span>}
        </label>
      )}

      <input
        type="file"
        id={elementId}
        ref={inputRef}
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        hidden
      />

      {!file ? (
        // Dropzone / File Picker
        <div
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`doc-upload-dropzone ${displayError ? 'has-error' : ''} ${isDragging ? 'dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
        >
          <div className="doc-upload-dropzone-content">
            <div className="doc-upload-icon-wrapper">
              <Upload size={18} />
            </div>
            <div className="doc-upload-text-content">
              <div className="doc-upload-primary-text">
                <span className="doc-upload-highlight">Choose File</span> or drag & drop here
              </div>
              <div className="doc-upload-helper-text">
                {helperText}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="doc-upload-browse-btn"
          >
            Browse
          </button>
        </div>
      ) : (
        // File Preview / Loaded state
        <div className="doc-upload-preview-card">
          <div className="doc-upload-preview-left">
            <div className="doc-upload-file-icon">
              <FileText size={18} />
            </div>
            <div className="doc-upload-file-details">
              <span title={file.name} className="doc-upload-filename">
                {file.name}
              </span>
              <div className="doc-upload-meta-status">
                <CheckCircle2 size={12} />
                <span className="doc-upload-meta-text">
                  {formatFileSize(file.size)} · Ready for demand attachment
                </span>
              </div>
            </div>
          </div>

          <div className="doc-upload-actions">
            <button
              type="button"
              onClick={handleBrowseClick}
              title="Replace file"
              className="doc-upload-btn-replace"
            >
              <RefreshCw size={12} />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              title="Remove file"
              className="doc-upload-btn-remove"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {displayError && (
        <div className="doc-upload-error-msg">
          <AlertCircle size={14} />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
