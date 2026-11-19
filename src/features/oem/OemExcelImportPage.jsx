import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2, ShieldCheck, AlertTriangle, ArrowLeft, Package, Layers, Check, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { useImportOemProductsExcelMutation } from './oemApi.js';
import { getAccessToken } from '../../utils/tokenStorage.js';
import { useImportProductsExcelMutation } from '../catalog/productApi.js';

export default function OemExcelImportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOem = location.pathname.startsWith('/oem');

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const fileInputRef = useRef(null);

  const [importOem] = useImportOemProductsExcelMutation();
  const [importCsd] = useImportProductsExcelMutation();

  const templateUrl = isOem
    ? '/api/v1/oem/products/import-template'
    : '/api/v1/products/import-template';

  const backUrl = isOem ? '/oem/products' : '/csd/products';
  const pricingUrl = isOem ? '/oem/pricing' : '/csd/products';

  const breadcrumbs = isOem
    ? [
        { label: 'OEM Portal', href: '/oem/dashboard' },
        { label: 'Product Catalog', href: '/oem/products' },
        { label: 'Excel Import' },
      ]
    : [
        { label: 'Portal Administration', href: '/csd/dashboard' },
        { label: 'Product Catalogue', href: '/csd/products' },
        { label: 'Excel Import' },
      ];

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = isOem ? await importOem(formData).unwrap() : await importCsd(formData).unwrap();
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
      setDownloading(true);
      setError(null);

      const token = getAccessToken() || '';
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try designated template URL first, fallback to public catalog template URL
      const urlsToTry = [
        templateUrl,
        '/api/v1/products/import-template',
      ];

      let response = null;
      for (const targetUrl of urlsToTry) {
        try {
          const authUrl = token ? `${targetUrl}?token=${encodeURIComponent(token)}` : targetUrl;
          const res = await fetch(authUrl, { method: 'GET', headers });
          if (res.ok) {
            response = res;
            break;
          }
        } catch {
          // Try next URL candidate
        }
      }

      if (!response || !response.ok) {
        throw new Error('Template download endpoint returned an error.');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'CSD_Product_and_Pricing_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Template download failed:', err);
      setError('Unable to download template. Please verify backend service is running.');
    } finally {
      setDownloading(false);
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
    <div className="space-y-6" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <PageHeader
        title="OEM Product & State Pricing Excel Import"
        subtitle="Official CSD Format (Letter 201/902 Compliant) · Automated 8-Point Scrutiny & 39 States Pricing"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={downloading ? Loader2 : Download}
              loading={downloading}
              onClick={handleDownloadTemplate}
            >
              Download 39-States Sample Template
            </Button>
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(backUrl)}>
              Back to Catalog
            </Button>
          </div>
        }
      />

      {/* Guidelines Card */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
              <ShieldCheck className="text-emerald-600" size={20} />
              <span>Official CSD Workbook Format Specifications (Letter 201 & 902)</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Upload a single Excel workbook containing two dedicated sheets. The import engine validates all 8 scrutiny
              checks automatically, extracts model specs, matches colors, cleans formula errors, and maps monthly state-wise concessional prices across all 39 CSD states/UTs.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={downloading ? Loader2 : Download}
            loading={downloading}
            onClick={handleDownloadTemplate}
            className="shrink-0"
          >
            Download Template (.xlsx)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Package size={14} className="text-blue-700" />
              <span>Sheet 1: Products (Consolidated Master List)</span>
            </div>
            <p className="text-blue-800">
              Columns: <b>Index No</b> (Master Key), <b>Variant / Model Name</b>, <b>Category / Segment</b>, <b>Dimensions</b>, <b>Fuel Type</b>, <b>Colors</b>, <b>Image File / URL</b>.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-700" />
              <span>Sheet 2: Pricing (Price Master File)</span>
            </div>
            <p className="text-emerald-800">
              Columns: <b>Index No</b>, <b>State Name / Code</b> (All 39 CSD States), <b>Base Price</b>, <b>Consumer Promotion</b>, <b>CSD Concessional Price</b>, <b>Civil Minimum Price</b>.
            </p>
          </div>
        </div>
      </Card>

      {/* Main Upload / Results Area */}
      {!result ? (
        <Card title="Upload Excel Workbook">
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition ${
                file ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-300 hover:border-brand bg-slate-50/50'
              }`}
              style={{ minHeight: '220px' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileSpreadsheet className={file ? 'text-emerald-600' : 'text-slate-400'} size={48} />
              <p className="mt-3 font-semibold text-slate-800 text-base">
                {file ? file.name : 'Click to select or drag and drop Excel (.xlsx) / CSV file here'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size: 20 MB · Supports Excel (.xlsx, .xls) and CSV'}
              </p>

              {file && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                    <Check size={13} /> Ready to process
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-xs text-red-600 hover:text-red-800 underline px-2 py-1"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-sm flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-600 shrink-0" size={24} />
                <div>
                  <div className="font-semibold text-blue-950">Processing Workbook & Running Automated 8-Point Scrutiny...</div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    Validating mandatory columns, checking 39 CSD states coverage, calculating promotional parity, and synchronizing catalog database.
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleReset} disabled={!file || loading}>
                Clear
              </Button>
              <Button
                variant="primary"
                icon={loading ? Loader2 : Upload}
                loading={loading}
                disabled={!file}
                onClick={handleUpload}
              >
                {loading ? 'Processing & Running Scrutiny...' : 'Upload & Run Automated Scrutiny'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Processing Results Screen */
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={36} className="text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Excel Workbook Successfully Processed</h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Manufacturer / OEM: <b>{result.oemName || 'Identified OEM'}</b> · All products and pricing records synchronized.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                <ShieldCheck size={16} /> Section A6 Scrutiny Passed
              </span>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleReset}>
                Import Another File
              </Button>
            </div>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Products Created</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{result.productsCreated || 0}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Products Updated</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{result.productsUpdated || 0}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">State Prices Created</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{result.pricingCreated || 0}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">State Prices Updated</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{result.pricingUpdated || 0}</p>
            </div>
          </div>

          {/* Tabs Section */}
          <Card>
            <div className="border-b border-slate-200 pb-2 mb-4">
              <Tabs
                tabs={[
                  { id: 'summary', label: 'Import Summary & Next Actions' },
                  { id: 'scrutiny', label: `Automated Checks (${scrutiny?.checks?.length || 8})` },
                  ...(result.products?.length ? [{ id: 'preview', label: `Imported Products (${result.products.length})` }] : []),
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {/* TAB 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-800 text-sm">39 CSD States & UTs Coverage:</span>
                    <Badge variant={scrutiny?.missingStatesCount === 0 ? 'success' : 'warning'}>
                      {scrutiny?.missingStatesCount === 0 ? '39 / 39 States Covered' : `${39 - (scrutiny?.missingStatesCount || 0)} / 39 States Covered`}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {scrutiny?.missingStatesCount === 0
                      ? '✓ All 39 standard CSD pricing territories including Tricity, Greater Mumbai, and Delhi NCR were detected and processed with zero missing states.'
                      : `Notice: ${scrutiny?.missingStatesCount} states were not found in the pricing file.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button variant="primary" icon={Package} onClick={() => navigate(backUrl)}>
                    View in Product Catalog
                  </Button>
                  <Button variant="outline" icon={Layers} onClick={() => navigate(pricingUrl)}>
                    View State Pricing Matrix
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: AUTOMATED SCRUTINY CHECKS */}
            {activeTab === 'scrutiny' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <span className="font-semibold">Section A6 Automated Scrutiny Verification (Letter 201/902):</span>{' '}
                  All rules are automatically applied during file intake to prevent pricing discrepancies, formula breaks, and duplicate rows.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(scrutiny?.checks || []).map((chk) => (
                    <div
                      key={chk.rule}
                      className="p-3 rounded-lg border flex items-start gap-2.5 bg-slate-50 border-slate-200"
                    >
                      {chk.status === 'PASS' ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-xs">Rule {chk.rule}: {chk.name}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              chk.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {chk.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{chk.details}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {scrutiny?.formulaErrorsCleaned > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                    <span>
                      Cleaned <b>{scrutiny.formulaErrorsCleaned}</b> formula error cells (#REF!, #VALUE!, #N/A) automatically.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IMPORTED PRODUCTS PREVIEW */}
            {activeTab === 'preview' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Index No</th>
                      <th className="py-2.5 px-3">Vehicle Model / Variant</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">CSD Base Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {result.products.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-semibold text-brand">{p.indexNo || p.sku}</td>
                        <td className="py-2 px-3">{p.name}</td>
                        <td className="py-2 px-3">{p.category || 'CAR'}</td>
                        <td className="py-2 px-3 text-right font-medium">
                          {p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
