import { apiClient } from './apiClient.js';
import { MOCK_PAYMENTS } from '../data/mock/orders.mock.js';

let paymentsStore = [...MOCK_PAYMENTS];

export const paymentService = {
  async getPayments(filter = {}) {
    let list = [...paymentsStore];
    if (filter.status && filter.status !== 'All') {
      list = list.filter((p) => p.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.demandId.toLowerCase().includes(q) ||
          p.beneficiaryName.toLowerCase().includes(q) ||
          p.transactionRef.toLowerCase().includes(q)
      );
    }
    const res = await apiClient.get('/payments', list);
    return res.data;
  },

  async verifyPayment(paymentId, verifiedBy = 'Accounts Officer') {
    const idx = paymentsStore.findIndex((p) => p.id === paymentId);
    if (idx !== -1) {
      paymentsStore[idx] = {
        ...paymentsStore[idx],
        status: 'Verified',
        verifiedBy,
        verifiedAt: new Date().toISOString()
      };
      const res = await apiClient.put(`/payments/${paymentId}`, paymentsStore[idx]);
      return res.data;
    }
    throw new Error('Payment record not found');
  },

  async recordPayment(paymentData) {
    const newRecord = {
      id: `PAY-2024-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleString(),
      status: 'Pending',
      ...paymentData
    };
    paymentsStore = [newRecord, ...paymentsStore];
    const res = await apiClient.post('/payments', newRecord);
    return res.data;
  }
};
