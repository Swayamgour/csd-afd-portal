import { apiClient } from './apiClient.js';

const STORAGE_KEY = 'csd_demands_store';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Auto-purge any stale mock demands from browser local storage
try {
  const rawCache = localStorage.getItem(STORAGE_KEY);
  if (rawCache && (rawCache.includes('#40000-117921') || rawCache.includes('mydealer') || rawCache.includes('Jammu and Kashmir'))) {
    localStorage.removeItem(STORAGE_KEY);
  }
} catch {}

function getStoredDemands() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out all legacy static mock records
        const clean = parsed.filter(
          (d) =>
            !String(d.id || '').startsWith('#') &&
            d.beneficiaryId !== 'USR-BEN-001' &&
            d.beneficiaryId !== 'USR-BEN-117' &&
            d.dealer !== 'mydealer' &&
            d.depot !== 'Mydepot' &&
            d.priceZone !== 'Jammu and Kashmir' &&
            d.username !== 'mytest1234' &&
            d.username !== 'DEMO'
        );
        return clean;
      }
    }
  } catch (e) {
    // fallback
  }
  return [];
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
    // Attempt live fetch from Backend REST API
    try {
      const token = localStorage.getItem('csd_auth_token');
      const res = await fetch(`${API_BASE}/demands`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        const serverItems = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.items) ? json.data.items : []);
        // Normalize backend MongoDB demands to match UI format
        const mappedServer = serverItems.map((d) => {
          const bName = d.beneficiaryId?.fullName || d.userId?.name || d.beneficiaryName || d.username || 'Applicant';
          const uName = d.userId?.username || d.username || 'beneficiary';
          const pName = d.productId?.name || d.productSnapshot?.name || d.productName || 'Selected Vehicle/Item';
          const skuCode = d.productId?.sku || d.productSnapshot?.sku || d.sku || 'AFD-INDEX';
          const dName = d.dealerId?.name || (typeof d.dealerId === 'string' ? d.dealerId : null) || d.dealer || 'Authorized Dealership';
          const depName = d.depotId?.name || (typeof d.depotId === 'string' ? d.depotId : null) || d.depot || 'Regional Depot';
          const urcName = d.urcId?.name || (typeof d.urcId === 'string' ? d.urcId : null) || d.urc || 'Base Canteen';
          const dNumber = d.demandNo || d.demandNumber || d._id;
          const amt = Number(d.totalAmount || d.pricing?.totalPrice || d.unitPrice || 0);

          return {
            _id: d._id,
            id: dNumber,
            demandNo: dNumber,
            demandNumber: dNumber,
            beneficiaryName: bName,
            username: uName,
            beneficiaryRank: d.beneficiaryId?.rank || 'Staff/Defence',
            beneficiaryServiceNo: d.beneficiaryId?.serviceNumber || 'JC-765432X',
            productName: pName,
            productIndexNo: skuCode,
            sku: skuCode,
            color: d.selectedColor || d.color || 'Standard',
            selectedColor: d.selectedColor || d.color || 'Standard',
            priceZone: d.priceZone || 'DELHI NCR',
            dealer: dName,
            dealerAddress: d.dealerId?.address || '',
            dealerCode: d.dealerId?.code || '',
            depot: depName,
            urc: urcName,
            totalAmount: amt,
            csdPrice: amt,
            status: d.status === 'SUPPLY_ORDER_ISSUED' ? 'Supply Order Issued.' : (d.status === 'APPROVED' ? 'Approved' : (d.status === 'PROCESSING' ? 'Processing' : d.status)),
            statusMeaning: d.status === 'SUPPLY_ORDER_ISSUED' ? 'Supply Order Issued. Handed over to URC.' : (d.status === 'APPROVED' ? 'Approved by Depot' : 'Pending Action'),
            depotId: d.depotId?._id || d.depotId,
            dealerId: d.dealerId?._id || d.dealerId,
            urcId: d.urcId?._id || d.urcId,
            beneficiaryPayment: d.beneficiaryPayment || {
              bank: d.loan?.isLoan ? (d.loan?.bankName || 'Bank Loan / Sanction') : (d.paymentMethod || 'Direct bank transfer (SBI)'),
              firstAccountHolder: bName,
              accountNumber: d.beneficiaryId?.cardId ? `XXXX-XXXX-${d.beneficiaryId.cardId.slice(-4)}` : 'XXXX-XXXX-9842',
              ifsc: 'SBIN0000691',
              utr: d.utrNumber || (d.demandNo ? `UTR-SBI-${d.demandNo.replace(/\D/g, '')}` : 'UTR984210'),
              amountPaid: amt,
              dateOfPayment: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : 'Recent'
            },
            timeline: d.timeline || [
              { step: 'Demand Generated', date: new Date(d.createdAt || Date.now()).toLocaleDateString('en-GB'), status: 'completed' },
              { step: 'Processing', date: 'In Progress', status: 'completed' },
              { step: 'Supply Order Issued', date: d.status === 'SUPPLY_ORDER_ISSUED' ? 'Issued' : 'Pending', status: d.status === 'SUPPLY_ORDER_ISSUED' ? 'completed' : 'pending' }
            ],
            ...d
          };
        });

        demandsStore = mappedServer;
        saveStoredDemands(mappedServer);
        return mappedServer;
      }
    } catch (e) {
      console.warn('Backend demands fetch failed, checking local store', e);
    }

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
          (d.id && d.id.toLowerCase().includes(q)) ||
          (d.demandNumber && d.demandNumber.toLowerCase().includes(q)) ||
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

      // Attempt live backend update
      try {
        const token = localStorage.getItem('csd_auth_token');
        const targetServerId = item._id || id;
        await fetch(`${API_BASE}/demands/${targetServerId}/payment-details`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(csdPaymentData)
        });
      } catch (err) {
        console.warn('Backend payment-details failed', err);
      }

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

      // Attempt live backend update
      try {
        const token = localStorage.getItem('csd_auth_token');
        const targetServerId = item._id || id;
        await fetch(`${API_BASE}/demands/${targetServerId}/approve`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ remarks: note })
        });
      } catch (err) {
        console.warn('Backend approve call failed', err);
      }

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

      // Attempt live backend update
      try {
        const token = localStorage.getItem('csd_auth_token');
        const targetServerId = item._id || id;
        await fetch(`${API_BASE}/demands/${targetServerId}/reject`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ reason })
        });
      } catch (err) {
        console.warn('Backend reject call failed', err);
      }

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
