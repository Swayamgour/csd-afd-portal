import { apiClient } from './apiClient.js';
import { MOCK_NOTIFICATIONS } from '../data/mock/notifications.mock.js';

let notifStore = [...MOCK_NOTIFICATIONS];

export const notificationService = {
  async getNotifications(role = '') {
    try {
      const res = await apiClient.get('/notifications');
      return res.data?.items || res.data || [];
    } catch {
      let list = [...notifStore];
      if (role) {
        list = list.filter((n) => !n.roleTarget || n.roleTarget.includes(role));
      }
      return list;
    }
  },

  async markAsRead(id) {
    try {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data;
    } catch {
      const idx = notifStore.findIndex((n) => n.id === id);
      if (idx !== -1) {
        notifStore[idx] = { ...notifStore[idx], read: true };
        return notifStore[idx];
      }
      throw new Error('Notification not found');
    }
  },

  async markAllAsRead() {
    try {
      const res = await apiClient.patch('/notifications/read-all');
      return res.data;
    } catch {
      notifStore = notifStore.map((n) => ({ ...n, read: true }));
      return notifStore;
    }
  }
};
