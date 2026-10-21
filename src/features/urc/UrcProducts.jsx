import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
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
              className="w-12 h-9 object-cover rounded border border-slate-200 bg-slate-50 flex-shrink-0"
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
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync Catalogue</span>
          </button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by vehicle model, brand, or CSD index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand"
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
