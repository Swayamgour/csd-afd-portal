import { apiClient } from './apiClient.js';
import { MOCK_USERS, getMockUserByRole } from '../data/mock/users.mock.js';
import { ROLES } from '../permissions/roles.js';
import { setCookie, deleteCookie } from '../utils/cookie.js';

export const authService = {
  async verifyCredentials({ username, password, role }) {
    const cleanIdentifier = (username || '').trim().toLowerCase();
    if (!cleanIdentifier || !password) {
      throw new Error('Please enter both username and password.');
    }

    // 1. Try real backend API if reachable
    try {
      const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/verify-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username.trim(), password })
      });
      if (apiRes.ok) {
        const body = await apiRes.json();
        const data = body.data || body;
        if (data && data.user) {
          return { valid: true, user: data.user };
        }
      } else {
        const errBody = await apiRes.json().catch(() => ({}));
        throw new Error(errBody.message || 'Invalid username or password.');
      }
    } catch (err) {
      // If server responded with an error or rejection, throw it immediately
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      // If backend is offline/unreachable, proceed to local registry check
    }

    // 2. Check local users registry (includes all newly registered beneficiaries)
    try {
      const rawStore = localStorage.getItem('csd_portal_users_registry_v2');
      if (rawStore) {
        const storeList = JSON.parse(rawStore);
        const user = storeList.find(
          (u) =>
            (u.username && u.username.toLowerCase() === cleanIdentifier) ||
            (u.email && u.email.toLowerCase() === cleanIdentifier) ||
            (u.serviceNumber && u.serviceNumber.toLowerCase() === cleanIdentifier) ||
            (u.cardId && u.cardId.toLowerCase() === cleanIdentifier)
        );
        if (user) {
          if (user.password && user.password !== password) {
            throw new Error('Invalid credentials. Incorrect password.');
          }
          return { valid: true, user };
        }
      }
    } catch (e) {
      if (e.message && (e.message.toLowerCase().includes('password') || e.message.toLowerCase().includes('credentials'))) {
        throw e;
      }
    }

    // 3. Fallback to MOCK_USERS ONLY if exact identifier matches AND password matches
    const mockUser = MOCK_USERS.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanIdentifier) ||
        (u.email && u.email.toLowerCase() === cleanIdentifier) ||
        (u.serviceNumber && u.serviceNumber.toLowerCase() === cleanIdentifier)
    );
    if (mockUser) {
      const expectedPass = mockUser.password || (mockUser.role === 'admin' ? 'Admin@12345' : 'GovtPass@2024');
      if (password !== expectedPass) {
        throw new Error('Invalid credentials. Incorrect password.');
      }
      return { valid: true, user: mockUser };
    }

    // 4. Account not found anywhere
    throw new Error('Invalid credentials. No user found with this username or email.');
  },

  async login({ username, password, captcha, role }) {
    const cleanIdentifier = (username || '').trim().toLowerCase();

    // 1. Try real backend API if reachable
    try {
      const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username.trim(), password })
      });
      if (apiRes.ok) {
        const body = await apiRes.json();
        const data = body.data || body;
        if (data.user && data.accessToken) {
          const rawRole = String(data.user.role || '').toLowerCase();
          const normalizedRole = rawRole === 'administrator' ? 'admin' : (rawRole || 'beneficiary');
          const userObj = {
            ...data.user,
            id: data.user._id || data.user.id,
            role: normalizedRole,
            rawRole: data.user.role,
            status: data.user.beneficiary?.verificationStatus === 'VERIFIED' ? 'Active' : data.user.status === 'ACTIVE' && data.user.beneficiary?.verificationStatus === 'PENDING' ? 'Pending' : data.user.status,
            verificationStatus: data.user.beneficiary?.verificationStatus || 'PENDING',
            isEmailVerified: data.user.isEmailVerified !== undefined ? data.user.isEmailVerified : true,
          };
          localStorage.setItem('csd_auth_token', data.accessToken);
          setCookie('csd_auth_token', data.accessToken, 7);
          setCookie('accessToken', data.accessToken, 7);
          if (data.refreshToken) {
            localStorage.setItem('csd_refresh_token', data.refreshToken);
            setCookie('csd_refresh_token', data.refreshToken, 30);
            setCookie('refreshToken', data.refreshToken, 30);
          }
          localStorage.setItem('csd_auth_user', JSON.stringify(userObj));
          localStorage.setItem('csd_auth_role', normalizedRole);
          setCookie('csd_auth_role', normalizedRole, 7);
          return {
            status: 200,
            data: {
              user: userObj,
              token: data.accessToken,
              refreshToken: data.refreshToken,
              expiresAt: Date.now() + 3600000 * 8
            }
          };
        }
      } else {
        const errBody = await apiRes.json().catch(() => ({}));
        throw new Error(errBody.message || 'Invalid username or password.');
      }
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      // Backend not running or offline; proceed to local store
    }

    // 2. Check local users registry (includes all newly registered beneficiaries)
    let user = null;
    try {
      const rawStore = localStorage.getItem('csd_portal_users_registry_v2');
      if (rawStore) {
        const storeList = JSON.parse(rawStore);
        user = storeList.find(
          (u) =>
            (u.username && u.username.toLowerCase() === cleanIdentifier) ||
            (u.email && u.email.toLowerCase() === cleanIdentifier) ||
            (u.serviceNumber && u.serviceNumber.toLowerCase() === cleanIdentifier) ||
            (u.cardId && u.cardId.toLowerCase() === cleanIdentifier)
        );
        if (user && user.password) {
          if (password !== user.password) {
            throw new Error('Invalid credentials. Password did not match.');
          }
        }
      }
    } catch (e) {
      if (e.message && e.message.toLowerCase().includes('password')) {
        throw e;
      }
    }

    // 3. Fallback to MOCK_USERS
    if (!user) {
      user = MOCK_USERS.find(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanIdentifier) ||
          (u.email && u.email.toLowerCase() === cleanIdentifier) ||
          (u.serviceNumber && u.serviceNumber.toLowerCase() === cleanIdentifier)
      );
      if (user) {
        const expectedPass = user.password || (user.role === 'admin' ? 'Admin@12345' : 'GovtPass@2024');
        if (password !== expectedPass) {
          throw new Error('Invalid credentials. Password did not match.');
        }
      }
    }

    if (!user) {
      throw new Error('Invalid credentials. User account not found.');
    }

    const token = `csd_jwt_${Date.now()}_${user.id || user._id}`;
    localStorage.setItem('csd_auth_token', token);
    localStorage.setItem('csd_auth_user', JSON.stringify(user));
    setCookie('csd_auth_token', token, 7);
    setCookie('accessToken', token, 7);
    setCookie('csd_auth_role', user.role || role || 'beneficiary', 7);
    return apiClient.post('/auth/login', {
      user,
      token,
      expiresAt: Date.now() + 3600000 * 8 // 8 hours
    });
  },

  async verifyOtp({ otp, sessionRef }) {
    if (otp === '000000' || otp.length === 6) {
      return apiClient.post('/auth/verify-otp', { verified: true });
    }
    throw new Error('Invalid OTP provided. Please try again.');
  },

  async requestPasswordReset({ identifier }) {
    return apiClient.post('/auth/forgot-password', {
      success: true,
      message: `Password reset instructions sent to registered contact for ${identifier}`
    });
  },

  async logout() {
    localStorage.removeItem('csd_auth_token');
    localStorage.removeItem('csd_refresh_token');
    localStorage.removeItem('csd_auth_user');
    localStorage.removeItem('csd_auth_role');
    deleteCookie('csd_auth_token');
    deleteCookie('accessToken');
    deleteCookie('csd_refresh_token');
    deleteCookie('refreshToken');
    deleteCookie('csd_auth_role');
    return apiClient.post('/auth/logout', { success: true });
  }
};
