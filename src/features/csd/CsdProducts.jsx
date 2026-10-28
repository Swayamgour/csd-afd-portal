import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IndianRupee,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateProductMutation
} from '../catalog/productApi.js';
import { useGetOemsQuery } from '../org/orgApi.js';

export default function CsdProducts() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [oemFilter, setOemFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
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
      {
        title: 'Total AFD Products',
        value: total,
        subtitle: 'Catalogued Models',
        icon: Package,
        variant: 'primary',
      },
      {
        title: 'Active in Catalogue',
        value: active,
        subtitle: `${total > 0 ? Math.round((active / total) * 100) : 0}% Active Rate`,
        icon: CheckCircle2,
        variant: 'success',
      },
      {
        title: 'Four-Wheelers (Cars)',
        value: fourWheelers,
        subtitle: 'AFD-I Quota',
        icon: Car,
        variant: 'warning',
      },
      {
        title: 'Two-Wheelers & Others',
        value: twoWheelers || total - fourWheelers,
        subtitle: 'Entitled Products',
        icon: Bike,
        variant: 'default',
      },
    ];
  }, [productsList]);

  const openCreateModal = () => {
    navigate('/csd/products/new');
  };

  const openEditModal = (p) => {
    navigate(`/csd/products/${p._id || p.id}/edit`);
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'ACTIVE' || !product.status ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateProduct({
        id: product._id || product.id,
        status: nextStatus,
      }).unwrap();
      showToast(`Product "${product.name}" marked as ${nextStatus}.`);
    } catch (err) {
      alert(err?.data?.message || 'Failed to update status');
    }
  };


  const columns = [
    {
      header: 'Product Details',
      accessor: 'name',
      width: '280px',
      render: (row) => {
        const img = row.images?.[0] || row.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200';
        const brandName = row.oemId?.name || row.brandId?.name || row.brand || 'Authorized OEM';
        const variantText = row.variant || row.type || '';
        return (
          <div className="csd-product-cell">
            <img
              src={img}
              alt={row.name || 'Product'}
              className="product-table-thumb"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200';
              }}
            />
            <div className="csd-product-info">
              <strong className="csd-product-title" title={row.name}>
                {row.name}
              </strong>
              <span className="csd-product-subtitle">
                <span>{brandName}</span>
                {variantText && <span>· {variantText}</span>}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Index / SKU',
      accessor: 'sku',
      width: '120px',
      render: (row) => (
        <span className="csd-code-badge" title="AFD Item Index Code">
          {row.indexNo || row.sku || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      width: '110px',
      render: (row) => {
        const catName = row.categoryId?.name || row.category || 'CAR';
        const catCode = row.categoryId?.code || '';
        return (
          <span className="csd-cat-badge">
            {catCode || catName}
          </span>
        );
      },
    },
    {
      header: 'CSD Concessional Price',
      accessor: 'price',
      width: '150px',
      render: (row) => {
        const finalVal = getDisplayPrice(row.priceToCustomer || row.price || row.lo);
        return (
          <div className="csd-price-block">
            <span className="csd-price-val">
              {formatCurrency(finalVal)}
            </span>
            <span className="csd-price-hint">Concessional Net</span>
          </div>
        );
      },
    },
    {
      header: 'Civil MRP',
      accessor: 'mrp',
      width: '110px',
      render: (row) => {
        const mrpVal = getDisplayPrice(row.mrp || row.hi);
        return (
          <span className="csd-mrp-val">
            {mrpVal ? formatCurrency(mrpVal) : '—'}
          </span>
        );
      },
    },
    {
      header: 'Engine / Specs',
      accessor: 'engineCapacity',
      width: '110px',
      render: (row) => (
        <span className="csd-specs-val">
          {row.engineCapacity ? `${row.engineCapacity} cc` : row.attributes?.engine || row.engine || '—'}
        </span>
      ),
    },
    {
      header: 'Fuel Type',
      accessor: 'fuelType',
      width: '95px',
      render: (row) => {
        const f = row.fuelType || (Array.isArray(row.fuel) ? row.fuel.join(', ') : row.fuel || '—');
        return <span className="csd-fuel-val">{f}</span>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: (row) => {
        const isActive = row.status === 'ACTIVE' || !row.status;
        return (
          <span className={isActive ? 'csd-badge-active' : 'csd-badge-inactive'}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: '_id',
      width: '150px',
      render: (row) => {
        const isActive = row.status === 'ACTIVE' || !row.status;
        return (
          <div className="csd-action-row">
            <button
              type="button"
              className="csd-btn-action-edit"
              onClick={() => openEditModal(row)}
              title="Edit Product Details"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleStatus(row)}
              className={isActive ? 'csd-btn-action-delete' : 'csd-btn-action-activate'}
              title={isActive ? 'Deactivate Product' : 'Activate Product'}
            >
              {isActive ? <X size={13} /> : <Check size={13} />}
              <span>{isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="csd-module-page">
      {toast && (
        <div className="portal-toast-fixed">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      <PageHeader
        title="CSD AFD Product Catalogue Management"
        subtitle="Maintain approved manufacturer vehicle models, sanctioned concessional prices, and AFD quota categories."
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Product Catalogue' },
        ]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={14} className={`mr-xs ${isFetching ? 'spin-icon' : ''}`} />
              {isFetching ? 'Syncing...' : 'Sync Products'}
            </Button>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <PlusCircle size={14} className="mr-xs" /> Catalogue New Product
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiStats.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* Main Table Card with Integrated Search & Filter Bar */}
      <Card
        title="Approved AFD Product Directory"
        subtitle={`Showing ${productsList.length} items actively retrieved from server database`}
        actions={
          <div className="csd-toolbar-actions">
            <span className="csd-count-pill">
              {productsList.length} Models Catalogued
            </span>
          </div>
        }
      >
        {/* Search & Filter Toolbar */}
        <div className="csd-products-toolbar">
          <div className="csd-search-wrap">
            <Search size={14} className="csd-search-icon-pos" />
            <input
              type="text"
              placeholder="Search by model, SKU, brand, body type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="csd-filter-group">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-control"
              aria-label="Filter by Category"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.code} value={c._id || c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            {/* OEM Filter */}
            <select
              value={oemFilter}
              onChange={(e) => setOemFilter(e.target.value)}
              className="form-control"
              aria-label="Filter by OEM"
            >
              <option value="all">All OEMs / Brands</option>
              {oems.map((o) => (
                <option key={o._id || o.code} value={o._id || o.code}>
                  {o.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active in Catalogue</option>
              <option value="INACTIVE">Inactive / Deactivated</option>
            </select>

            {(categoryFilter !== 'all' || oemFilter !== 'all' || statusFilter || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('all');
                  setOemFilter('all');
                  setStatusFilter('');
                  setSearchTerm('');
                }}
                className="csd-btn-reset-filters"
                title="Reset all filters"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {loadingProducts ? (
          <div className="table-state-cell">
            <div className="table-loader">
              <RefreshCw size={24} className="spin text-brand" />
              <p className="table-loader-msg">Synchronizing catalogue from database...</p>
            </div>
          </div>
        ) : productsList.length === 0 ? (
          <div className="table-state-cell">
            <div className="table-empty">
              <Package size={36} className="text-muted" />
              <h4 className="table-empty-title">No products match filter</h4>
              <p className="muted small">Try adjusting your category, OEM or search criteria</p>
            </div>
          </div>
        ) : (
          <DataTable columns={columns} data={productsList} />
        )}
      </Card>
    </div>
  );
}
