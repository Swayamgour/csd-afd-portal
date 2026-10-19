import { apiClient } from './apiClient.js';

export const auditService = {
  async getAuditLogs(filter = {}) {
    try {
      const token = localStorage.getItem('csd_auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/audit?limit=${filter.limit || 10}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        if (Array.isArray(items)) {
          return {
            data: items.map((l) => ({
              id: l._id || l.id,
              action: l.action || 'MUTATION',
              user: l.userName || l.user || 'Administrator',
              module: l.module || l.entityType || 'SYSTEM',
              ip: l.ip || '127.0.0.1',
              status: l.status || 'SUCCESS',
              timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString() : new Date().toLocaleString()
            }))
          };
        }
      }
    } catch (e) {
      // Backend offline or error
    }
    return { data: [] }; // No dummy mock logs
  },

  async getAuthLogs(filter = {}) {
    try {
      const token = localStorage.getItem('csd_auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/audit/auth-logs?limit=${filter.limit || 10}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        if (Array.isArray(items)) {
          return {
            data: items.map((l) => ({
              id: l._id || l.id,
              username: l.identifier || l.username || 'User',
              name: l.userId?.name || l.name || l.identifier || 'User',
              ip: l.ip || '127.0.0.1',
              event: l.event || (l.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED'),
              timestamp: l.at ? new Date(l.at).toLocaleString() : new Date().toLocaleString()
            }))
          };
        }
      }
    } catch (e) {
      // Backend offline or error
    }
    return { data: [] }; // No dummy mock logs
  }
};

export default auditService;
