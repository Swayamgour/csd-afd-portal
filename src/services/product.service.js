import { apiClient } from './apiClient.js';
import { products as baseProducts } from '../data/products.js';

let productStore = [...baseProducts];

export const productService = {
  async getProducts(filter = {}) {
    let list = [...productStore];
    if (filter.category && filter.category !== 'all') {
      list = list.filter((p) => p.category === filter.category);
    }
    if (filter.brand && filter.brand !== 'All') {
      list = list.filter((p) => p.brand.toLowerCase() === filter.brand.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.type && p.type.toLowerCase().includes(q))
      );
    }
    const res = await apiClient.get('/products', list);
    return res.data;
  },

  async getProductById(id) {
    const item = productStore.find((p) => p.id === id);
    const res = await apiClient.get(`/products/${id}`, item || null);
    return res.data;
  },

  async createProduct(productData) {
    const newProduct = {
      id: productData.id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 4.5,
      reviews: 1,
      ...productData
    };
    productStore = [newProduct, ...productStore];
    const res = await apiClient.post('/products', newProduct);
    return res.data;
  },

  async updateProduct(id, updateData) {
    const idx = productStore.findIndex((p) => p.id === id);
    if (idx !== -1) {
      productStore[idx] = { ...productStore[idx], ...updateData };
      const res = await apiClient.put(`/products/${id}`, productStore[idx]);
      return res.data;
    }
    throw new Error('Product not found');
  },

  async deleteProduct(id) {
    productStore = productStore.filter((p) => p.id !== id);
    await apiClient.delete(`/products/${id}`);
    return true;
  }
};
