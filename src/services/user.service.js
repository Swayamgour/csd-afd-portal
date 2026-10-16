import { apiClient } from './apiClient.js';
import { MOCK_USERS } from '../data/mock/users.mock.js';

let usersStore = [...MOCK_USERS];

export const userService = {
  async getUsers(filter = {}) {
    let list = [...usersStore];
    if (filter.role && filter.role !== 'All') {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter((u) => u.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.serviceNumber && u.serviceNumber.toLowerCase().includes(q))
      );
    }
    const res = await apiClient.get('/users', list);
    return res.data;
  },

  async getUserById(id) {
    const user = usersStore.find((u) => u.id === id);
    const res = await apiClient.get(`/users/${id}`, user || null);
    return res.data;
  },

  async updateUserStatus(id, newStatus) {
    const idx = usersStore.findIndex((u) => u.id === id);
    if (idx !== -1) {
      usersStore[idx] = { ...usersStore[idx], status: newStatus };
      const res = await apiClient.put(`/users/${id}/status`, usersStore[idx]);
      return res.data;
    }
    throw new Error('User not found');
  },

  async updateUser(id, updateData) {
    const idx = usersStore.findIndex((u) => u.id === id);
    if (idx !== -1) {
      usersStore[idx] = { ...usersStore[idx], ...updateData };
      const res = await apiClient.put(`/users/${id}`, usersStore[idx]);
      return res.data;
    }
    throw new Error('User not found');
  },

  async createUser(userData) {
    const newUser = {
      id: `USR-${userData.role ? userData.role.toUpperCase().slice(0, 3) : 'GEN'}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Active',
      ...userData
    };
    usersStore = [newUser, ...usersStore];
    const res = await apiClient.post('/users', newUser);
    return res.data;
  }
};
