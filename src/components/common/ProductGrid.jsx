import React from 'react';
import { Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import Badge from './Badge.jsx';
import Loader from './Loader.jsx';


export const FALLBACK_IMG = '/assets/maruti1.png';

/** Intelligent category-aware fallback image selector */
export const getCategoryFallback = (p) => {
  const cat = String(p?.categoryId?.code || p?.categoryId?.name || p?.category || '').toUpperCase();
  const name = String(p?.name || '').toUpperCase();
  if (
    cat.includes('BIKE') ||
    cat.includes('TWO') ||
    cat.includes('2') ||
    name.includes('SCOOTER') ||
    name.includes('MOPED') ||
    name.includes('MOTORCYCLE') ||
    name.includes('APACHE') ||
    name.includes('JUPITER') ||
    name.includes('NTORQ') ||
    name.includes('RTR') ||
    name.includes('RONIN') ||
    name.includes('ZEST') ||
    name.includes('RADEON') ||
    name.includes('XL 100')
  ) {
    return '/assets/bullet1.png';
  }
  if (
    cat.includes('WHITE') ||
    cat.includes('GOODS') ||
    cat.includes('APPLIANCE') ||
    cat.includes('AIR CONDITIONER') ||
    cat.includes('AC') ||
    name.includes('SPLIT AC') ||
    name.includes('AIR CONDITIONER') ||
    name.includes('PANASONIC') ||
    name.includes('REFRIGERATOR') ||
    name.includes('FRIDGE') ||
    name.includes('WASHING MACHINE') ||
    name.includes('MICROWAVE') ||
    name.includes('PURIFIER') ||
    name.includes('COOLER') ||
    name.includes('GEYSER')
  ) {
    return '/assets/white_goods1.png';
  }
  return '/assets/maruti1.png';
};

/** Single source of truth for catalogue price / image / brand lookups. */
export const getProductPrice = (p) =>
  Number(p.priceToCustomer || p.price || (p.lo && p.lo < 1000 ? p.lo * 100000 : p.lo) || 0);
export const getProductMrp = (p) => {
  const csd = getProductPrice(p);
  return Number(p.mrp || (p.hi && p.hi < 1000 ? p.hi * 100000 : p.hi) || 0) || csd;
};
export const getProductImage = (p, fallback) => {
  const fb = fallback || getCategoryFallback(p);
  return p?.images?.[0] || p?.imageUrl || p?.image || fb;
};
export const getProductBrand = (p) => p.oemId?.name || p.brandId?.name || p.brand || 'Authorized OEM';
export const getProductCategory = (p) => p.categoryId?.name || p.category || 'CAR';

/** Image + name + index, used as the first cell of every catalogue table. */
export function ProductCell({ product: r, fallback }) {
  const fb = fallback || getCategoryFallback(r);
  return (
    <div className="catalog-product-cell">
      <img
        src={getProductImage(r, fb)}
        alt={r?.name || ''}
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
  if (loading) return <Loader label="Loading catalogue..." />;

  if (!products.length) {
    return (
      <div className="catalog-empty">
        <Tag size={36} aria-hidden="true" />
        <h4>{emptyTitle}</h4>
        <p className="muted small">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {products.map((p) => {
        const id = p._id || p.id;
        const fb = fallback || getCategoryFallback(p);
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
