import React, { useState, useMemo } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import CatalogToolbar from '../../components/common/CatalogToolbar.jsx';
import { ProductCell, CategoryBadge, PriceCell } from '../../components/common/ProductGrid.jsx';
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
      render: (r) => <ProductCell product={r} />,
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
      render: (r) => <CategoryBadge product={r} />,
    },
    {
      header: 'CSD Concessional Rate',
      accessor: 'priceToCustomer',
      render: (r) => <PriceCell product={r} />,
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
        <CatalogToolbar
          search={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search by vehicle model, brand, or CSD index..."
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
          allLabel="All AFD Categories"
          onRefresh={() => refetch()}
          refreshing={isFetching}
          filterIcon={Filter}
        />

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
