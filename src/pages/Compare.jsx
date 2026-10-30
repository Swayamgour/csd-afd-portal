import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/Store.jsx';
import { EmptyState, Loader, UnavailableState } from '../components/States.jsx';
import { priceText } from '../data/utils.js';
import { Stars, Img } from '../components/ProductCard.jsx';
import { useStoreProducts } from '../hooks/useStoreProducts.js';

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
  const { products, isLoading, isError, refetch } = useStoreProducts();

  const items = cmp
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (cmp.length && isLoading) {
    return (
      <div className="wrap">
        <Loader label="Loading comparison data" onRetry={refetch} />
      </div>
    );
  }

  if (cmp.length && isError) {
    return (
      <div className="wrap">
        <UnavailableState
          title="Comparison not available"
          text="We could not load product details from the server. Please try again."
          onRetry={refetch}
        />
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

  // values come from the server record (p.raw); anything missing shows "Not available"
  const v = (p, k) => {
    const src = p.raw || p;
    if (k === 'categoryId' && src[k] && typeof src[k] === 'object') return src[k]?.name || 'Not available';
    if (k === 'engineCapacity' && src[k]) return `${src[k]} cc`;
    if (Array.isArray(src[k])) return src[k].join(' / ') || 'Not available';
    return src[k] || 'Not available';
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
          const pId = p.id;
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
                <Stars v={p.rating} n={p.reviews} />
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
