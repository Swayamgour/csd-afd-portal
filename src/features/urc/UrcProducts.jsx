import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { productService } from '../../services/product.service.js';

export default function UrcProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await productService.getProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Product Item', accessor: 'name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { header: 'Brand / OEM', accessor: 'brand' },
    { header: 'Category', accessor: 'category', render: (r) => <span className="badge-pill badge-primary badge-sm text-uppercase">{r.category}</span> },
    { header: 'CSD Concessional Rate', accessor: 'lo', render: (r) => <span className="font-bold text-brand">₹ {r.lo?.toLocaleString('en-IN')}</span> }
  ];

  return (
    <div className="urc-products-page">
      <PageHeader
        title="Entitled Products Catalogue (URC View)"
        subtitle="Catalogue items available for demand generation by unit personnel"
      />
      <Card>
        <DataTable columns={columns} data={products} loading={loading} />
      </Card>
    </div>
  );
}
