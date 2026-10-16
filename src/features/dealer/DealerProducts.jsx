import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { productService } from '../../services/product.service.js';

export default function DealerProducts() {
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
    { header: 'Vehicle Model', accessor: 'name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { header: 'Brand', accessor: 'brand' },
    { header: 'Category', accessor: 'category', render: (r) => <span className="badge-pill badge-primary badge-sm text-uppercase">{r.category}</span> },
    { header: 'Sanctioned Ex-Showroom (CSD)', accessor: 'lo', render: (r) => <span className="font-bold text-brand">₹ {r.lo?.toLocaleString('en-IN')}</span> },
    { header: 'Showroom Stock Status', accessor: 'id', render: () => <span className="text-green font-semibold small">● Stock Allocated</span> }
  ];

  return (
    <div className="dealer-products-page">
      <PageHeader
        title="Showroom Allotted Stock & Inventory"
        subtitle="Approved CSD vehicle models available for delivery from this showroom"
      />
      <Card>
        <DataTable columns={columns} data={products} loading={loading} />
      </Card>
    </div>
  );
}
