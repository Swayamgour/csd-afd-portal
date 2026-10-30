import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Package,
  IndianRupee,
  Layers,
  Building2,
  CheckCircle2,
  AlertCircle,
  Upload,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  Plus,
  Loader2,
  Link as LinkIcon,
  Palette,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadFilesMutation,
} from './productApi.js';
import {
  useGetOemProductsQuery,
  useCreateOemProductMutation,
  useUpdateOemProductMutation,
} from '../oem/oemApi.js';
import { useGetOemsQuery } from '../org/orgApi.js';
import { categoryKind, fieldsFor, KIND_LABEL, COMMON_COLORS } from './categoryFields.js';

// colours saved as objects ({name, hex, price}); old products may only have a comma separated string / string array
function colorsFromProduct(product) {
  if (Array.isArray(product.colors) && product.colors.length) {
    return product.colors.map((c) => (typeof c === 'string' ? { name: c, hex: '#cccccc', price: '' } : { name: c.name || '', hex: c.hex || '#cccccc', price: c.price ?? '' }));
  }
  const legacy = product.attributes?.colors;
  if (legacy) return String(legacy).split(',').map((n) => n.trim()).filter(Boolean).map((name) => ({ name, hex: '#cccccc', price: '' }));
  return [];
}

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const isOem = location.pathname.startsWith('/oem');
  const backUrl = isOem ? '/oem/products' : '/csd/products';

  // API hooks
  const { data: rawProduct, isLoading: isLoadingProduct } = useGetProductByIdQuery(id, { skip: !isEdit });
  const { data: csdProductsData } = useGetProductsQuery({ limit: 100 }, { skip: !isEdit || Boolean(rawProduct) });
  const { data: oemProductsData } = useGetOemProductsQuery({ limit: 100 }, { skip: !isEdit || Boolean(rawProduct) || !isOem });

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: oems = [] } = useGetOemsQuery();

  const [createCsdProduct, { isLoading: isCreatingCsd }] = useCreateProductMutation();
  const [updateCsdProduct, { isLoading: isUpdatingCsd }] = useUpdateProductMutation();
  const [createOemProduct, { isLoading: isCreatingOem }] = useCreateOemProductMutation();
  const [updateOemProduct, { isLoading: isUpdatingOem }] = useUpdateOemProductMutation();
  const [uploadFiles, { isLoading: isUploadingFiles }] = useUploadFilesMutation();

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const product = React.useMemo(() => {
    if (!isEdit) return null;
    if (rawProduct?.data) return rawProduct.data;
    if (rawProduct?._id || rawProduct?.id) return rawProduct;
    const csdList = Array.isArray(csdProductsData?.items) ? csdProductsData.items : (Array.isArray(csdProductsData) ? csdProductsData : []);
    const oemList = Array.isArray(oemProductsData?.items) ? oemProductsData.items : (Array.isArray(oemProductsData) ? oemProductsData : []);
    return [...csdList, ...oemList].find((p) => String(p._id || p.id) === String(id)) || null;
  }, [isEdit, rawProduct, csdProductsData, oemProductsData, id]);

  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    indexNo: '',
    categoryId: '',
    oemId: '',
    variant: '',
    afdType: 'AFD_I',
    price: '',
    mrp: '',
    basicPrice: '',
    taxPercent: '28',
    engineCapacity: '',
    fuelType: 'Petrol',
    imageUrl: '',
    images: [],
    status: 'ACTIVE',
    description: '',
    specs: {}, // category specific fields (stored in product.attributes)
    colors: [], // [{ name, hex, price }]
    colorPricing: 'SAME', // SAME | PER_COLOR
  });

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (product) {
      const prodImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images.filter(Boolean)
        : (product.imageUrl ? [product.imageUrl] : []);

      setFormState({
        name: product.name || '',
        sku: product.sku || product.indexNo || '',
        indexNo: product.indexNo || product.sku || '',
        categoryId: product.categoryId?._id || product.categoryId || (categories[0]?._id || ''),
        oemId: product.oemId?._id || product.oemId || (oems[0]?._id || ''),
        variant: product.variant || '',
        afdType: product.afdType || 'AFD_I',
        price: product.price || product.priceToCustomer || '',
        mrp: product.mrp || '',
        basicPrice: product.basicPrice || '',
        taxPercent: product.taxPercent || '28',
        engineCapacity: product.engineCapacity || '',
        fuelType: product.fuelType || 'Petrol',
        imageUrl: prodImages[0] || product.imageUrl || '',
        images: prodImages,
        status: product.status || 'ACTIVE',
        description: product.description || '',
        specs: { ...(product.attributes || {}) },
        colors: colorsFromProduct(product),
        colorPricing: product.colorPricing || 'SAME',
      });
    } else if (!isEdit && categories.length > 0) {
      setFormState((prev) => ({
        ...prev,
        categoryId: prev.categoryId || categories[0]?._id || categories[0]?.code || '',
        oemId: prev.oemId || oems[0]?._id || oems[0]?.code || '',
      }));
    }
  }, [product, isEdit, categories, oems]);

  const selectedCategory = categories.find((c) => String(c._id || c.code) === String(formState.categoryId));
  const kind = categoryKind(selectedCategory);
  const specFields = fieldsFor(kind, formState.specs?.applianceType);

  const getField = (f) => (f.top ? formState[f.key] ?? '' : formState.specs?.[f.key] ?? '');
  const setField = (f, value) =>
    setFormState((prev) => (f.top ? { ...prev, [f.key]: value } : { ...prev, specs: { ...prev.specs, [f.key]: value } }));

  const handleCategoryChange = (categoryId) => {
    const cat = categories.find((c) => String(c._id || c.code) === String(categoryId));
    const k = categoryKind(cat);
    setFormState((prev) => ({
      ...prev,
      categoryId,
      afdType: k === 'appliance' ? 'AFD_II' : 'AFD_I',
      fuelType: k === 'appliance' ? '' : prev.fuelType || 'Petrol',
    }));
  };

  // ---- colours ----
  const addColor = (name = '', hex = '#cccccc') =>
    setFormState((prev) => {
      if (name && prev.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return prev;
      return { ...prev, colors: [...prev.colors, { name, hex, price: '' }] };
    });
  const updateColor = (i, patch) =>
    setFormState((prev) => ({ ...prev, colors: prev.colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) }));
  const removeColor = (i) => setFormState((prev) => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }));

  const handleFilesSelected = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const validFiles = [];
    const errs = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errs.push(`"${file.name}" is not a valid image file.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        errs.push(`"${file.name}" exceeds 10MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (errs.length > 0) {
      setUploadError(errs.join(' '));
      setTimeout(() => setUploadError(''), 6000);
    }

    if (validFiles.length === 0) return;

    try {
      setUploadError('');
      const fd = new FormData();
      validFiles.forEach((f) => fd.append('files', f));

      const res = await uploadFiles(fd).unwrap();
      const uploadedItems = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const newUrls = uploadedItems.map((item) => item.url).filter(Boolean);

      if (newUrls.length > 0) {
        setFormState((prev) => {
          const existing = prev.images || [];
          const updated = [...existing, ...newUrls];
          return {
            ...prev,
            images: updated,
            imageUrl: updated[0] || prev.imageUrl || '',
          };
        });
        setUploadSuccess(`Uploaded ${newUrls.length} image(s) successfully!`);
        setTimeout(() => setUploadSuccess(''), 4000);
      }
    } catch (err) {
      setUploadError(err?.data?.message || err?.message || 'Failed to upload images');
      setTimeout(() => setUploadError(''), 6000);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e) => {
    if (e) e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/api/v1/files/')) {
      setUploadError('Please enter a valid HTTP/HTTPS image URL');
      setTimeout(() => setUploadError(''), 4000);
      return;
    }
    setFormState((prev) => {
      const existing = prev.images || [];
      if (existing.includes(url)) {
        setUploadError('This image URL is already in the gallery');
        setTimeout(() => setUploadError(''), 3000);
        return prev;
      }
      const updated = [...existing, url];
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || prev.imageUrl || '',
      };
    });
    setUrlInput('');
    setUploadSuccess('Image URL added to gallery!');
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormState((prev) => {
      const updated = (prev.images || []).filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || '',
      };
    });
  };

  const handleSetCover = (indexToCover) => {
    setFormState((prev) => {
      const list = [...(prev.images || [])];
      const [chosen] = list.splice(indexToCover, 1);
      const updated = [chosen, ...list];
      return {
        ...prev,
        images: updated,
        imageUrl: chosen,
      };
    });
  };

  const handleMoveImage = (index, direction) => {
    setFormState((prev) => {
      const list = [...(prev.images || [])];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[newIndex];
      list[newIndex] = temp;
      return {
        ...prev,
        images: list,
        imageUrl: list[0] || '',
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formState.name.trim()) newErrors.name = 'Product name is required';
    if (!formState.sku.trim()) newErrors.sku = 'SKU / Index Number is required';
    if (!formState.price) newErrors.price = 'CSD Concessional Price is required';
    const namedColors = formState.colors.filter((c) => c.name.trim());
    if (formState.colorPricing === 'PER_COLOR') {
      if (!namedColors.length) newErrors.colors = 'Add at least one colour, or choose "Same price for all colours".';
      else if (namedColors.some((c) => c.price === '' || Number(c.price) <= 0)) newErrors.colors = 'Every colour needs its own price.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const validImages = (formState.images || []).map((img) => String(img).trim()).filter(Boolean);
      const primaryImage = validImages[0] || formState.imageUrl.trim() || '';
      const allImages = validImages.length > 0 ? validImages : (primaryImage ? [primaryImage] : []);

      const payload = {
        name: formState.name.trim(),
        sku: formState.sku.trim(),
        indexNo: formState.sku.trim(),
        categoryId: formState.categoryId,
        // OEM login: server uses the logged-in OEM, sending another oemId triggers OEM_SCOPE_VIOLATION
        ...(isOem ? {} : { oemId: formState.oemId }),
        // only the fields of the selected category are saved
        ...(() => {
          const attributes = {};
          const top = {};
          specFields.forEach((f) => {
            const v = getField(f);
            if (v === '' || v === undefined || v === null) return;
            if (f.top) top[f.key] = f.type === 'number' ? Number(v) : String(v).trim();
            else attributes[f.key] = f.type === 'number' ? Number(v) : String(v).trim();
          });
          return { attributes, variant: top.variant || '', engineCapacity: top.engineCapacity, fuelType: top.fuelType };
        })(),
        colorPricing: formState.colorPricing,
        colors: formState.colors
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            hex: c.hex || undefined,
            ...(formState.colorPricing === 'PER_COLOR' && c.price !== '' ? { price: Number(c.price) } : {}),
          })),
        afdType: formState.afdType,
        price: Number(formState.price),
        priceToCustomer: Number(formState.price),
        mrp: formState.mrp ? Number(formState.mrp) : undefined,
        basicPrice: formState.basicPrice ? Number(formState.basicPrice) : undefined,
        taxPercent: Number(formState.taxPercent),
        imageUrl: primaryImage,
        images: allImages,
        status: formState.status,
        description: formState.description.trim(),
      };

      if (isOem) {
        if (isEdit) {
          await updateOemProduct({ id, ...payload }).unwrap();
        } else {
          await createOemProduct(payload).unwrap();
        }
      } else {
        if (isEdit) {
          await updateCsdProduct({ id, ...payload }).unwrap();
        } else {
          await createCsdProduct(payload).unwrap();
        }
      }

      navigate(backUrl);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to save product');
    }
  };

  const isSaving = isCreatingCsd || isUpdatingCsd || isCreatingOem || isUpdatingOem;

  if (isEdit && isLoadingProduct) {
    return <LoadingState text="Loading product data..." />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title={isEdit ? `Edit Product: ${formState.name || 'Catalogue Item'}` : 'Catalogue New AFD Item'}
        subtitle="Manage product specifications, CSD concessional rates, civil MRP, and inventory mapping"
        breadcrumbs={[
          { label: isOem ? 'OEM Portal' : 'CSD-HO Directorate', href: backUrl },
          { label: 'Products Catalogue', href: backUrl },
          { label: isEdit ? 'Edit Product' : 'New Product' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title row align-center gap-1">
              <Package size={18} />
              1. Product Identification & Categorization
            </h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Product Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra Scorpio N Z2 D MT 2WD 7 STR"
                  className="form-control"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Index No. / SKU Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 67681-T"
                  className="form-control font-mono"
                  value={formState.sku}
                  onChange={(e) => setFormState({ ...formState, sku: e.target.value, indexNo: e.target.value })}
                />
                {errors.sku && <span className="form-error">{errors.sku}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Product Category *</label>
                <select
                  className="form-select"
                  value={formState.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c._id || c.code} value={c._id || c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {!isOem && (
                <div className="form-group">
                  <label className="form-label">OEM / Manufacturer *</label>
                  <select
                    className="form-select"
                    value={formState.oemId}
                    onChange={(e) => setFormState({ ...formState, oemId: e.target.value })}
                  >
                    {oems.map((o) => (
                      <option key={o._id || o.code} value={o._id || o.code}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">AFD Classification</label>
                <select
                  className="form-select"
                  value={formState.afdType}
                  onChange={(e) => setFormState({ ...formState, afdType: e.target.value })}
                >
                  <option value="AFD_I">AFD-I (Four-Wheelers, Two-Wheelers, Major Consumer Durables)</option>
                  <option value="AFD_II">AFD-II (White Goods, Electronics & Appliances)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Catalogue Status</label>
                <select
                  className="form-select"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE (Available for Indenting)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from Storefront)</option>
                  <option value="DRAFT">DRAFT (Under Review)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title row align-center gap-1">
              <IndianRupee size={18} />
              2. Concessional Pricing & Taxation
            </h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">CSD Concessional Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="e.g. 1216296"
                  className="form-control font-mono"
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                />
                {errors.price && <span className="form-error">{errors.price}</span>}
                <span className="muted fs-xs">Final beneficiary payable amount through CSD</span>
              </div>

              <div className="form-group">
                <label className="form-label">Civil Market MRP (₹)</label>
                <input
                  type="number"
                  min="100"
                  placeholder="e.g. 1420000"
                  className="form-control font-mono"
                  value={formState.mrp}
                  onChange={(e) => setFormState({ ...formState, mrp: e.target.value })}
                />
                <span className="muted fs-xs">Standard civil dealership retail price</span>
              </div>

              <div className="form-group">
                <label className="form-label">Basic / Ex-Factory Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 980000"
                  className="form-control font-mono"
                  value={formState.basicPrice}
                  onChange={(e) => setFormState({ ...formState, basicPrice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Applicable Tax / GST Percent (%)</label>
                <input
                  type="number"
                  placeholder="28"
                  className="form-control font-mono"
                  value={formState.taxPercent}
                  onChange={(e) => setFormState({ ...formState, taxPercent: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs Card - fields change with the selected category */}
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title row align-center gap-1">
              <Layers size={18} />
              3. {KIND_LABEL[kind]} Specifications
            </h3>
            <p className="muted fs-xs" style={{ margin: 0 }}>
              Fields below change with the Product Category selected above.
            </p>
          </div>
          <div className="card-body">
            <div className="form-grid">
              {specFields.map((f) => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="form-select" value={getField(f)} onChange={(e) => setField(f, e.target.value)}>
                      <option value="">-- Select --</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      className="form-control"
                      value={getField(f)}
                      onChange={(e) => setField(f, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Primary Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="form-control font-mono"
                  value={formState.imageUrl}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setFormState((prev) => {
                      const updatedImages = [...prev.images];
                      if (updatedImages.length > 0) {
                        updatedImages[0] = newUrl;
                      } else if (newUrl.trim()) {
                        updatedImages.push(newUrl.trim());
                      }
                      return {
                        ...prev,
                        imageUrl: newUrl,
                        images: updatedImages,
                      };
                    });
                  }}
                />
                <span className="muted fs-xs">Automatically synchronizes with the first gallery image below</span>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Product Description & Features</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Key specifications, warranty coverage, accessories included..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colour variants - every category */}
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title row align-center gap-1">
              <Palette size={18} />
              Colour Variants
            </h3>
            <p className="muted fs-xs" style={{ margin: 0 }}>
              Car, bike aur home appliance - sab me colours add kar sakte hain.
            </p>
          </div>
          <div className="card-body">
            <div className="row gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              {[
                ['SAME', 'Same price for all colours', `Product price (₹${formState.price || '—'}) har colour par lagega`],
                ['PER_COLOR', 'Different price per colour', 'Har colour ka apna price set karo'],
              ].map(([val, title, hint]) => (
                <label
                  key={val}
                  className="row gap-1"
                  style={{
                    cursor: 'pointer',
                    padding: '10px 14px',
                    border: `1px solid ${formState.colorPricing === val ? 'var(--color-primary, #1e4fd8)' : '#d0d5dd'}`,
                    borderRadius: 8,
                    flex: '1 1 260px',
                    background: formState.colorPricing === val ? 'var(--color-primary-soft, #eff6ff)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="colorPricing"
                    checked={formState.colorPricing === val}
                    onChange={() => setFormState({ ...formState, colorPricing: val })}
                  />
                  <span>
                    <strong>{title}</strong>
                    <br />
                    <span className="muted fs-xs">{hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="row gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
              <span className="muted fs-xs">Quick add:</span>
              {COMMON_COLORS.map(([name, hex]) => (
                <button
                  type="button"
                  key={name}
                  className="oem-photo-toggle-btn"
                  onClick={() => addColor(name, hex)}
                  disabled={formState.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())}
                >
                  <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 6, background: hex, border: '1px solid #bbb', marginRight: 6 }} />
                  {name}
                </button>
              ))}
              <button type="button" className="oem-photo-toggle-btn" onClick={() => addColor()}>
                <Plus size={14} /> Custom colour
              </button>
            </div>

            {formState.colors.length === 0 && <p className="muted fs-xs">Abhi koi colour add nahi hua (optional).</p>}
            {formState.colors.map((c, i) => (
              <div key={i} className="row gap-2 mb-1 align-center" style={{ flexWrap: 'wrap' }}>
                <input
                  type="color"
                  value={c.hex || '#cccccc'}
                  onChange={(e) => updateColor(i, { hex: e.target.value })}
                  style={{ width: 40, height: 36, padding: 0, border: '1px solid #d0d5dd', borderRadius: 6 }}
                  aria-label="Colour"
                />
                <input
                  className="form-control"
                  style={{ flex: '1 1 180px' }}
                  placeholder="Colour name e.g. Pearl White"
                  value={c.name}
                  onChange={(e) => updateColor(i, { name: e.target.value })}
                />
                {formState.colorPricing === 'PER_COLOR' && (
                  <input
                    type="number"
                    min="0"
                    className="form-control font-mono"
                    style={{ flex: '0 1 180px' }}
                    placeholder="Price (₹)"
                    value={c.price}
                    onChange={(e) => updateColor(i, { price: e.target.value })}
                  />
                )}
                <button type="button" className="oem-photo-toggle-btn" onClick={() => removeColor(i)} aria-label="Remove colour">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {errors.colors && <span className="form-error">{errors.colors}</span>}
            {formState.colorPricing === 'PER_COLOR' && (
              <p className="muted fs-xs mt-1">
                Colour price = us colour ka national price. State-wise price set ho to state price par (colour price − product price) ka fark jud jaata hai.
              </p>
            )}
          </div>
        </div>

        {/* 4. Multiple Images & Media Gallery Card */}
        <div className="card mb-2">
          <div className="card-header row between align-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="oem-photo-title-wrap">
              <h3 className="card-title row align-center gap-1" style={{ margin: 0 }}>
                <ImageIcon size={18} />
                4. Product Images & Gallery
                <span className="oem-photo-count-pill">
                  {formState.images?.length || 0} {formState.images?.length === 1 ? 'Image' : 'Images'}
                </span>
              </h3>
              <p className="oem-photo-subtitle" style={{ margin: 0 }}>
                Upload multiple high-resolution photos. The first image serves as the primary catalogue cover.
              </p>
            </div>
            <div className="row gap-1 align-center">
              <button
                type="button"
                className="oem-photo-toggle-btn"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <LinkIcon size={14} />
                {showUrlInput ? 'Hide URL Bar' : 'Add by URL'}
              </button>
              <button
                type="button"
                className="oem-photo-toggle-btn"
                style={{
                  background: 'var(--color-primary-soft, #eff6ff)',
                  borderColor: 'var(--color-primary, #1e4fd8)',
                  color: 'var(--color-primary, #1e4fd8)',
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFiles}
              >
                {isUploadingFiles ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Browse & Upload
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Hidden multi-file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilesSelected(e.target.files);
                  e.target.value = '';
                }
              }}
            />

            {/* Error & Success Messages */}
            {uploadError && (
              <div className="alert alert-danger mb-2 row align-center gap-1" style={{ padding: '0.5rem 0.75rem' }}>
                <AlertCircle size={16} className="text-danger" />
                <span className="fs-sm">{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="alert alert-success mb-2 row align-center gap-1" style={{ padding: '0.5rem 0.75rem' }}>
                <CheckCircle2 size={16} className="text-success" />
                <span className="fs-sm">{uploadSuccess}</span>
              </div>
            )}

            {/* Optional URL bar */}
            {showUrlInput && (
              <div className="oem-photo-url-bar">
                <LinkIcon size={16} className="text-muted" />
                <input
                  type="url"
                  className="oem-photo-url-input"
                  placeholder="Paste external image URL (e.g. https://... or /api/v1/files/...) and press Add"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={handleAddUrl}>
                  <Plus size={14} /> Add Image
                </Button>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              className={`oem-photo-dropzone ${isDragging ? 'dragging' : ''}`}
              onClick={() => !isUploadingFiles && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="oem-photo-icon-circle">
                {isUploadingFiles ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <UploadCloud size={24} />
                )}
              </div>
              {isUploadingFiles ? (
                <p className="oem-photo-prompt-text">
                  <strong>Uploading image files to server...</strong> Please wait.
                </p>
              ) : (
                <>
                  <p className="oem-photo-prompt-text">
                    Drag & drop multiple product photos here, or <strong>Click to Browse</strong>
                  </p>
                  <p className="oem-photo-hint-text">
                    Supported formats: JPG, PNG, WEBP, GIF (Max 10MB per file). Select multiple files at once.
                  </p>
                </>
              )}
            </div>

            {/* Gallery Grid */}
            {formState.images && formState.images.length > 0 ? (
              <div className="mt-3">
                <div className="row between align-center mb-1" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="fs-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Uploaded Gallery ({formState.images.length} images) — First image is Primary Cover
                  </span>
                  <span className="fs-xs text-muted">
                    Hover on image to set Cover, reorder, or delete
                  </span>
                </div>

                <div className="oem-photo-grid">
                  {formState.images.map((imgUrl, index) => (
                    <div key={`${imgUrl}-${index}`} className="oem-photo-card">
                      <img
                        src={imgUrl}
                        alt={`Product thumbnail ${index + 1}`}
                        className="oem-photo-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="120" height="80" fill="%23f1f5f9"/><text x="60" y="44" font-size="11" fill="%2394a3b8" text-anchor="middle">Image Preview</text></svg>';
                        }}
                      />

                      {index === 0 ? (
                        <span className="oem-photo-cover-badge">
                          <Star size={11} fill="currentColor" /> Primary Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="oem-photo-make-cover-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetCover(index);
                          }}
                          title="Set as primary cover image"
                        >
                          <Star size={11} /> Make Cover
                        </button>
                      )}

                      {/* Reorder Buttons */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '6px',
                          display: 'flex',
                          gap: '3px',
                          zIndex: 2,
                        }}
                      >
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveImage(index, -1);
                            }}
                            title="Move photo left"
                            style={{
                              background: 'rgba(15, 23, 42, 0.75)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '2px 5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {index < formState.images.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveImage(index, 1);
                            }}
                            title="Move photo right"
                            style={{
                              background: 'rgba(15, 23, 42, 0.75)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '2px 5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <ArrowLeft size={10} style={{ transform: 'rotate(180deg)' }} />
                          </button>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        className="oem-photo-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        title="Remove image from product"
                      >
                        <Trash2 size={12} />
                      </button>

                      <span className="oem-photo-index-tag">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 muted fs-xs" style={{ marginTop: '0.5rem' }}>
                No product images uploaded yet. Upload at least 1 image for the product storefront.
              </div>
            )}
          </div>

          <div className="card-footer">
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(backUrl)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSaving}
              >
                {isEdit ? 'Save Changes' : 'Catalogue Product'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProductFormPage;
