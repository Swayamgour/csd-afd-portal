import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Filter,
  PlusCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Car,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import CatalogToolbar from '../../components/common/CatalogToolbar.jsx';
import { ProductCell, CategoryBadge, PriceCell } from '../../components/common/ProductGrid.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation
} from '../catalog/productApi.js';
import { useGetOemsQuery } from '../org/orgApi.js';

export default function OemProducts() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State for Add & Edit Product
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [formError, setFormError] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    categoryId: '',
    variant: '',
    price: '',
    mrp: '',
    engineCapacity: '',
    fuelType: 'Diesel',
    colors: 'Everest White, Napoli Black, Dazzling Silver',
    imageUrl: '',
    description: '',
    status: 'ACTIVE',
  });

  const queryParams = useMemo(() => {
    const p = { limit: 100, status: 'ACTIVE' };
    if (searchTerm) p.q = searchTerm;
    if (categoryFilter) p.categoryId = categoryFilter;
    return p;
  }, [searchTerm, categoryFilter]);

  const { data: productsData, isLoading, isFetching, refetch } = useGetProductsQuery(queryParams);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: oems = [] } = useGetOemsQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const myOem = useMemo(() => {
    if (user?.oemId) {
      const match = oems.find((o) => String(o._id || o.id) === String(user.oemId));
      if (match) return match;
    }
    return oems.find((o) => o.active !== false) || oems[0] || null;
  }, [user, oems]);

  const products = useMemo(() => {
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.data?.items)) return productsData.data.items;
    if (Array.isArray(productsData?.data)) return productsData.data;
    if (Array.isArray(productsData)) return productsData;
    return [];
  }, [productsData]);

  // Handle Opening Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormError('');
    setFormState({
      name: '',
      sku: `CSD-${Math.floor(10000 + Math.random() * 90000)}`,
      categoryId: categories[0]?._id || categories[0]?.code || '',
      variant: '',
      price: '',
      mrp: '',
      engineCapacity: '',
      fuelType: 'Diesel',
      colors: 'Everest White, Napoli Black, Dazzling Silver',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
      description: 'Official manufacturer specification compliant with CSD rate contract ceiling.',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  // Handle Opening Edit Modal
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormError('');
    const rawColors = p.attributes?.colors || p.colors;
    const colorStr = Array.isArray(rawColors) ? rawColors.join(', ') : rawColors || '';

    setFormState({
      name: p.name || '',
      sku: p.sku || p.indexNo || '',
      categoryId: p.categoryId?._id || p.categoryId || (categories[0]?._id || ''),
      variant: p.variant || p.type || '',
      price: p.priceToCustomer || p.price || '',
      mrp: p.mrp || '',
      engineCapacity: p.engineCapacity || p.attributes?.engine?.replace(/[^\d]/g, '') || '',
      fuelType: p.fuelType || p.attributes?.fuel || 'Diesel',
      colors: colorStr || 'Everest White, Napoli Black, Dazzling Silver',
      imageUrl: p.images?.[0] || p.image || '',
      description: p.description || p.attributes?.description || '',
      status: p.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formState.name.trim()) {
      setFormError('Please enter product model name.');
      return;
    }
    if (!formState.sku.trim()) {
      setFormError('Please enter index or SKU number.');
      return;
    }
    if (!formState.categoryId) {
      setFormError('Please select a valid product category.');
      return;
    }
    if (!formState.price || Number(formState.price) <= 0) {
      setFormError('Please specify valid CSD Concessional Rate.');
      return;
    }

    const oemId = user?.oemId || myOem?._id || myOem?.id;

    const payload = {
      name: formState.name.trim(),
      sku: formState.sku.trim(),
      indexNo: formState.sku.trim(),
      categoryId: formState.categoryId,
      variant: formState.variant.trim(),
      engineCapacity: formState.engineCapacity ? Number(formState.engineCapacity) : undefined,
      fuelType: formState.fuelType,
      price: Number(formState.price),
      priceToCustomer: Number(formState.price),
      basicPrice: Number(formState.price),
      mrp: formState.mrp ? Number(formState.mrp) : Math.round(Number(formState.price) * 1.15),
      afdType: 'AFD_I',
      status: formState.status || 'ACTIVE',
      images: formState.imageUrl?.trim()
        ? [formState.imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop'],
      attributes: {
        engine: formState.engineCapacity ? `${formState.engineCapacity} cc` : undefined,
        fuel: formState.fuelType,
        colors: formState.colors
          ? formState.colors.split(',').map((c) => c.trim()).filter(Boolean)
          : ['Everest White', 'Napoli Black'],
        description: formState.description?.trim(),
      },
    };

    if (oemId) {
      payload.oemId = String(oemId);
    }

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id || editingProduct.id, ...payload }).unwrap();
        setToastMessage(`Product "${payload.name}" rate contract specifications updated successfully!`);
      } else {
        await createProduct(payload).unwrap();
        setToastMessage(`New product "${payload.name}" successfully empaneled into CSD catalogue!`);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to save product in rate contract.');
    }
  };

  const columns = [
    {
      header: 'Vehicle Model',
      accessor: 'name',
      render: (r) => <ProductCell product={r} />,
    },
    {
      header: 'Manufacturer / Brand',
      accessor: 'oemId',
      render: (r) => (
        <span className="text-xs font-semibold text-slate-800">
          {r.oemId?.name || r.brandId?.name || r.brand || myOem?.name || 'Empaneled OEM'}
        </span>
      ),
    },
    {
      header: 'Body Type / Variant',
      accessor: 'variant',
      render: (r) => (
        <span className="text-xs text-slate-600 font-medium">
          {r.variant || r.type || 'Standard'}
        </span>
      ),
    },
    {
      header: 'CSD Concessional Rate',
      accessor: 'priceToCustomer',
      render: (r) => <PriceCell product={r} />,
    },
    {
      header: 'Civil MRP',
      accessor: 'mrp',
      render: (r) => {
        const mrp = Number(r.mrp || (r.hi && r.hi < 1000 ? r.hi * 100000 : r.hi) || 0);
        return (
          <span className="text-xs font-mono text-slate-400 line-through">
            {mrp ? formatCurrency(mrp) : 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Powertrain',
      accessor: 'engineCapacity',
      render: (r) => (
        <span className="text-xs font-mono text-slate-700">
          {r.engineCapacity ? `${r.engineCapacity} cc` : r.attributes?.engine || r.engine || '-'}
        </span>
      ),
    },
    {
      header: 'Rate Contract Status',
      accessor: 'status',
      render: (r) => (
        <Badge variant={r.status === 'ACTIVE' || !r.status ? 'success' : 'neutral'}>
          {r.status === 'ACTIVE' || !r.status ? 'Active Contract' : 'Under Review'}
        </Badge>
      ),
    },
    {
      header: 'Showroom / Actions',
      accessor: '_id',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            icon={Edit3}
            onClick={() => handleOpenEdit(r)}
            title="Edit specifications, CSD concessional rate or details"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="oem-products-page space-y-6">
      {/* 1. Page Header with Add Product CTA */}
      <PageHeader
        title="OEM Catalog Lineup & Active Rate Contracts"
        subtitle="Empaneled vehicles approved under CSD AFD-I with approved concessional price schedules"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Product Lineup' },
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
              Sync Catalogue
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

      {/* 2. Feedback Notification Toast */}
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

      {/* 3. Catalog Card with Search & DataTable */}
      <Card>
        <CatalogToolbar
          search={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search OEM catalog by model name, SKU, or index..."
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
          allLabel="All Categories"
          onRefresh={() => refetch()}
          refreshing={isFetching}
          filterIcon={Filter}
        />

        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          emptyText="No vehicles found under current rate contract search."
        />
      </Card>

      {/* 4. Empanel / Edit Product Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingProduct ? `Modify Rate Contract: ${editingProduct.name}` : 'Empanel New Vehicle into CSD Catalogue'}
          subtitle="Submit official vehicle technical specifications, concessional CSD ex-showroom price, and color lineup"
          maxWidth="760px"
        >
          <form onSubmit={handleFormSubmit}>
            {formError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="csd-form-grid-2">
              <div>
                <label className="director-field-label">Vehicle Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra Scorpio N Z8 Select D MT"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="director-field-input"
                />
              </div>

              <div>
                <label className="director-field-label">Index No. / SKU Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 67890-T"
                  value={formState.sku}
                  onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                  className="director-field-input director-field-mono"
                />
              </div>

              <div>
                <label className="director-field-label">Vehicle Category *</label>
                <select
                  value={formState.categoryId}
                  onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
                  className="director-field-input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.code} value={c._id || c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="director-field-label">Body Type / Trim Variant</label>
                <input
                  type="text"
                  placeholder="e.g. 7 STR Luxury SUV / 4x4"
                  value={formState.variant}
                  onChange={(e) => setFormState({ ...formState, variant: e.target.value })}
                  className="director-field-input"
                />
              </div>

              <div>
                <label className="director-field-label">CSD Concessional Rate (₹) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="e.g. 1425000"
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                  className="director-field-input director-field-price"
                />
                <span className="director-field-help">
                  Authorized concessional ex-factory price payable by Defence Beneficiary
                </span>
              </div>

              <div>
                <label className="director-field-label">Civil Market MRP (₹)</label>
                <input
                  type="number"
                  min="1000"
                  placeholder="e.g. 1750000"
                  value={formState.mrp}
                  onChange={(e) => setFormState({ ...formState, mrp: e.target.value })}
                  className="director-field-input director-field-mono"
                />
                <span className="director-field-help">
                  Standard civil showroom retail price
                </span>
              </div>

              <div>
                <label className="director-field-label">Engine Capacity (cc)</label>
                <input
                  type="number"
                  placeholder="e.g. 2198"
                  value={formState.engineCapacity}
                  onChange={(e) => setFormState({ ...formState, engineCapacity: e.target.value })}
                  className="director-field-input director-field-mono"
                />
              </div>

              <div>
                <label className="director-field-label">Fuel Type</label>
                <select
                  value={formState.fuelType}
                  onChange={(e) => setFormState({ ...formState, fuelType: e.target.value })}
                  className="director-field-input"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="director-grid-span-2">
                <label className="director-field-label">Available Colors (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Everest White, Napoli Black, Dazzling Silver, Deep Forest"
                  value={formState.colors}
                  onChange={(e) => setFormState({ ...formState, colors: e.target.value })}
                  className="director-field-input"
                />
              </div>

              <div className="director-grid-span-2">
                <label className="director-field-label">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  className="director-field-input director-field-mono"
                />
              </div>
            </div>

            <div className="director-modal-actions mt-4 flex items-center justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isCreating || isUpdating}
              >
                {editingProduct ? 'Save Rate Contract' : 'Empanel Product'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
