import { apiClient } from './apiClient.js';
import { MOCK_ORDERS } from '../data/mock/orders.mock.js';

let ordersStore = [...MOCK_ORDERS];

export const orderService = {
  async getOrders(filter = {}) {
    let list = [...ordersStore];
    if (filter.beneficiaryId) {
      list = list.filter((o) => o.beneficiaryId === filter.beneficiaryId);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter((o) => o.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.beneficiaryName.toLowerCase().includes(q) ||
          (o.chassisNumber && o.chassisNumber.toLowerCase().includes(q))
      );
    }
    const res = await apiClient.get('/orders', list);
    return res.data;
  },

  async getOrderById(id) {
    const item = ordersStore.find((o) => o.id === id);
    const res = await apiClient.get(`/orders/${id}`, item || null);
    return res.data;
  },

  async updateOrderStatus(id, newStatus, extra = {}) {
    const idx = ordersStore.findIndex((o) => o.id === id);
    if (idx !== -1) {
      const updated = { ...ordersStore[idx], status: newStatus, ...extra };
      ordersStore[idx] = updated;
      const res = await apiClient.put(`/orders/${id}`, updated);
      return res.data;
    }
    throw new Error('Order not found');
  },

  async allocateChassis(id, { chassisNumber, engineNumber, invoiceNumber }) {
    return this.updateOrderStatus(id, 'Allocated', {
      chassisNumber,
      engineNumber,
      invoiceNumber,
      allocatedDate: new Date().toISOString().split('T')[0]
    });
  }
};
