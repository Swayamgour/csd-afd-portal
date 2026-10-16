import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { productService } from '../../services/product.service.js';

export default function OemProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // In OEM view, show products matching OEM brand (e.g. Tata)
      const data = await productService.getProducts({ brand: 'Tata' });
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Vehicle Model', accessor: 'name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { header: 'Body Type', accessor: 'type' },
    { header: 'CSD Concessional Ex-Showroom', accessor: 'lo', render: (r) => <span className="font-bold text-brand">₹ {r.lo?.toLocaleString('en-IN')}</span> },
    { header: 'Powertrain', accessor: 'engine' },
    { header: 'Empanelment Rating', accessor: 'rating', render: (r) => `★ ${r.rating || 4.5} (Empaneled)` }
  ];

  return (
    <div className="oem-products-page">
      <PageHeader
        title="OEM Catalog Lineup & Active Rate Contracts"
        subtitle="Empaneled vehicles approved under CSD AFD-I with approved concessional price schedules"
      />
      <Card>
        <DataTable columns={columns} data={products} loading={loading} />
      </Card>
    </div>
  );
}
