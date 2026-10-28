import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon
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
} from './productApi.js';
import {
  useGetOemProductsQuery,
  useCreateOemProductMutation,
  useUpdateOemProductMutation,
} from '../oem/oemApi.js';
import { useGetOemsQuery } from '../org/orgApi.js';

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
    status: 'ACTIVE',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (product) {
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
        imageUrl: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (product.imageUrl || ''),
        status: product.status || 'ACTIVE',
        description: product.description || '',
      });
    } else if (!isEdit && categories.length > 0) {
      setFormState((prev) => ({
        ...prev,
        categoryId: prev.categoryId || categories[0]?._id || categories[0]?.code || '',
        oemId: prev.oemId || oems[0]?._id || oems[0]?.code || '',
      }));
    }
  }, [product, isEdit, categories, oems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formState.name.trim()) newErrors.name = 'Product name is required';
    if (!formState.sku.trim()) newErrors.sku = 'SKU / Index Number is required';
    if (!formState.price) newErrors.price = 'CSD Concessional Price is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formState.name.trim(),
        sku: formState.sku.trim(),
        indexNo: formState.sku.trim(),
        categoryId: formState.categoryId,
        oemId: formState.oemId,
        variant: formState.variant.trim(),
        afdType: formState.afdType,
        price: Number(formState.price),
        priceToCustomer: Number(formState.price),
        mrp: formState.mrp ? Number(formState.mrp) : undefined,
        basicPrice: formState.basicPrice ? Number(formState.basicPrice) : undefined,
        taxPercent: Number(formState.taxPercent),
        engineCapacity: formState.engineCapacity ? Number(formState.engineCapacity) : undefined,
        fuelType: formState.fuelType,
        imageUrl: formState.imageUrl.trim(),
        images: formState.imageUrl.trim() ? [formState.imageUrl.trim()] : [],
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
        // actions={
         
        // }
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
                  onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
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

        {/* Technical Specs Card */}
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title row align-center gap-1">
              <Layers size={18} />
              3. Technical Specifications & Media
            </h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Engine Capacity (cc)</label>
                <input
                  type="number"
                  placeholder="e.g. 2198"
                  className="form-control font-mono"
                  value={formState.engineCapacity}
                  onChange={(e) => setFormState({ ...formState, engineCapacity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  className="form-select"
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

              <div className="form-group">
                <label className="form-label">Variant / Body Style</label>
                <input
                  type="text"
                  placeholder="e.g. Z2 MT / Compact SUV / 7-Seater"
                  className="form-control"
                  value={formState.variant}
                  onChange={(e) => setFormState({ ...formState, variant: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="form-control font-mono"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                />
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
