import React, { useState, useMemo, useRef } from 'react';
import {
  RefreshCw,
  Filter,
  PlusCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Eye,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  Link as LinkIcon,
  Loader2,
  Camera,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import CatalogToolbar from '../../components/common/CatalogToolbar.jsx';
import { ProductCell, PriceCell } from '../../components/common/ProductGrid.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetCategoriesQuery } from '../catalog/productApi.js';
import { useUploadFileMutation } from '../beneficiary/beneficiaryApi.js';
import {
  useGetOemProductsQuery,
  useCreateOemProductMutation,
  useUpdateOemProductMutation,
  useUpdateOemProductStatusMutation,
} from './oemApi.js';

export default function OemProducts() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Modal State for Add & Edit Product
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [formError, setFormError] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    indexNo: '',
    nomenclature: '',
    categoryId: '',
    variant: '',
    price: '',
    basicPrice: '',
    priceToCustomer: '',
    mrp: '',
    taxPercent: '',
    engineCapacity: '',
    fuelType: 'Petrol',
    description: '',
    status: 'DRAFT',
    images: [],
  });

  // Photo Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const fileInputRef = useRef(null);

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (searchTerm) p.q = searchTerm;
    if (categoryFilter) p.categoryId = categoryFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [searchTerm, categoryFilter, statusFilter, page]);

  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOemProductsQuery(queryParams);

  const { data: categories = [] } = useGetCategoriesQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateOemProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateOemProductMutation();
  const [updateProductStatus, { isLoading: isSubmittingStatus }] = useUpdateOemProductStatusMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();

  const products = productsData?.items || [];
  const meta = productsData?.meta || {};

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFiles = async (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;

    if ((formState.images?.length || 0) + files.length > 8) {
      setFormError('You can upload a maximum of 8 photos per model lineup.');
      return;
    }

    setUploadProgressMsg('Uploading photo(s)...');
    setFormError('');

    try {
      const newUrls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not a valid image (Allowed: JPG, PNG, WebP).`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 5MB size limit.`);
        }

        try {
          const formData = new FormData();
          formData.append('files', file);
          const uploadRes = await uploadFile(formData).unwrap();
          const items = Array.isArray(uploadRes)
            ? uploadRes
            : Array.isArray(uploadRes?.data)
            ? uploadRes.data
            : [uploadRes];

          if (items[0]?.url) {
            newUrls.push(items[0].url);
          } else {
            const dataUrl = await readFileAsDataUrl(file);
            newUrls.push(dataUrl);
          }
        } catch (apiErr) {
          console.warn('[handleImageFiles] Server upload failed, using local preview data URL:', apiErr);
          const dataUrl = await readFileAsDataUrl(file);
          newUrls.push(dataUrl);
        }
      }

      setFormState((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls],
      }));
    } catch (err) {
      setFormError(err.message || 'Failed to upload photo.');
    } finally {
      setUploadProgressMsg('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormState((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary) => {
    setFormState((prev) => {
      const current = [...(prev.images || [])];
      const [selected] = current.splice(indexToPrimary, 1);
      return {
        ...prev,
        images: [selected, ...current],
      };
    });
  };

  const handleAddUrlImage = (e) => {
    e?.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) return;
    if ((formState.images?.length || 0) >= 8) {
      setFormError('You can upload a maximum of 8 photos per model.');
      return;
    }
    setFormState((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
    setImageUrlInput('');
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormError('');
    setShowUrlInput(false);
    setImageUrlInput('');
    setFormState({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      indexNo: '',
      nomenclature: '',
      categoryId: categories[0]?._id || '',
      variant: '',
      price: '',
      basicPrice: '',
      priceToCustomer: '',
      mrp: '',
      taxPercent: '',
      engineCapacity: '',
      fuelType: 'Petrol',
      description: '',
      status: 'DRAFT',
      images: [],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormError('');
    setShowUrlInput(false);
    setImageUrlInput('');
    const existingImages = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : (prod.image ? [prod.image] : []);

    setFormState({
      name: prod.name || '',
      sku: prod.sku || '',
      indexNo: prod.indexNo || '',
      nomenclature: prod.nomenclature || '',
      categoryId: prod.categoryId?._id || prod.categoryId || '',
      variant: prod.variant || '',
      price: prod.price || '',
      basicPrice: prod.basicPrice || prod.price || '',
      priceToCustomer: prod.priceToCustomer || prod.price || '',
      mrp: prod.mrp || '',
      taxPercent: prod.taxPercent !== undefined && prod.taxPercent !== null ? String(prod.taxPercent) : '',
      engineCapacity: prod.engineCapacity || '',
      fuelType: prod.fuelType || 'Petrol',
      description: prod.description || '',
      status: prod.status || 'DRAFT',
      images: existingImages,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formState.name.trim() || !formState.sku.trim() || !formState.price) {
      setFormError('Please enter product name, SKU, and basic price.');
      return;
    }

    const payload = {
      name: formState.name.trim(),
      sku: formState.sku.trim(),
      indexNo: formState.indexNo.trim() || undefined,
      nomenclature: formState.nomenclature.trim() || undefined,
      categoryId: formState.categoryId,
      variant: formState.variant.trim() || undefined,
      price: Number(formState.price),
      basicPrice: Number(formState.basicPrice || formState.price),
      priceToCustomer: Number(formState.priceToCustomer || formState.price),
      mrp: formState.mrp ? Number(formState.mrp) : undefined,
      taxPercent: Number(formState.taxPercent || 0),
      engineCapacity: formState.engineCapacity ? Number(formState.engineCapacity) : undefined,
      fuelType: formState.fuelType,
      description: formState.description.trim() || undefined,
      status: formState.status,
      images: formState.images && formState.images.length > 0 ? formState.images : undefined,
      image: formState.images && formState.images.length > 0 ? formState.images[0] : undefined,
    };

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...payload }).unwrap();
        setToastMessage(`Product "${payload.name}" updated successfully.`);
      } else {
        await createProduct(payload).unwrap();
        setToastMessage(`Product "${payload.name}" created under OEM lineup.`);
      }
      setModalOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to save product record.');
    }
  };

  const handleSubmitForApproval = async (product) => {
    try {
      await updateProductStatus({
        id: product._id,
        status: 'PENDING_APPROVAL',
      }).unwrap();
      setToastMessage(`Product "${product.name}" submitted for CSD HO approval.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to submit product for approval.');
    }
  };

  const columns = [
    {
      header: 'Vehicle Model',
      accessor: 'name',
      render: (r) => <ProductCell product={r} />,
    },
    {
      header: 'CSD Index / SKU',
      accessor: 'sku',
      render: (r) => (
        <div>
          <div className="font-mono small font-semibold text-brand">{r.indexNo || r.sku}</div>
          {r.nomenclature && <div className="muted small truncate max-w-xs">{r.nomenclature}</div>}
        </div>
      ),
    },
    {
      header: 'Variant / Fuel',
      accessor: 'variant',
      render: (r) => (
        <span className="small text-slate-700">
          {r.variant || 'Standard'} {r.fuelType ? `· ${r.fuelType}` : ''}
        </span>
      ),
    },
    {
      header: 'CSD Rate',
      accessor: 'price',
      render: (r) => <PriceCell product={r} />,
    },
    {
      header: 'Civilian MRP',
      accessor: 'mrp',
      render: (r) => (
        <span className="small font-mono text-slate-400 line-through">
          {r.mrp ? formatCurrency(r.mrp) : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            icon={Edit3}
            onClick={() => handleOpenEdit(r)}
            title="Edit Specifications"
          >
            Edit
          </Button>
          {r.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              loading={isSubmittingStatus}
              onClick={() => handleSubmitForApproval(r)}
              title="Submit to CSD HO for Rate Contract Approval"
            >
              Submit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="oem-products-page space-y-6">
      <PageHeader
        title="OEM Catalog Lineup & Empaneled Products"
        subtitle="Manage automobile variants, CSD index rates, and rate contract empanelment status"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Product Catalog' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={handleOpenCreate}
            >
              Add New Product
            </Button>
          </div>
        }
      />

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {formError && !modalOpen && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span className="font-medium">{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError('')}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <Card>
        <CatalogToolbar
          search={searchTerm}
          onSearchChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          searchPlaceholder="Search catalog by model name, SKU, or index..."
          category={categoryFilter}
          onCategoryChange={(val) => {
            setCategoryFilter(val);
            setPage(1);
          }}
          categories={categories}
          allLabel="All Categories"
          onRefresh={() => refetch()}
          refreshing={isFetching}
          filterIcon={Filter}
        />

        <div className="flex gap-1 mb-2 px-2">
          {['', 'ACTIVE', 'PUBLISHED', 'PENDING_APPROVAL', 'DRAFT', 'INACTIVE'].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn sm ${statusFilter === st ? 'primary' : 'out'}`}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
            >
              {st || 'All Statuses'}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          pagination={
            meta.totalPages > 1
              ? {
                page: meta.page || page,
                totalPages: meta.totalPages,
                totalItems: meta.total,
                onPageChange: setPage,
                pageSize,
              }
              : null
          }
          emptyTitle="No products in catalog"
          emptyText="No products matched your search or filter criteria."
        />
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Empaneled Model' : 'Register New Vehicle Model'}
        subtitle="All specifications are governed by CSD AFD Rate Contract empanelment guidelines"
        maxWidth="740px"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isCreating || isUpdating}
              onClick={handleSubmit}
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="form-label">Model Name <span className="req-star">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Scorpio N Z2 D MT"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">SKU / Code <span className="req-star">*</span></label>
              <input
                type="text"
                className="form-control font-mono"
                placeholder="e.g. 67681-T"
                value={formState.sku}
                onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="form-label">CSD Index Number</label>
              <input
                type="text"
                className="form-control font-mono"
                placeholder="e.g. 67681"
                value={formState.indexNo}
                onChange={(e) => setFormState({ ...formState, indexNo: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">CSD Category <span className="req-star">*</span></label>
              <select
                className="form-control"
                value={formState.categoryId}
                onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-field">
              <label className="form-label">Variant / Trim</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Z2 Diesel MT"
                value={formState.variant}
                onChange={(e) => setFormState({ ...formState, variant: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Engine Capacity (cc)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 2184"
                value={formState.engineCapacity}
                onChange={(e) => setFormState({ ...formState, engineCapacity: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Fuel Type</label>
              <select
                className="form-control"
                value={formState.fuelType}
                onChange={(e) => setFormState({ ...formState, fuelType: e.target.value })}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric (EV)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-field">
              <label className="form-label">CSD Basic Rate (₹) <span className="req-star">*</span></label>
              <input
                type="number"
                className="form-control font-mono"
                placeholder="e.g. 1009091"
                value={formState.price}
                onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Civilian MRP (₹)</label>
              <input
                type="number"
                className="form-control font-mono"
                placeholder="e.g. 1362000"
                value={formState.mrp}
                onChange={(e) => setFormState({ ...formState, mrp: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">GST / Tax Class (%)</label>
              <input
                type="number"
                className="form-control font-mono"
                placeholder="28"
                value={formState.taxPercent}
                onChange={(e) => setFormState({ ...formState, taxPercent: e.target.value })}
              />
            </div>
          </div>

          {/* VEHICLE / MODEL PHOTOGRAPHS & IMAGERY SECTION */}
          <div className="oem-photo-section">
            <div className="oem-photo-header">
              <div className="oem-photo-title-wrap">
                <div className="oem-photo-title">
                  <Camera size={16} />
                  <span>Model Photographs & Imagery</span>
                  <span className="oem-photo-count-pill">
                    ({formState.images?.length || 0}/8 uploaded)
                  </span>
                </div>
                <p className="oem-photo-subtitle">
                  Upload exterior, interior, or angle views. The first image will be the primary catalog display thumbnail.
                </p>
              </div>
              <button
                type="button"
                className="oem-photo-toggle-btn"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <LinkIcon size={13} />
                <span>{showUrlInput ? 'Upload Files' : 'Add via Image URL'}</span>
              </button>
            </div>

            {/* Direct Image URL input bar (collapsible) */}
            {showUrlInput && (
              <div className="oem-photo-url-bar">
                <input
                  type="url"
                  className="oem-photo-url-input"
                  placeholder="Paste direct image URL (https://... or /assets/...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrlImage();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleAddUrlImage}
                  disabled={!imageUrlInput.trim()}
                >
                  Add Image
                </Button>
              </div>
            )}

            {/* Dropzone Upload Box */}
            <div
              className={`oem-photo-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleImageFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleImageFiles(e.target.files)}
              />
              {isUploadingFile || uploadProgressMsg ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary, #1e4fd8)', fontSize: '0.88rem', fontWeight: 600 }}>
                  <Loader2 size={20} className="spinner" />
                  <span>{uploadProgressMsg || 'Uploading photo...'}</span>
                </div>
              ) : (
                <>
                  <div className="oem-photo-icon-circle">
                    <Upload size={20} />
                  </div>
                  <p className="oem-photo-prompt-text">
                    <strong>Click to browse</strong> or drag and drop photos here
                  </p>
                  <p className="oem-photo-hint-text">
                    Supports JPG, PNG, WEBP up to 5MB each (Max 8 photos)
                  </p>
                </>
              )}
            </div>

            {/* Uploaded Images Preview Grid */}
            {formState.images && formState.images.length > 0 && (
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-slate-600, #475569)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Uploaded Gallery Photos ({formState.images.length}):
                </div>
                <div className="oem-photo-grid">
                  {formState.images.map((imgUrl, idx) => (
                    <div key={idx} className="oem-photo-card">
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="oem-photo-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/maruti1.png';
                        }}
                      />

                      {/* Primary Cover Badge */}
                      {idx === 0 ? (
                        <div className="oem-photo-cover-badge">
                          <Star size={10} fill="currentColor" /> Cover
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimaryImage(idx);
                          }}
                          className="oem-photo-make-cover-btn"
                          title="Set as Primary Cover Photo"
                        >
                          <Star size={10} /> Make Cover
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="oem-photo-delete-btn"
                        title="Remove photo"
                        aria-label={`Remove photo ${idx + 1}`}
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Photo Index Number */}
                      <div className="oem-photo-index-tag">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="form-label">Nomenclature / Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Official CSD nomenclature or manufacturer notes..."
              value={formState.nomenclature}
              onChange={(e) => setFormState({ ...formState, nomenclature: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Initial Status</label>
            <select
              className="form-control"
              value={formState.status}
              onChange={(e) => setFormState({ ...formState, status: e.target.value })}
            >
              <option value="DRAFT">DRAFT (Draft Lineup)</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL (Submit for CSD Review)</option>
              {editingProduct && <option value="INACTIVE">INACTIVE</option>}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
