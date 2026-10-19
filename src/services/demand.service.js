import { apiClient } from './apiClient.js';
import { MOCK_DEMANDS } from '../data/mock/demands.mock.js';

const STORAGE_KEY = 'csd_demands_store';

function getStoredDemands() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }
  return [...MOCK_DEMANDS];
}

function saveStoredDemands(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

let demandsStore = getStoredDemands();

export const demandService = {
  async getDemands(filter = {}) {
    demandsStore = getStoredDemands();
    let list = [...demandsStore];
    if (filter.role === 'beneficiary' && filter.userId) {
      list = list.filter((d) => !d.beneficiaryId || d.beneficiaryId === filter.userId || d.beneficiaryName === 'DEMO');
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter((d) => d.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          (d.productName && d.productName.toLowerCase().includes(q)) ||
          (d.beneficiaryName && d.beneficiaryName.toLowerCase().includes(q))
      );
    }
    const res = await apiClient.get('/demands', list);
    return res.data;
  },

  async getDemandById(id) {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const item = demandsStore.find((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
    const res = await apiClient.get(`/demands/${id}`, item || null);
    return res.data;
  },

  async createDemand(demandData) {
    // Strict client & mock store verification mirroring backend authorization
    const authUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('csd_auth_user') || 'null');
      } catch {
        return null;
      }
    })();

    if (authUser && authUser.role === 'BENEFICIARY') {
      if (!authUser.isEmailVerified) {
        const err = new Error('Email verification required');
        err.status = 403;
        throw err;
      }
      const isApproved = authUser.status === 'Active' || authUser.adminApproval === 'APPROVED' || authUser.verificationStatus === 'APPROVED' || authUser.verificationStatus === 'VERIFIED';
      if (!isApproved) {
        const err = new Error('Beneficiary approval is pending');
        err.status = 403;
        throw err;
      }
    }

    demandsStore = getStoredDemands();
    // Generate CSD manual style demand number e.g. #30-76510
    const prefix = Math.floor(10 + Math.random() * 90);
    const suffix = Math.floor(10000 + Math.random() * 90000);
    const generatedId = `#${prefix}-${suffix}`;

    const newDemand = {
      id: demandData.id || generatedId,
      createdAt: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toISOString(),
      status: demandData.status || 'On hold',
      statusMeaning: demandData.status === 'Processing' ? 'Pending on Depot' : 'Payment Receipts needs to be uploaded',
      paymentStatus: demandData.paymentStatus || 'Pending',
      paymentMethod: demandData.paymentMethod || 'Direct bank transfer',
      paymentDetailsText: demandData.paymentDetailsText || `Payment method ${demandData.paymentMethod || 'Direct bank transfer'}`,
      totalAmount: demandData.csdPrice || demandData.totalAmount || 721826,
      totalText: `₹${(demandData.csdPrice || demandData.totalAmount || 721826).toLocaleString('en-IN')} for 1 item`,
      timeline: [
        {
          step: 'Demand Submitted',
          date: new Date().toLocaleString(),
          status: 'completed',
          note: 'Demand submitted online via CSD AFD Portal'
        },
        {
          step: 'Payment Pending',
          date: demandData.status === 'Processing' ? 'Completed' : 'Pending Upload',
          status: demandData.status === 'Processing' ? 'completed' : 'current',
          note: demandData.status === 'Processing' ? 'Payment processed online' : 'Awaiting beneficiary bank transfer receipt'
        },
        {
          step: 'Processing',
          date: demandData.status === 'Processing' ? 'In Review' : 'Pending',
          status: demandData.status === 'Processing' ? 'current' : 'pending',
          note: 'Pending on Depot sanction'
        },
        {
          step: 'Supply Order Issued',
          date: 'Pending',
          status: 'pending',
          note: 'Pending with URC'
        },
        {
          step: 'Delivery Completed',
          date: 'Pending',
          status: 'pending',
          note: 'Product has been delivered by the dealer'
        }
      ],
      documents: demandData.documents || [
        { name: 'Canteen Card.pdf', size: '1.2 MB', status: 'Uploaded' },
        { name: 'PAN Copy.pdf', size: '640 KB', status: 'Uploaded' },
        { name: 'Availability Certificate.pdf', size: '1.1 MB', status: 'Uploaded' }
      ],
      ...demandData
    };
    demandsStore = [newDemand, ...demandsStore];
    saveStoredDemands(demandsStore);
    const res = await apiClient.post('/demands', newDemand);
    return res.data;
  },

  async updateDemandPayment(id, paymentData) {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const idx = demandsStore.findIndex((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
    if (idx !== -1) {
      const item = {
        ...demandsStore[idx],
        status: 'Processing',
        statusMeaning: 'Pending on Depot',
        paymentStatus: 'Verified',
        paymentData,
        updatedAt: new Date().toISOString()
      };
      item.timeline = [
        ...item.timeline.map((t) => t.step === 'Payment Pending' ? { ...t, status: 'completed', date: new Date().toLocaleString() } : t),
        {
          step: 'Payment Details Submitted',
          date: new Date().toLocaleString(),
          status: 'completed',
          note: `UTR: ${paymentData.utrNumber || 'N/A'}, Bank: ${paymentData.bankName || 'N/A'}`
        }
      ];
      demandsStore[idx] = item;
      saveStoredDemands(demandsStore);
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  },

  async updateDemandStatus(id, newStatus, note = '') {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const idx = demandsStore.findIndex((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
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
      saveStoredDemands(demandsStore);
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  },

  async cancelDemand(id, reason = 'Cancelled by applicant') {
    return this.updateDemandStatus(id, 'Cancelled', reason);
  },

  async recordCsdPayment(id, csdPaymentData) {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const idx = demandsStore.findIndex((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
    if (idx !== -1) {
      const item = {
        ...demandsStore[idx],
        csdPayment: {
          ...csdPaymentData,
          recordedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };
      item.timeline = [
        ...item.timeline,
        {
          step: 'Payment Details Recorded by CSD',
          date: new Date().toLocaleString(),
          status: 'completed',
          note: `OR No: ${csdPaymentData.orNumber || 'N/A'}, Amount: ₹${Number(csdPaymentData.totalAmountReceived || 0).toLocaleString('en-IN')}`
        }
      ];
      demandsStore[idx] = item;
      saveStoredDemands(demandsStore);
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  },

  async uploadSupplyOrderDocs(id, docsData) {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const idx = demandsStore.findIndex((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
    if (idx !== -1) {
      const item = {
        ...demandsStore[idx],
        supplyOrderDocs: {
          ...docsData,
          uploadedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };
      item.timeline = [
        ...item.timeline,
        {
          step: 'Local Supply Order Uploaded',
          date: new Date().toLocaleString(),
          status: 'completed',
          note: 'Official Receipt, Supply Order and Authority Letter uploaded from ICDS'
        }
      ];
      demandsStore[idx] = item;
      saveStoredDemands(demandsStore);
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  },

  async approveDepotOrder(id, note = 'Approved by Depot Manager') {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const idx = demandsStore.findIndex((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
    if (idx !== -1) {
      const item = {
        ...demandsStore[idx],
        status: 'Supply Order Issued.',
        statusMeaning: 'Now, the URC will take the order forward.',
        updatedAt: new Date().toISOString()
      };
      item.timeline = item.timeline.map((t) => {
        if (t.step === 'Supply Order Issued') {
          return { ...t, status: 'completed', date: new Date().toLocaleDateString('en-GB'), note: 'Supply Order Issued by Depot. Handed over to URC.' };
        }
        return t;
      });
      item.timeline.push({
        step: 'Supply Order Issued.',
        date: new Date().toLocaleString(),
        status: 'completed',
        note
      });
      demandsStore[idx] = item;
      saveStoredDemands(demandsStore);
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  },

  async rejectDepotOrder(id, reason = 'Discrepancy in verification checks') {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const idx = demandsStore.findIndex((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
    if (idx !== -1) {
      const item = {
        ...demandsStore[idx],
        status: 'Rejected',
        statusMeaning: 'Payment will be refunded upon rejection.',
        updatedAt: new Date().toISOString()
      };
      item.timeline.push({
        step: 'Order Rejected by Depot',
        date: new Date().toLocaleString(),
        status: 'completed',
        note: `Reason: ${reason}. Payment will be refunded.`
      });
      demandsStore[idx] = item;
      saveStoredDemands(demandsStore);
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  },

  async addDepotNote(id, noteText, author = 'Depot Official') {
    demandsStore = getStoredDemands();
    const cleanId = id.startsWith('#') ? id : `#${id}`;
    const idx = demandsStore.findIndex((d) => d.id === id || d.id === cleanId || d.id.replace('#', '') === id.replace('#', ''));
    if (idx !== -1) {
      const currentNotes = Array.isArray(demandsStore[idx].depotNotes) ? demandsStore[idx].depotNotes : [];
      const item = {
        ...demandsStore[idx],
        depotNotes: [
          ...currentNotes,
          { text: noteText, author, date: new Date().toLocaleString() }
        ],
        updatedAt: new Date().toISOString()
      };
      demandsStore[idx] = item;
      saveStoredDemands(demandsStore);
      const res = await apiClient.put(`/demands/${id}`, item);
      return res.data;
    }
    throw new Error('Demand not found');
  }
};
