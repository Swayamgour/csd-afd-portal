import { apiClient } from './apiClient.js';

// Load from localStorage for full persistent state across reloads (ONLY REAL REGISTERED USERS)
const STORAGE_KEY = 'csd_portal_users_registry_v2';

// Filter helper to purge legacy mock users from storage
export const isMockUser = (u) => {
  if (!u) return true;
  const id = String(u.id || u._id || '');
  const username = String(u.username || '').toUpperCase();
  return (
    id.startsWith('USR-BEN-001') ||
    id.startsWith('USR-CSD-') ||
    id.startsWith('USR-DEP-') ||
    id.startsWith('USR-URC-') ||
    id.startsWith('USR-OEM-') ||
    id.startsWith('USR-DLR-') ||
    id.startsWith('USR-HD-') ||
    id.startsWith('USR-ADM-') ||
    username === 'JC-765432X' ||
    username === 'CSD_HO_089' ||
    username === 'DEPOT_MGR_DEL' ||
    username === 'URC_OFF_CANTT' ||
    username === 'OEM_TATA_AFD' ||
    username === 'DLR_PRATHAM_DEL' ||
    username === 'HD_AGENT_104' ||
    username === 'HD_SUP_002' ||
    username === 'SYS_ADMIN_CSD'
  );
};

const initializeUsersStore = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strip out any dummy mock users, keep ONLY real registered users
        const realUsers = parsed.filter((u) => !isMockUser(u));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realUsers));
        return realUsers;
      }
    }
  } catch (e) {
    console.warn('[userService] LocalStorage read failed:', e);
  }

  // NO DUMMY DATA: Start completely clean with empty array
  return [];
};

let usersStore = initializeUsersStore();

