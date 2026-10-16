import { apiClient } from './apiClient.js';
import { MOCK_CIRCULARS, MOCK_BANNERS, MOCK_DEPOTS, MOCK_OEMS, MOCK_DEALERS } from '../data/mock/content.mock.js';

let circularsStore = [...MOCK_CIRCULARS];
let bannersStore = [...MOCK_BANNERS];

export const contentService = {
  async getCirculars() {
    const res = await apiClient.get('/content/circulars', circularsStore);
    return res.data;
  },

  async getBanners() {
    const res = await apiClient.get('/content/banners', bannersStore);
    return res.data;
  },

  async getDepots() {
    const res = await apiClient.get('/content/depots', MOCK_DEPOTS);
    return res.data;
  },

  async getOems() {
    const res = await apiClient.get('/content/oems', MOCK_OEMS);
    return res.data;
  },

  async getDealers() {
    const res = await apiClient.get('/content/dealers', MOCK_DEALERS);
    return res.data;
  },

  async createCircular(circular) {
    const newCir = {
      id: `CIR-2024-${Math.floor(200 + Math.random() * 800)}`,
      publishedDate: new Date().toISOString().split('T')[0],
      status: 'Published',
      ...circular
    };
    circularsStore = [newCir, ...circularsStore];
    const res = await apiClient.post('/content/circulars', newCir);
    return res.data;
  }
};
