import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Layers } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useGetProductsQuery, useGetCategoriesQuery } from '../catalog/productApi.js';

export default function DepotProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const queryParams = useMemo(() => {
    const p = { limit: 100, status: 'ACTIVE' };
    if (searchTerm) p.q = searchTerm;
    if (categoryFilter) p.categoryId = categoryFilter;
    return p;
  }, [searchTerm, categoryFilter]);

  const { data: productsData, isLoading, isFetching, refetch } = useGetProductsQuery(queryParams);
  const { data: categories = [] } = useGetCategoriesQuery();

  const products = useMemo(() => {
    if (Array.isArray(productsData?.items)) return productsData.items;
    if (Array.isArray(productsData?.data?.items)) return productsData.data.items;
    if (Array.isArray(productsData?.data)) return productsData.data;
    if (Array.isArray(productsData)) return productsData;
    return [];
  }, [productsData]);

  const columns = [
    {
      header: 'Vehicle / Appliance Model',
      accessor: 'name',
      render: (r) => {
        const img = r.images?.[0] || r.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200';
        return (
          <div className="flex items-center gap-3">
            <img
              src={img}
              alt=""
              className="product-table-thumb"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200';
              }}
            />
            <div>
              <span className="font-semibold text-xs text-ink block">{r.name}</span>
              <span className="text-[11px] font-mono text-muted">
                Index: {r.indexNo || r.sku || 'N/A'} {r.variant ? `· ${r.variant}` : ''}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Brand / OEM',
      accessor: 'brandId',
      render: (r) => (
        <span className="text-xs font-medium text-slate-700">
          {r.oemId?.name || r.brandId?.name || r.brand || 'Authorized OEM'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      render: (r) => {
        const catName = r.categoryId?.name || r.category || 'CAR';
        return (
          <span className="badge-pill badge-primary badge-sm text-[10px] font-semibold uppercase">
            {catName}
          </span>
        );
      },
    },
    {
      header: 'Depot Concessional Rate',
      accessor: 'priceToCustomer',
      render: (r) => {
        const raw = Number(r.priceToCustomer || r.price || (r.lo && r.lo < 1000 ? r.lo * 100000 : r.lo) || 0);
        return (
          <span className="font-bold text-xs font-mono text-brand">
            {formatCurrency(raw)}
          </span>
        );
      },
    },
    {
      header: 'Engine / Specs',
      accessor: 'engineCapacity',
      render: (r) => (
        <span className="text-xs font-mono text-slate-600">
          {r.engineCapacity ? `${r.engineCapacity} cc` : r.attributes?.engine || r.engine || '-'}
        </span>
      ),
    },
    {
      header: 'Fuel Type',
      accessor: 'fuelType',
      render: (r) => {
        const f = r.fuelType || (Array.isArray(r.fuel) ? r.fuel.join(', ') : r.fuel || '-');
        return <span className="text-xs text-slate-700">{f}</span>;
      },
    },
    {
      header: 'Allotment Status',
      accessor: 'status',
      render: (r) => (
        <Badge variant={r.status === 'ACTIVE' || !r.status ? 'success' : 'neutral'}>
          {r.status === 'ACTIVE' || !r.status ? 'Active in Depot' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="depot-products-page space-y-6">
      <PageHeader
        title="Regional Depot Allotted Product Catalogue"
        subtitle="Catalog models authorized for delivery, stock allotment, and billing through this regional CSD depot"
        breadcrumbs={[
          { label: 'Depot Portal', href: '/depot/dashboard' },
          { label: 'Product Catalogue' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Sync Catalogue
          </Button>
        }
      />

      <Card>
        <div className="catalogue-filter-bar">
          <div className="catalogue-search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search depot catalogue by model, SKU, or index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="catalogue-category-filter">
            <Layers className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.code} value={c._id || c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          emptyText="No products matched your search in this depot catalogue."
        />
      </Card>
    </div>
  );
}