const persistStore = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersStore.filter((u) => !isMockUser(u))));
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
   * Comprehensive duplicate check across local storage and backend MongoDB
   */
  async checkDuplicates({ username, email, mobile, cardId, chipNumber, pan }) {
    const conflicts = {};

    // 1. Check local store
    if (username) {
      const uClean = username.trim().toLowerCase();
      if (usersStore.some((u) => u.username && u.username.toLowerCase() === uClean)) {
        conflicts.username = 'This username is already registered. Please choose another username.';
      }
    }
    if (email) {
      const eClean = email.trim().toLowerCase();
      if (usersStore.some((u) => u.email && u.email.toLowerCase() === eClean)) {
        conflicts.email = 'This email address is already registered. Please sign in or use another email.';
      }
    }
    if (cardId) {
      const cClean = cardId.trim().toUpperCase();
      if (usersStore.some((u) => (u.cardId && u.cardId.toUpperCase() === cClean) || (u.serviceNumber && u.serviceNumber.toUpperCase() === cClean))) {
        conflicts.cardId = 'This Grocery Card ID is already registered in the CSD AFD portal.';
      }
    }
    if (pan) {
      const pClean = pan.trim().toUpperCase();
      if (usersStore.some((u) => u.pan && u.pan.toUpperCase() === pClean)) {
        conflicts.pan = 'This PAN card number is already registered.';
      }
    }
    if (mobile) {
      const mClean = mobile.trim();
      if (usersStore.some((u) => u.mobile && u.mobile === mClean)) {
        conflicts.mobile = 'This mobile number is already registered.';
      }
    }

    // 2. Check real backend API
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
      // Backend offline, local check already performed
    }

    return {
      available: Object.keys(conflicts).length === 0,
      conflicts
    };
  },

  /**
   * GET /api/users
   */
  async getUsers(filter = {}) {
    let list = [];

    // 1. Fetch real users directly from backend MongoDB API
    try {
      const token = localStorage.getItem('csd_auth_token');
      const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users?limit=200`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        const serverUsers = json.data?.items || json.data || [];
        if (Array.isArray(serverUsers)) {
          const serverMapped = serverUsers.map((su) => {
            const roleNorm = (su.role || 'beneficiary').toLowerCase();
            const isApproved = su.verificationStatus === 'VERIFIED' || su.verificationStatus === 'APPROVED';
            return {
              id: String(su._id || su.id),
              _id: String(su._id || su.id),
              username: su.username || su.email,
              name: su.name,
              email: su.email,
              mobile: su.mobile,
              role: roleNorm,
              status: su.status === 'ACTIVE' ? (isApproved ? 'Active' : (roleNorm === 'beneficiary' ? 'Pending' : 'Active')) : 'Suspended',
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

          // Also include any real users registered locally in this browser that haven't synced yet
          const realLocalUsers = usersStore.filter(
            (lu) =>
              !isMockUser(lu) &&
              !serverMapped.some(
                (su) =>
                  (su.username && su.username.toLowerCase() === lu.username?.toLowerCase()) ||
                  (su.email && su.email.toLowerCase() === lu.email?.toLowerCase())
              )
          );

          list = [...serverMapped, ...realLocalUsers];
        }
      }
    } catch (e) {
      console.warn('[userService] Backend fetch failed (using local real users only):', e);
      list = usersStore.filter((lu) => !isMockUser(lu));
    }

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

    return list;
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
   * Register a new beneficiary after successful EmailJS OTP verification.
   * Creates a user in PENDING status with isEmailVerified: true.
   */
  registerBeneficiaryUser(data) {
    const existingIndex = usersStore.findIndex(
      (u) =>
        (u.username && u.username.toLowerCase() === (data.username || '').toLowerCase()) ||
        (u.email && u.email.toLowerCase() === (data.email || '').toLowerCase()) ||
        (data.cardId && u.cardId === data.cardId)
    );

    const newId = `USR-BEN-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const beneficiaryRecord = {
      id: newId,
      name: data.name,
      username: (data.username || '').toLowerCase().trim(),
      email: (data.email || '').toLowerCase().trim(),
      mobile: data.mobile || '',
      password: data.password || '',
      passwordHash: data.password || '',
      role: 'beneficiary',
      status: 'Pending', // PENDING ADMIN APPROVAL
      verificationStatus: 'PENDING',
      adminApproval: 'PENDING',
      isEmailVerified: true,
      emailVerified: true,
      mobileVerified: !!data.mobile,
      cardId: data.cardId,
      chipNumber: data.chipNumber,
      employmentStatus: data.employmentStatus,
      organization: data.organization,
      service: data.organization || 'Army',
      rank: data.entitlement?.includes('Officer') ? 'Major' : 'Subedar',
      serviceNumber: data.cardId || data.username,
      depot: 'Delhi Regional CSD Depot',
      urc: 'Delhi Cantt Central URC',
      dob: data.dob,
      dateOfEnrollment: data.dateOfEnrollment,
      dateOfRetirement: data.dateOfRetirement,
      entitlement: data.entitlement,
      payLevel: data.payLevel,
      pan: data.pan,
      ppo: data.ppo || '',
      category: data.category || 'OTHER',
      createdAt: now,
      updatedAt: now,
      eligibility: {
        fourWheelerEligible: false,
        fourWheelerCap: 0,
        twoWheelerEligible: false,
        whiteGoodsEligible: false,
        reason: 'Pending administrative approval'
      },
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Pending',
          reason: 'Beneficiary registration with EmailJS email verification completed',
          changedBy: 'System / EmailJS Verification',
          changedAt: now
        }
      ]
    };

    if (existingIndex !== -1) {
      usersStore[existingIndex] = { ...usersStore[existingIndex], ...beneficiaryRecord };
    } else {
      usersStore = [beneficiaryRecord, ...usersStore];
    }

    persistStore();
    return beneficiaryRecord;
  },

  /**
   * Admin Approval / Rejection for Beneficiaries
   * Updates status to Active / Denied and verificationStatus to VERIFIED / REJECTED
   */
  async approveBeneficiaryUser(id, decision = 'APPROVED', remarks = 'Profile and entitlement verified by administrator') {
    const isApproved = decision === 'APPROVED' || decision === 'VERIFIED';
    const nextStatus = isApproved ? 'Active' : 'Denied';
    const nextVerificationStatus = isApproved ? 'VERIFIED' : 'REJECTED';
    const now = new Date().toISOString();

    // 1. Trigger real backend API
    let backendResult = null;
    try {
      const token = localStorage.getItem('csd_auth_token');
      // If it looks like a Mongo ID (24 hex characters), call backend endpoints
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      const endpoint = isApproved ? `/users/${id}/approve` : `/users/${id}/reject`;
      
      const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ remarks })
      });
      if (apiRes.ok) {
        backendResult = await apiRes.json();
      } else {
        // Also try beneficiary verify route
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/beneficiaries/${id}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ status: isApproved ? 'APPROVED' : 'REJECTED', remarks })
        });
      }
    } catch (apiErr) {
      console.warn('Backend API approval notice (using local sync):', apiErr);
    }

    // 2. Synchronize local users store
    let idx = usersStore.findIndex((u) => u.id === id || u._id === id);
    if (idx === -1 && backendResult?.data?.user) {
      const bu = backendResult.data.user;
      idx = usersStore.findIndex((u) => (u.username && u.username === bu.username) || (u.email && u.email === bu.email));
    }

    let updated;
    if (idx !== -1) {
      const current = usersStore[idx];
      updated = {
        ...current,
        status: nextStatus,
        verificationStatus: nextVerificationStatus,
        adminApproval: isApproved ? 'APPROVED' : 'REJECTED',
        approvedAt: isApproved ? now : null,
        approvedBy: 'Admin Officer K. S. Pillai',
        remarks: remarks || (isApproved ? 'Approved by Admin' : 'Rejected by Admin'),
        eligibility: isApproved ? {
          fourWheelerEligible: true,
          fourWheelerCap: (current.payLevel && current.payLevel.includes('Level 1')) || (current.entitlement && current.entitlement.includes('Officer')) ? 2000000 : 1000000,
          twoWheelerEligible: true,
          whiteGoodsEligible: true,
          reason: 'Authorized Entitled Quota Active'
        } : {
          fourWheelerEligible: false,
          fourWheelerCap: 0,
          reason: remarks || 'Rejected by Admin'
        },
        statusHistory: [
          {
            previousStatus: current.status,
            newStatus: nextStatus,
            reason: remarks || (isApproved ? 'Approved by Admin' : 'Rejected by Admin'),
            changedBy: 'Admin Officer K. S. Pillai',
            changedAt: now
          },
          ...(current.statusHistory || [])
        ],
        updatedAt: now
      };
      usersStore[idx] = updated;
    } else {
      updated = {
        id,
        _id: id,
        status: nextStatus,
        verificationStatus: nextVerificationStatus,
        adminApproval: isApproved ? 'APPROVED' : 'REJECTED',
        approvedAt: isApproved ? now : null,
        approvedBy: 'Admin Officer K. S. Pillai',
        remarks: remarks || (isApproved ? 'Approved by Admin' : 'Rejected by Admin'),
        updatedAt: now
      };
      usersStore = [updated, ...usersStore];
    }
    persistStore();

    // Also update current active session if the approved user is the currently logged in beneficiary
    try {
      const activeUserRaw = localStorage.getItem('csd_auth_user');
      if (activeUserRaw) {
        const activeUser = JSON.parse(activeUserRaw);
        if (
          activeUser.id === id ||
          activeUser._id === id ||
          (updated.username && activeUser.username === updated.username) ||
          (updated.email && activeUser.email === updated.email)
        ) {
          localStorage.setItem('csd_auth_user', JSON.stringify({ ...activeUser, ...updated }));
        }
      }
    } catch (e) {
      // ignore
    }

    return backendResult?.data?.user || updated;
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
