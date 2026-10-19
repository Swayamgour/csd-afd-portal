import { apiClient } from './apiClient.js';
import { MASTER_ROLES } from '../permissions/roles.js';

export const roleService = {
  /**
   * Fetch all roles from master collection / API
   */
  async getRoles() {
    const res = await apiClient.get('/roles', MASTER_ROLES);
    return res.data || MASTER_ROLES;
  },

  /**
   * Fetch role details by role key or code
   */
  async getRoleByCode(code) {
    const role = MASTER_ROLES.find(r => r.code === code || r.id === code);
    const res = await apiClient.get(`/roles/${code}`, role || null);
    return res.data;
  },

  /**
   * Get roles grouped by category for structured dropdowns
   */
  async getCategorizedRoles() {
    const roles = await this.getRoles();
    const categories = {};
    roles.forEach(r => {
      const cat = r.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(r);
    });
    return categories;
  }
};

export default roleService;
