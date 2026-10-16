import { apiClient } from './apiClient.js';
import { MOCK_DEMANDS } from '../data/mock/demands.mock.js';

let demandsStore = [...MOCK_DEMANDS];

export const demandService = {
  async getDemands(filter = {}) {
    let list = [...demandsStore];
    if (filter.role === 'beneficiary' && filter.userId) {
      list = list.filter((d) => d.beneficiaryId === filter.userId);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter((d) => d.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.productName.toLowerCase().includes(q) ||
          d.beneficiaryName.toLowerCase().includes(q)
      );
    }
    const res = await apiClient.get('/demands', list);
    return res.data;
  },

  async getDemandById(id) {
    const item = demandsStore.find((d) => d.id === id);
    const res = await apiClient.get(`/demands/${id}`, item || null);
    return res.data;
  },

  async createDemand(demandData) {
    const newDemand = {
      id: `AFD-DEM-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Submitted',
      paymentStatus: 'Not_Initiated',
      timeline: [
        {
          step: 'Demand Created',
          date: new Date().toLocaleString(),
          status: 'completed',
          note: 'Demand submitted by beneficiary online'
        },
        {
          step: 'URC Verification',
          date: 'Pending',
          status: 'current',
          note: 'Awaiting review by parent URC Officer'
        }
      ],
      documents: demandData.documents || [
        { name: 'Availment Certificate.pdf', size: '1.2 MB', status: 'Pending Review' }
      ],
      ...demandData
    };
    demandsStore = [newDemand, ...demandsStore];
    const res = await apiClient.post('/demands', newDemand);
    return res.data;
  },

  async updateDemandStatus(id, newStatus, note = '') {
    const idx = demandsStore.findIndex((d) => d.id === id);
    if (idx !== -1) {
      const item = { ...demandsStore[idx], status: newStatus, updatedAt: new Date().toISOString() };
      item.timeline = [
        ...item.timeline,
        {
          step: `Status changed to ${newStatus}`,
          date: new Date().toLocaleString(),
          status: 'completed',
          note
        }
      ];
      demandsStore[idx] = item;
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  },

  async cancelDemand(id, reason = 'Cancelled by applicant') {
    return this.updateDemandStatus(id, 'Cancelled', reason);
  }
};
