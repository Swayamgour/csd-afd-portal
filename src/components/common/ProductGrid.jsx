import React from 'react';
import { Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import Badge from './Badge.jsx';
import { LoadingState } from './States.jsx';

export const FALLBACK_IMG = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200';

/** Single source of truth for catalogue price / image / brand lookups. */
export const getProductPrice = (p) =>
  Number(p.priceToCustomer || p.price || (p.lo && p.lo < 1000 ? p.lo * 100000 : p.lo) || 0);
export const getProductMrp = (p) => {
  const csd = getProductPrice(p);
  return Number(p.mrp || (p.hi && p.hi < 1000 ? p.hi * 100000 : p.hi) || 0) || csd;
};
export const getProductImage = (p, fallback = FALLBACK_IMG) => p.images?.[0] || p.image || fallback;
export const getProductBrand = (p) => p.oemId?.name || p.brandId?.name || p.brand || 'Authorized OEM';
export const getProductCategory = (p) => p.categoryId?.name || p.category || 'CAR';

/** Image + name + index, used as the first cell of every catalogue table. */
export function ProductCell({ product: r, fallback }) {
  const fb = fallback || FALLBACK_IMG;
  return (
    <div className="catalog-product-cell">
      <img
        src={getProductImage(r, fb)}
        alt=""
        className="product-table-thumb"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fb;
        }}
      />
      <div className="catalog-product-meta">
        <span className="catalog-product-name">{r.name}</span>
        <span className="catalog-product-sub">
          Index: {r.indexNo || r.sku || 'N/A'} {r.variant ? `· ${r.variant}` : ''}
        </span>
      </div>
    </div>
  );
}

export const CategoryBadge = ({ product }) => (
  <Badge variant="primary" size="sm">{getProductCategory(product)}</Badge>
);

export const PriceCell = ({ product }) => (
  <span className="catalog-price">{formatCurrency(getProductPrice(product))}</span>
);

/**
 * Card view of the catalogue – same data and same look for every role.
 * `renderActions(product)` lets each role add its own buttons (Details / Buy / none).
 */
export default function ProductGrid({
  products = [],
  loading = false,
  fallback,
  renderActions,
  emptyTitle = 'No products found',
  emptyText = 'Try adjusting your search query or category filter.'
}) {
  if (loading) return <LoadingState message="Loading catalogue..." />;

  if (!products.length) {
    return (
      <div className="catalog-empty">
        <Tag size={36} aria-hidden="true" />
        <h4>{emptyTitle}</h4>
        <p className="muted small">{emptyText}</p>
      </div>
    );
  }

  const fb = fallback || FALLBACK_IMG;
  return (
    <div className="catalog-grid">
      {products.map((p) => {
        const id = p._id || p.id;
        const csd = getProductPrice(p);
        const mrp = getProductMrp(p);
        const savings = mrp > csd ? mrp - csd : 0;
        return (
          <article key={id} className="catalog-card">
            <div className="catalog-card-media">
              <img
                src={getProductImage(p, fb)}
                alt={p.name}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fb;
                }}
              />
            </div>
            <div className="catalog-card-body">
              <div className="catalog-card-tags">
                <CategoryBadge product={p} />
                {p.afdType && <Badge variant="neutral" size="sm">{String(p.afdType).replace('_', '-')}</Badge>}
              </div>
              <span className="catalog-card-brand">{getProductBrand(p)}</span>
              <h3 className="catalog-card-title">{p.name}</h3>
              <span className="catalog-product-sub">Index: {p.indexNo || p.sku || 'N/A'}</span>

              <div className="catalog-card-price">
                <div>
                  <span className="catalog-card-price-label">CSD Concession Price</span>
                  <span className="catalog-price catalog-price-lg">{formatCurrency(csd)}</span>
                </div>
                {/* {savings > 0 && (
                  <div className="catalog-card-save">
                    <s>{formatCurrency(mrp)}</s>
                    <b>Save {formatCurrency(savings)}</b>
                  </div>
                )} */}
              </div>

              {renderActions && <div className="catalog-card-actions">{renderActions(p)}</div>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
