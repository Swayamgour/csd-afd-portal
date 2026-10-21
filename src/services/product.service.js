import { fetchProducts, fetchProduct, mapBackendProduct } from '../data/api.js';

export const productService = {
  async getProducts(filter = {}) {
    try {
      const list = await fetchProducts();
      let filtered = [...list];

      if (filter.category && filter.category !== 'all') {
        const cat = filter.category.toLowerCase();
        filtered = filtered.filter((p) => p.category?.toLowerCase() === cat);
      }

      if (filter.brand && filter.brand !== 'All') {
        const b = filter.brand.toLowerCase();
        filtered = filtered.filter((p) => p.brand?.toLowerCase() === b);
      }

      if (filter.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            (p.type && p.type.toLowerCase().includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q))
        );
      }

      return filtered;
    } catch (err) {
      console.error('[productService.getProducts] Error:', err);
      return [];
    }
  },

  async getProductById(id) {
    try {
      return await fetchProduct(id);
    } catch (err) {
      console.error('[productService.getProductById] Error:', err);
      return null;
    }
  },

  async createProduct(productData) {
    const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const json = await res.json();
    return json?.data || json;
  },

  async updateProduct(id, updateData) {
    const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const json = await res.json();
    return json?.data || json;
  },

  async deleteProduct(id) {
    const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
