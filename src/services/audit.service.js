import { apiClient } from './apiClient.js';
import { MOCK_AUDIT_LOGS, MOCK_AUTH_LOGS } from '../data/mock/auditLogs.mock.js';

export const auditService = {
  async getAuditLogs(filter = {}) {
    let list = [...MOCK_AUDIT_LOGS];
    if (filter.module && filter.module !== 'All') {
      list = list.filter((a) => a.module.toLowerCase().includes(filter.module.toLowerCase()));
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter((a) => a.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.user.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.entity.toLowerCase().includes(q)
      );
    }
    const res = await apiClient.get('/audit/logs', list);
    return res.data;
  },

  async getAuthLogs(filter = {}) {
    let list = [...MOCK_AUTH_LOGS];
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.username.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.ip.toLowerCase().includes(q)
      );
    }
    const res = await apiClient.get('/audit/auth-logs', list);
    return res.data;
  }
};
