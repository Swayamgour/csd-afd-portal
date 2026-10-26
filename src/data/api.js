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
  let rawBrandName =
    brandObj?.name ||
    brandObj?.code ||
    (typeof brandObj === 'string' ? brandObj : '') ||
    p.oemId?.name ||
    'CSD AFD';

  // Normalize brand names for clean category filtering
  let brandName = rawBrandName;
  const bLower = rawBrandName.toLowerCase();
  if (bLower.includes('maruti')) brandName = 'Maruti';
  else if (bLower.includes('tata')) brandName = 'Tata';
  else if (bLower.includes('mahindra')) brandName = 'Mahindra';
  else if (bLower.includes('hyundai')) brandName = 'Hyundai';
  else if (bLower.includes('toyota')) brandName = 'Toyota';
  else if (bLower.includes('renault')) brandName = 'Renault';
  else if (bLower.includes('royal enfield')) brandName = 'Royal Enfield';
  else if (bLower.includes('hero')) brandName = 'Hero';
  else if (bLower.includes('honda')) brandName = 'Honda';
  else if (bLower.includes('tvs')) brandName = 'TVS';
  else if (bLower.includes('bajaj')) brandName = 'Bajaj';
  else if (bLower.includes('yamaha')) brandName = 'Yamaha';
  else if (bLower.includes('suzuki')) brandName = 'Suzuki';
  else if (bLower.includes('kia')) brandName = 'Kia';
  else if (bLower.includes('skoda')) brandName = 'Skoda';
  else if (bLower.includes('volkswagen')) brandName = 'Volkswagen';
  else if (bLower.includes('ktm')) brandName = 'KTM';
  else if (bLower.includes('jawa')) brandName = 'Jawa';
  else if (bLower.includes('lg')) brandName = 'LG';
  else if (bLower.includes('samsung')) brandName = 'Samsung';
  else if (bLower.includes('whirlpool')) brandName = 'Whirlpool';
  else if (bLower.includes('haier')) brandName = 'Haier';
  else if (bLower.includes('panasonic')) brandName = 'Panasonic';

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
      if (searchContext.includes('hatchback') || searchContext.includes('swift') || searchContext.includes('alto') || searchContext.includes('kwid') || searchContext.includes('baleno') || searchContext.includes('i20') || searchContext.includes('tiago')) {
        typeVal = 'Hatchback';
      } else if (searchContext.includes('sedan') || searchContext.includes('dzire') || searchContext.includes('verna') || searchContext.includes('city') || searchContext.includes('aura') || searchContext.includes('tigor') || searchContext.includes('slavia') || searchContext.includes('virtus') || searchContext.includes('ciaz') || searchContext.includes('amaze')) {
        typeVal = 'Sedan';
      } else {
        typeVal = 'SUV';
      }
    } else if (normCat === 'bike') {
      if (searchContext.includes('cruiser') || searchContext.includes('classic') || searchContext.includes('bullet') || searchContext.includes('meteor') || searchContext.includes('cb350')) {
        typeVal = 'Cruiser';
      } else if (searchContext.includes('roadster') || searchContext.includes('hunter')) {
        typeVal = 'Roadster';
      } else if (searchContext.includes('sport') || searchContext.includes('pulsar') || searchContext.includes('apache') || searchContext.includes('r15') || searchContext.includes('duke') || searchContext.includes('gixxer') || searchContext.includes('xpulse')) {
        typeVal = 'Sports';
      } else if (searchContext.includes('scooter') || searchContext.includes('activa') || searchContext.includes('access') || searchContext.includes('jupiter') || searchContext.includes('chetak')) {
        typeVal = 'Scooter';
      } else {
        typeVal = 'Commuter';
      }
    } else {
      typeVal = p.attributes?.type || 'Double Door';
    }
  } else {
    const tLower = String(typeVal).toLowerCase();
    if (tLower.includes('sedan')) typeVal = 'Sedan';
    else if (tLower.includes('hatch')) typeVal = 'Hatchback';
    else if (tLower.includes('suv')) typeVal = 'SUV';
    else if (tLower.includes('cruiser')) typeVal = 'Cruiser';
    else if (tLower.includes('roadster')) typeVal = 'Roadster';
    else if (tLower.includes('sport')) typeVal = 'Sports';
    else if (tLower.includes('scooter')) typeVal = 'Scooter';
    else if (tLower.includes('commuter')) typeVal = 'Commuter';
  }

  // 7. Images
  const imgList = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : p.image
    ? [p.image]
    : [normCat === 'white-goods' ? '/assets/white_goods1.png' : normCat === 'bike' ? '/assets/bullet1.png' : '/assets/maruti1.png'];

  return {
    id: String(p._id || p.id),
    sku: p.sku || p.indexNo || '',
    indexNo: p.indexNo || p.sku || '',
    mfrCode: p.mfrCode || p.mfr || p.manufacturerCode || p.firmCode || p.attributes?.mfrCode || p.specifications?.mfrCode || '',
    firmCode: p.firmCode || p.oemId?.code || '',
    nomenclature: p.nomenclature || '',
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
    priceToCustomer: rawPrice,
    concessionalPrice: rawPrice,
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

