import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/Store.jsx';
import { EmptyState } from '../components/States.jsx';
import { priceText } from '../data/utils.js';
import { Stars, Img } from '../components/ProductCard.jsx';
import { useGetProductsQuery } from '../features/catalog/productApi.js';

const rows = [
  ['Transmission', 'transmission'],
  ['Engine', 'engineCapacity'],
  ['Fuel Type', 'fuelType'],
  ['Variant', 'variant'],
  ['AFD Type', 'afdType'],
  ['Category', 'categoryId'],
];

export default function Compare() {
  const { cmp, toggleCmp, addCart } = useStore();
  const back = useNavigate();
  const { data: productsData, isLoading } = useGetProductsQuery({ limit: 100 });
  const allProducts = productsData?.items || (Array.isArray(productsData) ? productsData : []);

  const items = cmp
    .map((id) => allProducts.find((p) => (p._id || p.id) === id))
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="wrap">
        <p className="muted">Loading comparison data...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="wrap">
        <EmptyState
          title="Nothing to compare yet"
          text="Select Compare on up to 4 products."
          action={<Link className="btn" to="/products">Browse products</Link>}
        />
      </div>
    );
  }

  const v = (p, k) => {
    if (k === 'categoryId' && typeof p[k] === 'object') return p[k]?.name || '-';
    if (k === 'engineCapacity' && p[k]) return `${p[k]} cc`;
    if (Array.isArray(p[k])) return p[k].join(' / ');
    return p[k] || '-';
  };

  return (
    <div className="wrap">
      <div className="titlebar">
        <button className="circle" aria-label="Go back" onClick={() => back(-1)}>
          <ArrowLeft />
        </button>
        <h1>Comparing {items[0]?.name}</h1>
      </div>
      <ul className="cmpgrid">
        {items.map((p) => {
          const pId = p._id || p.id;
          return (
            <li key={pId} className="cmpcard">
              <div className="card-img">
                <Img p={p} />
                <button
                  className="close"
                  aria-label={`Remove ${p.name} from comparison`}
                  onClick={() => toggleCmp(p)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="cmpbody">
                <h2>{p.name}</h2>
                <p className="cprice">{priceText(p)}</p>
                <Stars v={p.rating || 4.5} n={p.reviews || 0} />
                <dl>
                  {rows.map(([l, k]) => (
                    <div key={k}>
                      <dt>{l}</dt>
                      <dd>{v(p, k)}</dd>
                    </div>
                  ))}
                </dl>
                <button className="btn wide" onClick={() => addCart(p)}>
                  ADD TO CART <ShoppingCart size={16} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
