import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useGetProductsQuery, useGetCategoriesQuery } from '../catalog/productApi.js';

export default function UrcProducts() {
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
      header: 'Product Item',
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
      accessor: 'brand',
      render: (r) => (
        <span className="text-xs font-medium text-slate-700">
          {r.oemId?.name || r.brandId?.name || r.brand || 'Authorized OEM'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
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
      header: 'CSD Concessional Rate',
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
      header: 'Availability',
      accessor: 'status',
      render: (r) => (
        <Badge variant={r.status === 'ACTIVE' || !r.status ? 'success' : 'neutral'}>
          {r.status === 'ACTIVE' || !r.status ? 'Available for Indent' : 'Discontinued'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="urc-products-page space-y-6">
      <PageHeader
        title="Entitled Products Catalogue (URC View)"
        subtitle="Catalogue items available for demand verification and indent submission by unit personnel"
        breadcrumbs={[
          { label: 'URC Portal', href: '/urc/dashboard' },
          { label: 'Entitled Products' },
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
              placeholder="Search by vehicle model, brand, or CSD index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="catalogue-category-filter">
            <Filter className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All AFD Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.code} value={c._id || c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          emptyText="No products found in this category for URC indent."
        />
      </Card>
    </div>
  );
}
