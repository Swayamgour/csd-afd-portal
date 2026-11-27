import React, { useState, useRef } from 'react';
import {
  Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X, ShieldCheck, AlertTriangle
} from 'lucide-react';
import Button from './Button.jsx';
import { useDownloadFirstAvailableMutation } from '../../redux/api/fileApi.js';
import Loader from './Loader.jsx';

export default function ExcelImportModal({
  isOpen,
  onClose,
  onImport,
  templateUrl = '/api/v1/oem/products/import-template',
  title = 'Import Products & State Pricing (Excel / CSV)',
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const fileInputRef = useRef(null);
  const [downloadFirstAvailable] = useDownloadFirstAvailableMutation();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel (.xlsx) or CSV file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await onImport(formData).unwrap();
      const data = res?.data || res;
      setResult(data);
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to import file. Please check sheet format.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadFirstAvailable({
        urls: [templateUrl, '/api/v1/products/import-template'],
        filename: 'CSD_Product_and_Pricing_Template.xlsx',
      }).unwrap();
    } catch (err) {
      console.error('Template download error:', err);
      setError('Unable to download template. Please ensure backend service is running.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const scrutiny = result?.scrutiny;

  return (
    <div className="pos-fixed inset-fill z-overlay flex items-center justify-center backdrop-dim backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl maxw-xl w-full clip border border-slate-200">
        {/* Header */}
        <div className="px-lg py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center inline-gap-sm">
            <FileSpreadsheet className="text-emerald-600" size={22} />
            <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover-text-ink p-1 rounded-lg hover-bg-muted transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 stack-lg">
          {!result ? (
            <>
              {/* Instructions */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-info-strong">
                <p className="font-semibold mb-1">Official CSD Format (Letter 201/902 Compliant):</p>
                <p className="text-xs lh-relaxed text-blue-800">
                  Workbook with 2 sheets: <b>Products</b> (Consolidated specs, colors, images) and <b>Pricing</b> (State-wise base prices across all 39 CSD states/UTs). Single CSV files are also supported.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="mt-2 inline-flex items-center gap-tight text-xs font-semibold text-info hover-text-info link-underline"
                >
                  <Download size={14} /> Download Sample 39-States Excel Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${file ? 'border-ok bg-ok-faint' : 'border-slate-300 hover-border-brand bg-subtle'
 }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="is-hidden"
                  onChange={handleFileChange}
                />
                <FileSpreadsheet className={file ? 'text-emerald-600' : 'text-slate-400'} size={40} />
                <p className="mt-2 font-medium text-slate-700 text-sm">
                  {file ? file.name : 'Click to select Excel (.xlsx) or CSV file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size: 20 MB'}
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <AlertCircle size={18} className="flex-shrink-0 mt-hair text-red-600" />
                  <div>{error}</div>
                </div>
              )}
            </>
          ) : (
            /* Results & Scrutiny Screen */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={32} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-base">Excel Import Processed</h4>
                    <p className="text-xs text-emerald-700">
                      OEM: <b>{result.oemName || 'Identified OEM'}</b>
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-snug py-1 bg-ok-soft text-emerald-800 text-xs font-semibold pill">
                  <ShieldCheck size={14} /> A6 Checks Verified
                </span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className={`pb-2 px-3 font-medium transition ${activeTab === 'summary' ? 'border-b-thick border-accent text-brand font-semibold' : 'text-slate-500 hover-text-ink'
 }`}
                >
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('scrutiny')}
                  className={`pb-2 px-3 font-medium transition ${activeTab === 'scrutiny' ? 'border-b-thick border-accent text-brand font-semibold' : 'text-slate-500 hover-text-ink'
 }`}
                >
                  Automated Checks ({scrutiny?.checks?.length || 0})
                </button>
              </div>

              {activeTab === 'summary' ? (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500">Products Created</p>
                    <p className="text-xl font-bold text-slate-800">{result.productsCreated || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500">Products Updated</p>
                    <p className="text-xl font-bold text-slate-800">{result.productsUpdated || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500">State Prices Created</p>
                    <p className="text-xl font-bold text-emerald-600">{result.pricingCreated || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500">State Prices Updated</p>
                    <p className="text-xl font-bold text-info">{result.pricingUpdated || 0}</p>
                  </div>
                </div>
              ) : (
                /* Scrutiny Checks Tab */
                <div className="space-y-2 maxh-lg scroll-y pr-xs">
                  {scrutiny?.checks?.map((chk) => (
                    <div
                      key={chk.id}
                      className={`flex items-start justify-between p-snug rounded-lg border text-xs ${chk.status === 'PASSED'
 ? 'bg-ok-faint border-emerald-200 text-ok-strong'
 : 'bg-warn-soft border-amber-200 text-warn-strong'
 }`}
                    >
                      <div className="flex items-center gap-2">
                        {chk.status === 'PASSED' ? (
                          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold">{chk.name}</p>
                          <p className="text-slate-500 text-xsmall">{chk.details}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-hair rounded font-mono font-bold text-tiny ${chk.status === 'PASSED' ? 'bg-ok-soft text-emerald-800' : 'bg-warn-tint text-warn'
 }`}
                      >
                        {chk.status}
                      </span>
                    </div>
                  ))}

                  {scrutiny?.missingStates?.length > 0 && (
                    <div className="p-snug bg-amber-50 border border-amber-200 rounded-lg text-xs text-warn-strong">
                      <p className="font-semibold mb-1">State Coverage Notice:</p>
                      <p className="text-xsmall lh-tight">
                        Some indices have fewer than 39 states. Please ensure full state pricing is maintained for all territories.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {result.errors?.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-warn maxh-sm scroll-y">
                  <p className="font-semibold mb-1">Warnings / Notes:</p>
                  <ul className="list-bulleted pl-indent stack-hair">
                    {result.errors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-lg py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          {!result ? (
            <>
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader variant="inline" size="sm" />
                    Checking & Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload & Verify
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleReset}>
                Import Another
              </Button>
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
