import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { LoadingState } from '../../components/common/States';
import { productService } from '../../services/product.service';

export const BeneficiaryProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      setProducts(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'ALL' || p.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="beneficiary-products-page">
      <PageHeader
        title="Authorized AFD Product Catalogue"
        subtitle="Entitled four-wheelers, two-wheelers, and white goods with concessional CSD ex-showroom pricing"
        breadcrumbs={[
          { label: 'Beneficiary', href: '/beneficiary/dashboard' },
          { label: 'Products' }
        ]}
        actions={
          <Link to="/beneficiary/eligibility">
            <Button variant="outline" size="sm">Check Rank Entitlement</Button>
          </Link>
        }
      />

      <Card style={{ marginBottom: '1.25rem' }}>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vehicles by model or brand (e.g. Maruti, Tata, Royal Enfield)..."
          filters={[
            {
              name: 'category',
              label: 'Category',
              value: category,
              onChange: (e) => setCategory(e.target.value),
              options: [
                { value: 'ALL', label: 'All Categories' },
                { value: 'car', label: 'Cars / Four-Wheelers' },
                { value: 'bike', label: 'Bikes / Two-Wheelers' },
                { value: 'white-goods', label: 'White Goods & Appliances' }
              ]
            }
          ]}
        />
      </Card>

      {loading ? (
        <LoadingState text="Loading certified CSD AFD inventory..." />
      ) : filtered.length === 0 ? (
        <Card><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</p></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((prod) => (
            <Card key={prod.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', background: '#f8fafc', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <img
                  src={prod.image || (prod.images && prod.images[0]) || '/assets/placeholder.png'}
                  alt={prod.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <span className="badge" style={{ alignSelf: 'flex-start', background: '#f1f5f9', color: 'var(--navy)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
                {prod.brand} • {prod.category?.toUpperCase()}
              </span>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--navy)' }}>{prod.name}</h4>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#64748b' }}>
                {prod.engine ? `Engine: ${prod.engine} • Fuel: ${Array.isArray(prod.fuel) ? prod.fuel.join('/') : prod.fuel}` : 'Standard Defense AFD Concession'}
              </p>
              <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>CSD EX-SHOWROOM</span>
                  <strong style={{ fontSize: '1.05rem', color: '#16a34a' }}>
                    ₹{Number(prod.lo || prod.price || 850000).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link to={`/products/${prod.id}`}>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                  <Link to={`/beneficiary/demands/new?productId=${prod.id}`}>
                    <Button size="sm">Apply</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
