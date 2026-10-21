import { apiClient } from './apiClient.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let ordersStore = [];

export const orderService = {
  async getOrders(filter = {}) {
    try {
      const token = localStorage.getItem('csd_auth_token');
      const res = await fetch(`${API_BASE}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        const serverItems = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.items) ? json.data.items : []);
        const mapped = serverItems.map((o) => ({
          _id: o._id,
          id: o.orderNo || o._id,
          orderNo: o.orderNo || o._id,
          demandId: o.demandId,
          beneficiaryName: o.beneficiaryId?.fullName || o.beneficiaryId?.name || 'Applicant',
          productName: o.items?.[0]?.name || 'AFD Product',
          sku: o.items?.[0]?.sku || 'AFD-SKU',
          amount: o.amount || 0,
          csdPrice: o.amount || 0,
          status: o.status || 'PLACED',
          dealer: o.dealerId?.name || 'Authorized Dealership',
          depot: o.depotId?.name || 'Regional Depot',
          createdAt: o.createdAt,
          ...o
        }));
        ordersStore = mapped;
        return mapped;
      }
    } catch (e) {
      console.warn('Orders live fetch failed, checking local store', e);
    }

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
