import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, ShieldCheck, AlertTriangle, ArrowLeft, Package, Layers, Check, RefreshCw
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { useImportOemProductsExcelMutation } from '../../redux/api/oemApi.js';
import { useDownloadFirstAvailableMutation } from '../../redux/api/fileApi.js';
import { useImportProductsExcelMutation } from '../../redux/api/productApi.js';
import Loader, { LoaderIcon } from '../../components/common/Loader.jsx';

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
  const [downloadFirstAvailable] = useDownloadFirstAvailableMutation();

  const templateUrl = isOem
    ? '/api/v1/oem/products/import-template'
    : '/api/v1/products/import-template';

  const backUrl = isOem ? '/oem/products' : '/csd/products';
  
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

      // Try designated template URL first, fallback to public catalog template URL
      await downloadFirstAvailable({
        urls: [templateUrl, '/api/v1/products/import-template'],
        filename: 'CSD_Product_and_Pricing_Template.xlsx',
      }).unwrap();
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
        title="Product Excel Import"
        subtitle="Sale Price / Base Price + Tax Class · Price to beneficiary is calculated automatically"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={downloading ? LoaderIcon : Download}
              loading={downloading}
              onClick={handleDownloadTemplate}
            >
              Download Sample Template
            </Button>
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(backUrl)}>
              Back to Catalog
            </Button>
          </div>
        }
      />

      {/* Guidelines Card */}
      <Card>
        <div className="flex flex-col bar-row justify-between gap-4 p-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
              <ShieldCheck className="text-emerald-600" size={20} />
              <span>Excel Format</span>
            </div>
            <p className="text-sm text-slate-600 lh-relaxed maxw-3xl">
              Upload one Excel sheet with one row per product. Price rule: the <b>Sale Price</b> is used; if it is empty the <b>Base Price</b> is used.
              GST (CSD) and incidental charges are then added as per the product's <b>Tax Class</b> (TCS 1% above ₹10 Lakh), and that final amount is shown to the beneficiary.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={downloading ? LoaderIcon : Download}
            loading={downloading}
            onClick={handleDownloadTemplate}
            className="flex-shrink-0"
          >
            Download Template (.xlsx)
          </Button>
        </div>

        <div className="mt-4 pt-lg border-t border-slate-100">
          <div className="p-3 bg-info-soft border border-info-soft rounded-lg text-xs space-y-1">
            <div className="font-semibold text-info-strong flex items-center gap-tight">
              <Package size={14} className="text-info" />
              <span>Columns</span>
            </div>
            <p className="text-blue-800">
              <b>Index</b>, <b>Nomenclature</b>, <b>Category</b>, <b>Firm Code</b>, <b>Name of firm</b>, <b>Engine Capacity (in CC)</b>, <b>Fuel Type</b>, <b>HSN Code</b>, <b>Color</b>,
              {' '}<b>Sale Price</b>, <b>Base Price</b>, <b>Tax Class</b> (e.g. Tax Class 15), <b>Description</b>, <b>sku_image</b>, <b>Additional Images</b>, <b>Empanelment Status</b>, <b>Quantity</b>, <b>Dealer Ref Name</b>, <b>Price List Ref</b>.
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
 file ? 'border-ok bg-ok-faint' : 'border-slate-300 hover-border-brand bg-subtle'
 }`}
              style={{ minHeight: '220px' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="is-hidden"
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
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-ok-soft text-emerald-800 text-xs font-semibold pill">
                    <Check size={13} /> Ready to process
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-xs text-red-600 hover-text-bad link-underline px-2 py-1"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-info-strong text-sm flex items-center gap-3">
                <Loader variant="inline" size="md" />
                <div>
                  <div className="font-semibold text-info-strong">Processing workbook...</div>
                  <div className="text-xs text-info mt-hair">
                    Validating columns, applying Tax Class and calculating the price to beneficiary.
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-hair text-red-600" />
                <div className="lh-snug">{error}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleReset} disabled={!file || loading}>
                Clear
              </Button>
              <Button
                variant="primary"
                icon={loading ? LoaderIcon : Upload}
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
          <div className="flex flex-col bar-row-sm justify-between gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={36} className="text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Excel Workbook Successfully Processed</h3>
                <p className="text-xs text-emerald-700 mt-hair">
                  Manufacturer / OEM: <b>{result.oemName || 'Identified OEM'}</b> · All products synchronized.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-tight bg-ok-soft text-emerald-800 text-xs font-bold pill">
                <ShieldCheck size={16} /> Import Complete
              </span>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleReset}>
                Import Another File
              </Button>
            </div>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Products Created</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{result.productsCreated || 0}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Products Updated</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{result.productsUpdated || 0}</p>
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
              <div className="stack-lg">
                {scrutiny?.invalidTaxClasses?.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-warn">
                    <b>{scrutiny.invalidTaxClasses.length}</b> product(s) have a missing / unknown Tax Class, so no tax was added: {scrutiny.invalidTaxClasses.slice(0, 10).map((t) => t.index).join(', ')}
                  </div>
                )}
                {result.errors?.length > 0 && (
                  <ul className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 list-bulleted pl-indent-lg">
                    {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button variant="primary" icon={Package} onClick={() => navigate(backUrl)}>
                    View in Product Catalog
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: AUTOMATED SCRUTINY CHECKS */}
            {activeTab === 'scrutiny' && (
              <div className="space-y-4">
                <div className="p-3 bg-info-soft border border-blue-200 rounded-lg text-xs text-info-strong">
                  <span className="font-semibold">Automated checks:</span>{' '}
                  All rules are automatically applied during file intake to prevent pricing discrepancies, formula breaks, and duplicate rows.
                </div>

                <div className="grid grid-cols-1 cols-md-2 gap-3">
                  {(scrutiny?.checks || []).map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 rounded-lg border flex items-start gap-snug bg-slate-50 border-slate-200"
                    >
                      {chk.status === 'PASSED' ? (
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-hair" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-hair" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-xs">{chk.name}</span>
                          <span
                            className={`text-tiny font-bold px-tight py-hair rounded ${
 chk.status === 'PASSED' ? 'bg-ok-soft text-emerald-800' : 'bg-warn-tint text-warn'
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
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-warn flex items-center gap-2">
                    <AlertTriangle size={16} className="flex-shrink-0 text-amber-600" />
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
                <table className="w-full text-left text-xs table-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-snug px-3">Index No</th>
                      <th className="py-snug px-3">Vehicle Model / Variant</th>
                      <th className="py-snug px-3">Category</th>
                      <th className="py-snug px-3 text-right">Price (Sale / Base)</th>
                      <th className="py-snug px-3 text-right">Price to Beneficiary</th>
                    </tr>
                  </thead>
                  <tbody className="rows-divided text-slate-800">
                    {result.products.map((p, idx) => (
                      <tr key={idx} className="hover-bg-subtle">
                        <td className="py-2 px-3 font-semibold text-brand">{p.indexNo || p.sku}</td>
                        <td className="py-2 px-3">{p.name}</td>
                        <td className="py-2 px-3">{p.category || 'CAR'}</td>
                        <td className="py-2 px-3 text-right font-medium">
                          {p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold">
                          {p.priceToCustomer ? `₹${Number(p.priceToCustomer).toLocaleString('en-IN')}` : '—'}
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
