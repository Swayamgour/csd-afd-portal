// Data access helpers for the public storefront.
// NO static / fallback data here: whatever the server returns is what the UI shows.
// Components should use `useStoreProducts()` (RTK Query, one shared request).
// All network calls live in src/redux/api/*.

import { API_ORIGIN } from '../config/env.js';

const str = (v) => (v === null || v === undefined ? '' : String(v));
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function mapBackendProduct(p) {
  if (!p) return null;

  // 1. Category (populated categoryId object or flat string) -> car | bike | white-goods
  const catObj = p.categoryId || p.category;
  const rawCat = str(
    catObj?.code || catObj?.name || catObj?.slug || (typeof catObj === 'string' ? catObj : '')
  ).toLowerCase();

  let category = 'car';
  if (rawCat.includes('bike') || rawCat.includes('2-wheel') || rawCat.includes('motorcycle')) {
    category = 'bike';
  } else if (rawCat.includes('white') || rawCat.includes('appliance') || p.afdType === 'AFD_II') {
    category = 'white-goods';
  }

  // 2. Brand exactly as the server sends it
  const brandObj = p.brandId || p.brand;
  const brand = str(
    brandObj?.name || brandObj?.code || (typeof brandObj === 'string' ? brandObj : '') || p.oemId?.name
  );

  // 3. Pricing (null when the server has no price)
  const price = num(p.priceToCustomer ?? p.price ?? p.csdFinalPriceWithConcession ?? p.basicPrice);
  const minPrice = num(p.minPrice ?? p.priceMin ?? p.priceRange?.min ?? p.fromPrice);
  const maxPrice = num(p.maxPrice ?? p.priceMax ?? p.priceRange?.max ?? p.toPrice);
  const mrp = num(p.mrp);
  const isAppliance = category === 'white-goods';
  const toUnit = (v) => (v === null ? null : isAppliance ? v : Number((v / 100000).toFixed(2)));
  const lo = toUnit(price);
  const hi = toUnit(mrp) ?? lo;
  const discount =
    num(p.csdDiscountPercent) ??
    (price && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

  // 4. Fuel (only if the server sent it)
  let fuel = [];
  const rawFuel = p.fuelType || p.attributes?.fuel || (Array.isArray(p.fuel) ? p.fuel[0] : p.fuel);
  if (rawFuel) {
    const f = String(rawFuel).toLowerCase();
    if (f.includes('petrol')) fuel = ['Petrol'];
    else if (f.includes('diesel')) fuel = ['Diesel'];
    else if (f.includes('ev') || f.includes('elect')) fuel = ['EV'];
    else if (f.includes('cng')) fuel = ['CNG'];
    else fuel = [String(rawFuel)];
  }

  // 5. Transmission (only if the server sent it)
  const rawTrans = str(p.attributes?.transmission || p.specifications?.transmission || p.transmission || p.trans);
  const t = rawTrans.toLowerCase();
  let trans = '';
  if (t.includes('auto') && t.includes('man')) trans = 'Manual / Automatic';
  else if (t.includes('auto')) trans = 'Automatic';
  else if (t.includes('man')) trans = 'Manual';
  else trans = rawTrans;

  // 6. Type / body type - server value only
  const type = str(p.attributes?.type || p.specifications?.bodyType || p.type);

  // 7. Images - server values only (support relative /api/v1/files and /uploads paths)
  const resolveImg = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
      return `${API_ORIGIN || ''}${url}`;
    }
    return url;
  };

  const rawImages = Array.isArray(p.images) && p.images.length
    ? p.images.filter(Boolean)
    : (p.imageUrl ? [p.imageUrl] : (p.image ? [p.image] : []));
  const images = rawImages.map(resolveImg).filter(Boolean);

  return {
    id: str(p._id || p.id),
    sku: str(p.sku || p.indexNo),
    indexNo: str(p.indexNo || p.sku),
    mfrCode: str(p.mfrCode || p.mfr || p.manufacturerCode || p.firmCode || p.attributes?.mfrCode || p.specifications?.mfrCode),
    firmCode: str(p.firmCode || p.oemId?.code),
    nomenclature: str(p.nomenclature),
    name: str(p.name),
    brand,
    category,
    type,
    fuel,
    trans,
    rating: num(p.rating),
    reviews: num(p.reviews),
    lo,
    hi,
    price,
    minPrice,
    maxPrice,
    priceToCustomer: price,
    concessionalPrice: price,
    mrp,
    discount,
    image: images[0] || '',
    images,
    description: str(p.description),
    dealerRefName: p.dealerRefName,
    priceListRef: p.priceListRef,
    variant: p.variant,
    raw: p,
  };
}
