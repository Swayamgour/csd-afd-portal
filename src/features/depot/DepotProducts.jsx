import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { productService } from '../../services/product.service.js';

export default function DepotProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    { header: 'Product Item', accessor: 'name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { header: 'Brand / OEM', accessor: 'brand' },
    { header: 'Category', accessor: 'category', render: (r) => <span className="badge-pill badge-primary badge-sm text-uppercase">{r.category}</span> },
    { header: 'Depot Concessional Rate', accessor: 'lo', render: (r) => <span className="font-bold text-brand">₹ {r.lo?.toLocaleString('en-IN')}</span> },
    { header: 'Specifications', accessor: 'engine', render: (r) => <span className="small">{r.engine || r.type}</span> }
  ];

  return (
    <div className="depot-products-page">
      <PageHeader
        title="Regional Depot Allotted Product Catalogue"
        subtitle="Catalog models authorized for delivery and billing through this regional depot"
      />

      <Card>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
        />
      </Card>
    </div>
  );
}
