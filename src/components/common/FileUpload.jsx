import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2 } from 'lucide-react';

export default function FileUpload({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 5,
  helperText = 'PDF, JPG up to 5MB',
  onFileSelect,
  required = false
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMb}MB limit.`);
      return;
    }

    setError('');
    setFile(selected);
    onFileSelect?.(selected);
  };

  const removeFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect?.(null);
  };

  return (
    <div className="file-upload-block">
      {label && (
        <label className="form-label">
          {label} {required && <span className="req-star">*</span>}
        </label>
      )}

      {!file ? (
        <div
          className="file-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) handleFileChange({ target: { files: [dropped] } });
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="sr"
          />
          <UploadCloud size={28} className="text-brand mb-1" aria-hidden="true" />
          <p className="dropzone-text small font-medium">Click to upload or drag & drop</p>
          <span className="muted small">{helperText}</span>
        </div>
      ) : (
        <div className="file-preview-card panel between">
          <div className="row align-center gap-1">
            <FileText size={24} className="text-brand" />
            <div>
              <p className="file-name font-medium small mb-0">{file.name}</p>
              <span className="file-size muted small">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready
              </span>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn text-danger"
            onClick={removeFile}
            aria-label="Remove uploaded file"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {error && <p className="err small mt-1">⚠ {error}</p>}
    </div>
  );
}
