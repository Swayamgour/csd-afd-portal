import { apiClient } from './apiClient.js';
import { MOCK_NOTIFICATIONS } from '../data/mock/notifications.mock.js';

let notifStore = [...MOCK_NOTIFICATIONS];

export const notificationService = {
  async getNotifications(role = '') {
    let list = [...notifStore];
    if (role) {
      list = list.filter((n) => !n.roleTarget || n.roleTarget.includes(role));
    }
    const res = await apiClient.get('/notifications', list);
    return res.data;
  },

  async markAsRead(id) {
    const idx = notifStore.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notifStore[idx] = { ...notifStore[idx], read: true };
      const res = await apiClient.put(`/notifications/${id}`, notifStore[idx]);
      return res.data;
    }
    throw new Error('Notification not found');
  },

  async markAllAsRead() {
    notifStore = notifStore.map((n) => ({ ...n, read: true }));
    const res = await apiClient.put('/notifications/mark-all', notifStore);
    return res.data;
  }
};
