import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { useGetProductsQuery } from '../catalog/productApi.js';

export default function DealerProducts() {
  const { data: productsData, isLoading } = useGetProductsQuery({ limit: 50 });
  const products = productsData?.items || [];

  const columns = [
    {
      header: 'Vehicle Model',
      accessor: 'name',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.name}</span>
          <span className="micro muted font-mono">SKU: {r.sku || r.indexNo}</span>
        </div>
      )
    },
    {
      header: 'Brand / OEM',
      accessor: 'brandId',
      render: (r) => <span>{r.brandId?.name || r.brand || 'Mahindra'}</span>
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      render: (r) => (
        <span className="badge-pill badge-primary badge-sm text-uppercase">
          {r.categoryId?.name || r.category || '4-Wheeler'}
        </span>
      )
    },
    {
      header: 'Sanctioned CSD Price',
      accessor: 'priceToCustomer',
      render: (r) => {
        const p = r.priceToCustomer || r.price || 0;
        return <span className="font-bold text-brand font-mono">₹ {p.toLocaleString('en-IN')}</span>;
      }
    },
    {
      header: 'Showroom Stock Status',
      accessor: 'status',
      render: () => <span className="text-green font-semibold small">● Stock Allocated</span>
    }
  ];

  return (
    <div className="dealer-products-page">
      <PageHeader
        title="Showroom Allotted Stock & Inventory"
        subtitle="Approved CSD vehicle models available for delivery from this showroom"
      />
      <Card>
        <DataTable columns={columns} data={products} loading={isLoading} />
      </Card>
    </div>
  );
}
