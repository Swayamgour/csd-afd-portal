// Central data access layer connecting to live Express/MongoDB Backend APIs
import { products as fallbackProducts } from './products.js';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export function mapBackendProduct(p) {
  if (!p) return null;

  // 1. Category extraction (handles populated categoryId object or flat category string/code)
  const catObj = p.categoryId || p.category;
  const rawCat = (
    catObj?.code ||
    catObj?.name ||
    catObj?.slug ||
    (typeof catObj === 'string' ? catObj : '') ||
    ''
  ).toLowerCase();

  let normCat = 'car';
  if (rawCat.includes('bike') || rawCat.includes('2-wheel') || rawCat.includes('motorcycle')) {
    normCat = 'bike';
  } else if (rawCat.includes('white') || rawCat.includes('appliance') || p.afdType === 'AFD_II') {
    normCat = 'white-goods';
  } else if (rawCat.includes('car') || rawCat.includes('4-wheel') || p.afdType === 'AFD_I') {
    normCat = 'car';
  }

  // 2. Brand extraction (handles populated brandId object or flat brand)
  const brandObj = p.brandId || p.brand;
  const brandName =
    brandObj?.name ||
    brandObj?.code ||
    (typeof brandObj === 'string' ? brandObj : '') ||
    p.oemId?.name ||
    'CSD AFD';

  // 3. Pricing
  const rawPrice = Number(p.priceToCustomer || p.price || p.csdFinalPriceWithConcession || p.basicPrice || 0);
  const rawMrp = Number(p.mrp || (rawPrice ? Math.round(rawPrice * 1.15) : 0));

  // Catalog expects `lo` & `hi` in Lakhs for vehicles (e.g. 14.53 for ₹14.53 Lakh), and INR for white-goods (e.g. 21990)
  const lo = normCat === 'white-goods' ? rawPrice : Number((rawPrice / 100000).toFixed(2));
  const hi = normCat === 'white-goods' ? rawMrp : Number((rawMrp / 100000).toFixed(2));

  // 4. Fuel
  let fuelArr = [];
  const rawFuel = p.fuelType || p.attributes?.fuel || (Array.isArray(p.fuel) ? p.fuel[0] : p.fuel);
  if (rawFuel) {
    const fLower = String(rawFuel).toLowerCase();
    if (fLower.includes('petrol')) fuelArr = ['Petrol'];
    else if (fLower.includes('diesel')) fuelArr = ['Diesel'];
    else if (fLower.includes('ev') || fLower.includes('elect')) fuelArr = ['Electric'];
    else if (fLower.includes('cng')) fuelArr = ['CNG'];
    else fuelArr = [rawFuel];
  } else {
    fuelArr = normCat === 'car' ? ['Petrol'] : normCat === 'bike' ? ['Petrol'] : [];
  }

  // 5. Transmission
  let transVal = 'Manual';
  const rawTrans = String(
    p.attributes?.transmission || p.specifications?.transmission || p.trans || ''
  ).toLowerCase();
  if (rawTrans.includes('auto') && rawTrans.includes('man')) {
    transVal = 'Manual / Automatic';
  } else if (rawTrans.includes('auto')) {
    transVal = 'Automatic';
  } else if (rawTrans.includes('man')) {
    transVal = 'Manual';
  } else if (p.attributes?.transmission) {
    transVal = p.attributes.transmission;
  }

  // 6. Body Type / Vehicle Type
  let typeVal = p.attributes?.type || p.specifications?.bodyType || p.type;
  if (!typeVal) {
    const searchContext = `${p.name} ${p.description || ''} ${p.variant || ''}`.toLowerCase();
    if (normCat === 'car') {
      if (searchContext.includes('hatchback') || searchContext.includes('swift') || searchContext.includes('alto')) {
        typeVal = 'Hatchback';
      } else if (searchContext.includes('sedan') || searchContext.includes('dzire')) {
        typeVal = 'Sedan';
      } else {
        typeVal = 'SUV';
      }
    } else if (normCat === 'bike') {
      if (searchContext.includes('cruiser') || searchContext.includes('classic') || searchContext.includes('bullet')) {
        typeVal = 'Cruiser';
      } else if (searchContext.includes('roadster') || searchContext.includes('hunter')) {
        typeVal = 'Roadster';
      } else {
        typeVal = 'Commuter';
      }
    } else {
      typeVal = p.attributes?.type || 'Double Door';
    }
  }

  // 7. Images
  const imgList = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : p.image
    ? [p.image]
    : [normCat === 'white-goods' ? '/assets/white_goods1.png' : normCat === 'bike' ? '/assets/bullet1.png' : '/assets/maruti1.png'];

  return {
    id: String(p._id || p.id),
    sku: p.indexNo || p.sku || '',
    indexNo: p.indexNo || p.sku || '',
    name: p.name,
    brand: brandName,
    category: normCat,
    type: typeVal,
    fuel: fuelArr,
    trans: transVal,
    rating: p.rating || 4.5,
    reviews: p.reviews || 120,
    lo: lo || (normCat === 'white-goods' ? 20000 : 5.0),
    hi: hi || (normCat === 'white-goods' ? 25000 : 6.5),
    price: rawPrice,
    mrp: rawMrp,
    discount: p.csdDiscountPercent || (rawMrp > rawPrice ? Math.round(((rawMrp - rawPrice) / rawMrp) * 100) : 0),
    image: imgList[0],
    images: imgList,
    description: p.description || '',
    dealerRefName: p.dealerRefName,
    priceListRef: p.priceListRef,
    variant: p.variant,
    raw: p
  };
}

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products?limit=100`);
    if (res.ok) {
      const data = await res.json();
      const list = data?.data || data?.products || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapBackendProduct).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('[fetchProducts] Falling back to catalog cache:', err);
  }
  return fallbackProducts;
}

export async function fetchProduct(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      const p = data?.data || data;
      if (p && (p._id || p.id)) {
        return mapBackendProduct(p);
      }
    }
  } catch (err) {
    console.warn('[fetchProduct] Falling back to catalog cache:', err);
  }
  return fallbackProducts.find((p) => p.id === id) || null;
}

