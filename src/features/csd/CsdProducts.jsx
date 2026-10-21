import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  Package,
  RefreshCw,
  Building2,
  Layers,
  Car,
  Bike,
  Refrigerator,
  Check,
  X,
  AlertCircle,
  Eye,
  IndianRupee
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../catalog/productApi.js';
import { useGetOemsQuery } from '../org/orgApi.js';

export default function CsdProducts() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [oemFilter, setOemFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState('');

  // Query parameters for dynamic backend catalogue
  const queryParams = useMemo(() => {
    const p = { limit: 100 };
    if (searchTerm) p.q = searchTerm;
    if (categoryFilter && categoryFilter !== 'all') p.categoryId = categoryFilter;
    if (oemFilter && oemFilter !== 'all') p.oemId = oemFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [searchTerm, categoryFilter, oemFilter, statusFilter]);

  const {
    data: productsData,
    isLoading: loadingProducts,
    isFetching,
    refetch,
  } = useGetProductsQuery(queryParams);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: oems = [] } = useGetOemsQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const productsList = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.data?.items)) return productsData.data.items;
    if (Array.isArray(productsData?.data)) return productsData.data;
    return [];
  }, [productsData]);

  // Form State for Add / Edit
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
    taxPercent: '28',
    engineCapacity: '',
    fuelType: 'Petrol',
    imageUrl: '',
    status: 'ACTIVE',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 5000);
  };

  // Helper to ensure clean Rupees format even if legacy data had Lakhs (e.g. 4.7 -> 470000)
  const getDisplayPrice = (val) => {
    const n = Number(val) || 0;
    if (n > 0 && n < 1000) {
      return n * 100000;
    }
    return n;
  };

  // KPI calculations from live database
  const kpiStats = useMemo(() => {
    const total = productsList.length;
    const active = productsList.filter((p) => p.status === 'ACTIVE' || !p.status).length;
    const fourWheelers = productsList.filter(
      (p) =>
        p.afdType === 'AFD_I' &&
        (p.categoryId?.code === 'CAR' ||
          p.categoryId?.name?.toLowerCase().includes('car') ||
          p.variant?.toLowerCase().includes('suv') ||
          p.variant?.toLowerCase().includes('hatchback'))
    ).length;
    const twoWheelers = productsList.filter(
      (p) =>
        p.categoryId?.code === 'BIKE' ||
        p.categoryId?.name?.toLowerCase().includes('bike') ||
        p.categoryId?.name?.toLowerCase().includes('motorcycle')
    ).length;

    return [
      { title: 'Total AFD Products', value: total, subtitle: 'Catalogued Models' },
      { title: 'Active in Catalogue', value: active, subtitle: `${total > 0 ? Math.round((active / total) * 100) : 0}% Active Rate` },
      { title: 'Four-Wheelers (Cars)', value: fourWheelers, subtitle: 'AFD-I Quota' },
      { title: 'Two-Wheelers & Others', value: twoWheelers || total - fourWheelers, subtitle: 'Entitled Products' },
    ];
  }, [productsList]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormState({
      name: '',
      sku: '',
      indexNo: '',
      categoryId: categories[0]?._id || '',
      oemId: oems[0]?._id || '',
      variant: 'Hatchback',
      afdType: 'AFD_I',
      price: '',
      mrp: '',
      taxPercent: '28',
      engineCapacity: '1197',
      fuelType: 'Petrol',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    const rawPrice = getDisplayPrice(p.priceToCustomer || p.price || p.lo);
    const rawMrp = getDisplayPrice(p.mrp || p.hi);

    setFormState({
      name: p.name || '',
      sku: p.sku || p.indexNo || '',
      indexNo: p.indexNo || p.sku || '',
      categoryId: p.categoryId?._id || p.categoryId || categories[0]?._id || '',
      oemId: p.oemId?._id || p.oemId || oems[0]?._id || '',
      variant: p.variant || p.type || '',
      afdType: p.afdType || 'AFD_I',
      price: rawPrice ? String(rawPrice) : '',
      mrp: rawMrp ? String(rawMrp) : '',
      taxPercent: p.taxPercent ? String(p.taxPercent) : '28',
      engineCapacity: p.engineCapacity ? String(p.engineCapacity) : (p.engine?.replace(/[^0-9]/g, '') || ''),
      fuelType: p.fuelType || (Array.isArray(p.fuel) ? p.fuel[0] : p.fuel || 'Petrol'),
      imageUrl: p.images?.[0] || p.image || '',
      status: p.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'ACTIVE' || !product.status ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateProduct({
        id: product._id || product.id,
        status: nextStatus,
      }).unwrap();
      showToast(`Product ${product.name} marked as ${nextStatus}.`);
    } catch (err) {
      alert(err?.data?.message || 'Failed to update status');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.sku.trim() || !formState.price) {
      alert('Please fill all mandatory fields (Name, Index/SKU, and Concessional Price).');
      return;
    }

    const payload = {
      name: formState.name.trim(),
      sku: formState.sku.trim(),
      indexNo: formState.indexNo.trim() || formState.sku.trim(),
      categoryId: formState.categoryId || categories[0]?._id,
      oemId: formState.oemId || oems[0]?._id,
      variant: formState.variant,
      afdType: formState.afdType,
      price: Number(formState.price),
      priceToCustomer: Number(formState.price),
      mrp: formState.mrp ? Number(formState.mrp) : Math.round(Number(formState.price) * 1.15),
      taxPercent: Number(formState.taxPercent) || 28,
      engineCapacity: formState.engineCapacity ? Number(formState.engineCapacity) : undefined,
      fuelType: formState.fuelType,
      images: formState.imageUrl ? [formState.imageUrl] : [],
      status: formState.status,
    };

    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id || editingProduct.id,
          ...payload,
        }).unwrap();
        showToast(`Product "${formState.name}" updated successfully.`);
      } else {
        await createProduct(payload).unwrap();
        showToast(`New product "${formState.name}" catalogued into database.`);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Operation failed');
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: 'name',
      render: (row) => {
        const img = row.images?.[0] || row.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200';
        const brandName = row.oemId?.name || row.brandId?.name || row.brand || 'Authorized OEM';
        const variantText = row.variant || row.type || '';
        return (
          <div className="flex items-center gap-3">
            <img
              src={img}
              alt=""
              className="w-14 h-11 object-cover rounded-md border border-slate-200 bg-slate-50 flex-shrink-0"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200';
              }}
            />
            <div>
              <span className="font-semibold text-xs text-ink block line-clamp-1">{row.name}</span>
              <span className="text-[11px] text-muted font-medium">
                {brandName} {variantText ? `· ${variantText}` : ''}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Index / SKU',
      accessor: 'sku',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-brand">
          {row.indexNo || row.sku || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      render: (row) => {
        const catName = row.categoryId?.name || row.category || 'CAR';
        const catCode = row.categoryId?.code || '';
        return (
          <span className="badge-pill badge-primary badge-sm font-semibold uppercase text-[10px]">
            {catCode || catName}
          </span>
        );
      },
    },
    {
      header: 'CSD Concessional Price',
      accessor: 'price',
      render: (row) => {
        const finalVal = getDisplayPrice(row.priceToCustomer || row.price || row.lo);
        return (
          <span className="font-bold font-mono text-xs text-ink">
            {formatCurrency(finalVal)}
          </span>
        );
      },
    },
    {
      header: 'Civil MRP',
      accessor: 'mrp',
      render: (row) => {
        const mrpVal = getDisplayPrice(row.mrp || row.hi);
        return (
          <span className="text-xs text-slate-500 line-through font-mono">
            {mrpVal ? formatCurrency(mrpVal) : 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Engine / Specs',
      accessor: 'engineCapacity',
      render: (row) => (
        <span className="text-xs font-mono text-slate-700">
          {row.engineCapacity ? `${row.engineCapacity} cc` : row.attributes?.engine || row.engine || '-'}
        </span>
      ),
    },
    {
      header: 'Fuel Type',
      accessor: 'fuelType',
      render: (row) => {
        const f = row.fuelType || (Array.isArray(row.fuel) ? row.fuel.join(', ') : row.fuel || '-');
        return <span className="text-xs text-slate-700">{f}</span>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const isActive = row.status === 'ACTIVE' || !row.status;
        return (
          <Badge variant={isActive ? 'success' : 'neutral'}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => {
        const isActive = row.status === 'ACTIVE' || !row.status;
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-semibold border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition flex items-center gap-1"
              onClick={() => openEditModal(row)}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleStatus(row)}
              className={`p-1 rounded text-xs transition ${
                isActive
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
              title={isActive ? 'Deactivate Product' : 'Activate Product'}
            >
              {isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="csd-products-page space-y-6">
      <PageHeader
        title="CSD AFD Product Catalogue Management"
        subtitle="Maintain approved manufacturer vehicle models, sanctioned concessional prices, and AFD quota categories."
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Product Catalogue' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Products"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-brand' : ''}`} />
            </button>
            <Button variant="primary" icon={PlusCircle} onClick={openCreateModal}>
              Catalogue New Product
            </Button>
          </div>
        }
      />

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by model, SKU, brand, or body type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* OEM Filter */}
            <select
              value={oemFilter}
              onChange={(e) => setOemFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">All OEMs</option>
              {oems.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active in Catalogue</option>
              <option value="INACTIVE">Inactive / Deactivated</option>
            </select>

            {(categoryFilter !== 'all' || oemFilter !== 'all' || statusFilter || searchTerm) && (
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setOemFilter('all');
                  setStatusFilter('');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card
        title="Approved AFD Product Directory"
        subtitle={`Showing ${productsList.length} items actively retrieved from server database`}
      >
        {loadingProducts ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
            <p className="font-semibold text-sm">Synchronizing catalogue from database...</p>
          </div>
        ) : productsList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No products match filter</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your category or search term</p>
          </div>
        ) : (
          <DataTable columns={columns} data={productsList} />
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Catalogue New AFD Product'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra Scorpio N Z2 D MT 2WD 7 STR"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Index No. / SKU Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 67681-T"
                  value={formState.sku}
                  onChange={(e) => setFormState({ ...formState, sku: e.target.value, indexNo: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Category *</label>
                <select
                  value={formState.categoryId}
                  onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">OEM / Manufacturer *</label>
                <select
                  value={formState.oemId}
                  onChange={(e) => setFormState({ ...formState, oemId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {oems.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CSD Concessional Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="e.g. 1216296"
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-brand focus:outline-none"
                />
                <span className="text-[10px] text-muted">Final customer payable amount after CSD concessions</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Civil Market MRP (₹)</label>
                <input
                  type="number"
                  min="1000"
                  placeholder="e.g. 1420000"
                  value={formState.mrp}
                  onChange={(e) => setFormState({ ...formState, mrp: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Engine Capacity (cc)</label>
                <input
                  type="number"
                  placeholder="e.g. 2198"
                  value={formState.engineCapacity}
                  onChange={(e) => setFormState({ ...formState, engineCapacity: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fuel Type</label>
                <select
                  value={formState.fuelType}
                  onChange={(e) => setFormState({ ...formState, fuelType: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Variant / Body Type</label>
                <input
                  type="text"
                  placeholder="e.g. Compact SUV / 7-Seater"
                  value={formState.variant}
                  onChange={(e) => setFormState({ ...formState, variant: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Catalogue Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Available for Indenting)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from Beneficiaries)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                loading={isCreating || isUpdating}
              >
                {editingProduct ? 'Save Changes' : 'Catalogue Product'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
