// Central data access layer connecting to live Express/MongoDB Backend APIs
import { products as fallbackProducts } from './products.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products?limit=100`);
    if (res.ok) {
      const data = await res.json();
      const list = data?.data || data?.products || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((p) => {
          const rawCat = (p.category?.code || p.category?.slug || p.category || '').toLowerCase();
          const normCat = rawCat.includes('car') ? 'car' : rawCat.includes('bike') ? 'bike' : 'white-goods';
          const brandName = p.brand?.name || p.brand || 'CSD AFD';
          const rawPrice = Number(p.price || 0);
          const rawMrp = Number(p.mrp || rawPrice * 1.15);
          
          // lo is stored in Lakhs for car/bike in Catalog filtering or INR for white-goods
          const lo = normCat === 'white-goods' ? rawPrice : Number((rawPrice / 100000).toFixed(2));
          const hi = normCat === 'white-goods' ? rawMrp : Number((rawMrp / 100000).toFixed(2));

          return {
            id: p._id || p.id,
            name: p.name,
            brand: brandName,
            category: normCat,
            type: p.specifications?.bodyType || p.type || 'Standard',
            fuel: p.specifications?.fuelType ? [p.specifications.fuelType] : (p.fuel || ['Petrol']),
            trans: p.specifications?.transmission || p.trans || 'Manual / Automatic',
            rating: p.rating || 4.5,
            reviews: p.reviews || 120,
            lo: lo || 5.0,
            hi: hi || 6.5,
            price: rawPrice,
            image: p.images?.[0] || p.image || '/assets/placeholder.png',
            images: p.images || [p.image || '/assets/placeholder.png'],
            raw: p
          };
        });
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
        const rawCat = (p.category?.code || p.category?.slug || p.category || '').toLowerCase();
        const normCat = rawCat.includes('car') ? 'car' : rawCat.includes('bike') ? 'bike' : 'white-goods';
        const brandName = p.brand?.name || p.brand || 'CSD AFD';
        const rawPrice = Number(p.price || 0);
        const rawMrp = Number(p.mrp || rawPrice * 1.15);
        const lo = normCat === 'white-goods' ? rawPrice : Number((rawPrice / 100000).toFixed(2));
        const hi = normCat === 'white-goods' ? rawMrp : Number((rawMrp / 100000).toFixed(2));

        return {
          id: p._id || p.id,
          name: p.name,
          brand: brandName,
          category: normCat,
          type: p.specifications?.bodyType || p.type || 'Standard',
          fuel: p.specifications?.fuelType ? [p.specifications.fuelType] : (p.fuel || ['Petrol']),
          trans: p.specifications?.transmission || p.trans || 'Manual / Automatic',
          rating: p.rating || 4.5,
          reviews: p.reviews || 120,
          lo: lo || 5.0,
          hi: hi || 6.5,
          price: rawPrice,
          image: p.images?.[0] || p.image || '/assets/placeholder.png',
          images: p.images || [p.image || '/assets/placeholder.png'],
          specifications: p.specifications,
          raw: p
        };
      }
    }
  } catch (err) {
    console.warn('[fetchProduct] Falling back to catalog cache:', err);
  }
  return fallbackProducts.find((p) => p.id === id) || null;
}
