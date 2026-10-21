import { apiClient } from './apiClient.js';

export const isMockUser = (u) => false;

/**
 * Client-side cryptographic SHA-256 hash generator
 */
export const hashPassword = async (password) => {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `$sha256$10000$${hex.slice(0, 32)}$${hex}`;
  } catch (e) {
    return `$hash_${btoa(password).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)}`;
  }
};

/**
 * Validates password strength rules
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return 'Password must contain at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter (A-Z)';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter (a-z)';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must include at least one number (0-9)';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must include at least one special character (!@#$%^&* etc.)';
  }
  return null;
};

/**
 * Calculate numerical password score (0-4)
 */
export const calculatePasswordScore = (password = '') => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  return Math.min(score, 4);
};

export const userService = {
  /**
   * Check duplicates directly via backend MongoDB
   */
  async checkDuplicates({ username, email, mobile, cardId, chipNumber, pan }) {
    const conflicts = {};
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/check-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, mobile, cardId, chipNumber, pan })
      });
      if (res.ok) {
        const body = await res.json();
        const serverConflicts = body.data?.conflicts || {};
        Object.assign(conflicts, serverConflicts);
      }
    } catch (e) {
      console.warn('Backend check-duplicates error:', e);
    }

    return {
      available: Object.keys(conflicts).length === 0,
      conflicts
    };
  },

  async checkUsernameExists(username) {
    const res = await this.checkDuplicates({ username });
    return Boolean(res.conflicts?.username);
  },

  async checkEmailExists(email) {
    const res = await this.checkDuplicates({ email });
    return Boolean(res.conflicts?.email);
  },

  /**
   * GET /api/v1/users
   */
  async getUsers(filter = {}) {
    try {
      const token = localStorage.getItem('csd_auth_token');
      const params = new URLSearchParams();
      if (filter.limit) params.set('limit', filter.limit);
      else params.set('limit', '200');
      if (filter.role && filter.role !== 'All' && filter.role !== 'ALL') params.set('role', filter.role);
      if (filter.status && filter.status !== 'All' && filter.status !== 'ALL') params.set('status', filter.status);
      if (filter.search) params.set('q', filter.search);

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        return items.map((su) => {
          const roleNorm = (su.role || 'beneficiary').toLowerCase();
          const isApproved = su.verificationStatus === 'VERIFIED' || su.verificationStatus === 'APPROVED';
          return {
            ...su,
            id: String(su._id || su.id),
            _id: String(su._id || su.id),
            username: su.username || su.email,
            name: su.name,
            email: su.email,
            mobile: su.mobile,
            role: roleNorm,
            status: su.status === 'ACTIVE' ? 'Active' : (su.status === 'LOCKED' ? 'Suspended' : su.status),
            verificationStatus: su.verificationStatus || (roleNorm === 'beneficiary' ? 'PENDING' : 'VERIFIED'),
            adminApproval: isApproved ? 'APPROVED' : (su.verificationStatus === 'REJECTED' ? 'REJECTED' : 'PENDING'),
            cardId: su.cardId || su.beneficiary?.cardId || '',
            chipNumber: su.chipNumber || su.beneficiary?.chipNumber || '',
            employmentStatus: su.employmentStatus || su.beneficiary?.employmentStatus || '',
            organization: su.organization || su.beneficiary?.organization || 'Army',
            isEmailVerified: su.isEmailVerified !== undefined ? su.isEmailVerified : true,
            createdAt: su.createdAt || new Date().toISOString(),
          };
        });
      }
    } catch (e) {
      console.warn('[userService] getUsers failed:', e);
    }
    return [];
  },

  /**
   * GET /api/v1/users/:id
   */
  async getUserById(id) {
    try {
      const token = localStorage.getItem('csd_auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('[userService] getUserById failed:', e);
    }
    return null;
  },

  /**
   * POST /api/v1/users
   */
  async createUser(userData) {
    const token = localStorage.getItem('csd_auth_token');
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        name: [userData.firstName, userData.lastName].filter(Boolean).join(' ') || userData.name || userData.username,
        email: userData.email,
        mobile: userData.mobile ? userData.mobile.replace(/[^0-9]/g, '').slice(-10) : undefined,
        role: String(userData.role || 'DEPOT').toUpperCase(),
        password: userData.password,
      })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create user account');
    }
    return json.data;
  },

  /**
   * PATCH /api/v1/users/:id
   */
  async updateUser(id, updateData) {
    const token = localStorage.getItem('csd_auth_token');
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        name: [updateData.firstName, updateData.lastName].filter(Boolean).join(' ') || updateData.name,
        email: updateData.email,
        mobile: updateData.mobile,
      })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update user profile');
    }
    return json.data;
  },

  /**
   * PATCH /api/v1/users/:id/status
   */
  async updateUserStatus(id, newStatus, reason = '', changedBy = '') {
    const token = localStorage.getItem('csd_auth_token');
    const dbStatus = newStatus === 'Active' ? 'ACTIVE' : (newStatus === 'Denied' || newStatus === 'Suspended' ? 'LOCKED' : newStatus);
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status: dbStatus })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update user status');
    }
    return json.data;
  },

  /**
   * Approval / Rejection for Beneficiaries (CS Director endpoint)
   */
  async approveBeneficiaryUser(id, decision = 'APPROVED', remarks = 'Profile and entitlement verified by CS Director') {
    const isApproved = decision === 'APPROVED' || decision === 'VERIFIED';
    const token = localStorage.getItem('csd_auth_token');
    const endpoint = isApproved ? `/users/${id}/approve` : `/users/${id}/reject`;

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ remarks })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to process beneficiary status');
    }
    return json.data;
  },

  resetToDefaults() {
    return [];
  }
};

export default userService;
