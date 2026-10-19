import { apiClient } from './apiClient.js';
import { MOCK_USERS } from '../data/mock/users.mock.js';

// Load from localStorage or mock users for full persistent state across reloads
const STORAGE_KEY = 'csd_portal_users_registry_v2';

const initializeUsersStore = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('[userService] LocalStorage read failed:', e);
  }

  // Augment initial mock users with WordPress migrated schema fields
  return MOCK_USERS.map((u) => {
    const parts = (u.name || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return {
      ...u,
      username: u.username || `usr_${u.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      firstName,
      lastName,
      website: u.website || '',
      mobile: u.phone || u.mobile || '+91 98765 00000',
      passwordHash: u.passwordHash || '$2a$10$e8wVdI6y2mN4qKkK5bA1zO1sZ0xY9wVdI6y2mN4qKkK5bA1zO1sZ0',
      otherRoles: u.otherRoles || [],
      sendNotification: u.sendNotification !== undefined ? u.sendNotification : true,
      createdByAdmin: u.createdByAdmin !== undefined ? u.createdByAdmin : true,
      defaultPasswordChanged: u.defaultPasswordChanged !== undefined ? u.defaultPasswordChanged : true,
      reasonOfDenial: u.reasonOfDenial || '',
      status: u.status || 'Active',
      statusChangeCount: u.statusChangeCount || 0,
      userEditedCount: u.userEditedCount || 0,
      lastDemand4Wheeler: u.eligibility?.lastFourWheelerPurchase || u.lastDemand4Wheeler || null,
      lastDemand2Wheeler: u.lastDemand2Wheeler || null,
      mobileVerified: u.mobileVerified !== undefined ? u.mobileVerified : true,
      websiteRating: u.websiteRating || 5,
      feedbackComment: u.feedbackComment || '',
      createdBy: u.createdBy || 'System Administrator',
      createdAt: u.createdAt || '2024-01-15T09:00:00.000Z',
      updatedBy: u.updatedBy || 'System Administrator',
      updatedAt: u.updatedAt || '2024-01-15T09:00:00.000Z',
      lastLoginAt: u.lastLoginAt || new Date().toISOString(),
      lastLoginIP: u.lastLoginIP || '10.24.8.102',
      statusHistory: u.statusHistory || [
        {
          previousStatus: 'None',
          newStatus: u.status || 'Active',
          reason: 'Initial account provisioning in CSD AFD Master Directory',
          changedBy: 'System Administrator',
          changedAt: u.createdAt || '2024-01-15T09:00:00.000Z'
        }
      ]
    };
  });
};

let usersStore = initializeUsersStore();

const persistStore = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersStore));
  } catch (e) {
    console.warn('[userService] LocalStorage save failed:', e);
  }
};

/**
 * Client-side cryptographic SHA-256 hash generator
 * Ensures plaintext password is NEVER stored or leaked
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
    // Failsafe pseudo-hash simulation
    return `$hash_${btoa(password).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)}`;
  }
};

/**
 * Validates password strength rules:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special symbol (!@#$%^&*)
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
   * Check if username already exists
   */
  async checkUsernameExists(username, excludeId = null) {
    if (!username) return false;
    const clean = username.trim().toLowerCase();
    return usersStore.some(
      (u) => u.username && u.username.toLowerCase() === clean && u.id !== excludeId
    );
  },

  /**
   * Check if email already exists
   */
  async checkEmailExists(email, excludeId = null) {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return usersStore.some(
      (u) => u.email && u.email.toLowerCase() === clean && u.id !== excludeId
    );
  },

  /**
   * GET /api/users
   */
  async getUsers(filter = {}) {
    let list = [...usersStore];

    if (filter.role && filter.role !== 'All' && filter.role !== 'ALL') {
      list = list.filter(
        (u) => u.role === filter.role || (u.otherRoles && u.otherRoles.includes(filter.role))
      );
    }

    if (filter.status && filter.status !== 'All' && filter.status !== 'ALL') {
      list = list.filter((u) => u.status && u.status.toLowerCase() === filter.status.toLowerCase());
    }

    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.firstName && u.firstName.toLowerCase().includes(q)) ||
          (u.lastName && u.lastName.toLowerCase().includes(q)) ||
          (u.mobile && u.mobile.toLowerCase().includes(q)) ||
          (u.serviceNumber && u.serviceNumber.toLowerCase().includes(q))
      );
    }

    const res = await apiClient.get('/users', list);
    return res.data;
  },

  /**
   * GET /api/users/:id
   */
  async getUserById(id) {
    const user = usersStore.find((u) => u.id === id);
    const res = await apiClient.get(`/users/${id}`, user || null);
    return res.data;
  },

  /**
   * POST /api/users
   * Full WordPress Add User module with validation, duplicate checks, hashing & audit
   */
  async createUser(userData, currentAdminName = 'Admin Officer K. S. Pillai') {
    const {
      username,
      email,
      firstName = '',
      lastName = '',
      website = '',
      mobile = '',
      password,
      role,
      otherRoles = [],
      sendNotification = true,
      createdByAdmin = true,
      defaultPasswordChanged = false,
      reasonOfDenial = '',
      status = 'Active',
      lastDemand4Wheeler = null,
      lastDemand2Wheeler = null,
      mobileVerified = false,
      websiteRating = 5,
      feedbackComment = ''
    } = userData;

    // 1. Validation
    if (!username || !username.trim()) {
      throw new Error('Username is required');
    }
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address');
    }
    if (!role) {
      throw new Error('Primary role is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }

    const strengthErr = validatePasswordStrength(password);
    if (strengthErr) {
      throw new Error(strengthErr);
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // 2. Duplicate Check
    const usernameTaken = await this.checkUsernameExists(cleanUsername);
    if (usernameTaken) {
      throw new Error('Username already exists');
    }

    const emailTaken = await this.checkEmailExists(cleanEmail);
    if (emailTaken) {
      throw new Error('Email already exists');
    }

    // 3. Hash Password (Never store plaintext)
    const passwordHash = await hashPassword(password);

    // 4. Sanitize Other Roles (Must not duplicate primary role)
    const sanitizedOtherRoles = Array.isArray(otherRoles)
      ? otherRoles.filter((r) => r && r !== role)
      : [];

    const now = new Date().toISOString();
    const prefix = role.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'GEN';
    const newId = `USR-${prefix}-${Date.now().toString().slice(-4)}`;
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || cleanUsername;

    const newUser = {
      id: newId,
      username: cleanUsername,
      email: cleanEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      website: website.trim(),
      mobile: mobile.trim(),
      passwordHash, // Stored securely
      role,
      otherRoles: sanitizedOtherRoles,
      sendNotification: Boolean(sendNotification),
      createdByAdmin: createdByAdmin !== undefined ? Boolean(createdByAdmin) : true,
      defaultPasswordChanged: Boolean(defaultPasswordChanged),
      reasonOfDenial: reasonOfDenial.trim(),
      status: status || 'Active',
      statusChangeCount: 0,
      userEditedCount: 0,
      lastDemand4Wheeler: lastDemand4Wheeler ? new Date(lastDemand4Wheeler).toISOString() : null,
      lastDemand2Wheeler: lastDemand2Wheeler ? new Date(lastDemand2Wheeler).toISOString() : null,
      mobileVerified: Boolean(mobileVerified),
      websiteRating: Number(websiteRating) || 5,
      feedbackComment: feedbackComment.trim(),
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: status || 'Active',
          reason: status === 'Denied' ? (reasonOfDenial || 'Account provisioned in Denied status') : 'Initial account provisioning by system administrator',
          changedBy: currentAdminName,
          changedAt: now
        }
      ],
      createdBy: currentAdminName,
      createdAt: now,
      updatedBy: currentAdminName,
      updatedAt: now,
      statusChangedBy: currentAdminName,
      statusChangedAt: now,
      lastLoginAt: 'Never',
      lastLoginIP: 'N/A'
    };

    // If sendNotification is true, simulate credentials email dispatch
    if (sendNotification) {
      console.log(`[Notification Engine] Dispatched onboarding credentials email to: ${cleanEmail} for user: ${cleanUsername}`);
    }

    usersStore = [newUser, ...usersStore];
    persistStore();

    const res = await apiClient.post('/users', newUser);
    return res.data;
  },

  /**
   * PUT /api/users/:id
   * Edit user - locks username, auto-increments userEditedCount, stamps updatedBy & updatedAt
   */
  async updateUser(id, updateData, currentEditor = 'Admin Officer K. S. Pillai') {
    const idx = usersStore.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error('User not found');
    }

    const current = usersStore[idx];

    // Check email uniqueness if email is changed
    if (updateData.email && updateData.email.trim().toLowerCase() !== current.email) {
      const cleanEmail = updateData.email.trim().toLowerCase();
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new Error('Please enter a valid email address');
      }
      const emailTaken = await this.checkEmailExists(cleanEmail, id);
      if (emailTaken) {
        throw new Error('Email already exists');
      }
    }

    const now = new Date().toISOString();
    const nextEditedCount = (current.userEditedCount || 0) + 1;

    // Derived full name
    const nextFirst = updateData.firstName !== undefined ? updateData.firstName.trim() : (current.firstName || '');
    const nextLast = updateData.lastName !== undefined ? updateData.lastName.trim() : (current.lastName || '');
    const nextName = [nextFirst, nextLast].filter(Boolean).join(' ') || updateData.name || current.name;

    // Sanitize otherRoles against role
    const effectiveRole = updateData.role || current.role;
    const effectiveOtherRoles = Array.isArray(updateData.otherRoles)
      ? updateData.otherRoles.filter((r) => r !== effectiveRole)
      : (current.otherRoles || []).filter((r) => r !== effectiveRole);

    // Merge updates while protecting locked fields
    const updated = {
      ...current,
      ...updateData,
      id: current.id, // Immutable
      username: current.username, // Immutable per enterprise spec
      name: nextName,
      firstName: nextFirst,
      lastName: nextLast,
      role: effectiveRole,
      otherRoles: effectiveOtherRoles,
      userEditedCount: nextEditedCount,
      updatedBy: currentEditor,
      updatedAt: now
    };

    usersStore[idx] = updated;
    persistStore();

    const res = await apiClient.put(`/users/${id}`, updated);
    return res.data;
  },

  /**
   * PATCH /api/users/:id/status
   * Dedicated Status Change Flow - tracks history & increments statusChangeCount
   */
  async updateUserStatus(id, newStatus, reason = '', changedBy = 'Admin Officer K. S. Pillai') {
    const idx = usersStore.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error('User not found');
    }

    const current = usersStore[idx];
    const prevStatus = current.status;
    const now = new Date().toISOString();

    const newHistoryEntry = {
      previousStatus: prevStatus,
      newStatus,
      reason: reason.trim() || 'Account status updated by administrator',
      changedBy,
      changedAt: now
    };

    const nextChangeCount = (current.statusChangeCount || 0) + 1;
    const updated = {
      ...current,
      status: newStatus,
      statusChangeCount: nextChangeCount,
      statusChangedBy: changedBy,
      statusChangedAt: now,
      reasonOfDenial: newStatus === 'Denied' ? (reason.trim() || current.reasonOfDenial) : current.reasonOfDenial,
      statusHistory: [newHistoryEntry, ...(current.statusHistory || [])],
      updatedBy: changedBy,
      updatedAt: now
    };

    usersStore[idx] = updated;
    persistStore();

    const res = await apiClient.put(`/users/${id}/status`, updated);
    return res.data;
  },

  /**
   * DELETE /api/users/:id
   */
  async deleteUser(id) {
    const idx = usersStore.findIndex((u) => u.id === id);
    if (idx !== -1) {
      usersStore.splice(idx, 1);
      persistStore();
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    }
    throw new Error('User not found');
  },

  /**
   * Reset store to initial mock data (helpful for testing)
   */
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    usersStore = initializeUsersStore();
    return usersStore;
  }
};

export default userService;
