import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Car } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useGetProductsQuery, useGetCategoriesQuery } from '../catalog/productApi.js';

export default function OemProducts() {
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
      header: 'Vehicle Model',
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
                Index / SKU: {r.indexNo || r.sku || 'N/A'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Manufacturer / Brand',
      accessor: 'oemId',
      render: (r) => (
        <span className="text-xs font-semibold text-slate-800">
          {r.oemId?.name || r.brandId?.name || r.brand || 'Empaneled OEM'}
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
  ];

  return (
    <div className="oem-products-page space-y-6">
      <PageHeader
        title="OEM Catalog Lineup & Active Rate Contracts"
        subtitle="Empaneled vehicles approved under CSD AFD-I with approved concessional price schedules"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Product Lineup' },
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
              placeholder="Search OEM catalog by model name, SKU, or index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All Categories</option>
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
          emptyText="No vehicles found under current rate contract search."
        />
      </Card>
    </div>
  );
}
