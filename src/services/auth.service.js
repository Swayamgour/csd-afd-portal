import { setCookie, deleteCookie } from '../utils/cookie.js';

export const authService = {
  async verifyCredentials({ username, password }) {
    const cleanIdentifier = (username || '').trim().toLowerCase();
    if (!cleanIdentifier || !password) {
      throw new Error('Please enter both username and password.');
    }

    const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/verify-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username.trim(), password })
    });

    const body = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      throw new Error(body.message || 'Invalid username or password.');
    }

    const data = body.data || body;
    if (data && data.user) {
      return { valid: true, user: data.user };
    }

    throw new Error('Invalid credentials. Account verification failed.');
  },

  async login({ username, password }) {
    const cleanIdentifier = (username || '').trim().toLowerCase();
    if (!cleanIdentifier || !password) {
      throw new Error('Please enter both username and password.');
    }

    const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username.trim(), password })
    });

    const body = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      throw new Error(body.message || 'Invalid username or password.');
    }

    const data = body.data || body;
    if (data.user && data.accessToken) {
      const rawRole = String(data.user.role || '').toLowerCase();
      const normalizedRole = rawRole === 'administrator' ? 'admin' : (rawRole || 'beneficiary');
      const userObj = {
        ...data.user,
        id: data.user._id || data.user.id,
        role: normalizedRole,
        rawRole: data.user.role,
        status: data.user.beneficiary?.verificationStatus === 'VERIFIED' ? 'Active' : (data.user.status === 'ACTIVE' && data.user.beneficiary?.verificationStatus === 'PENDING' ? 'Pending' : data.user.status),
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

    throw new Error('Login failed: Token not received from server.');
  },

  async verifyOtp({ otp }) {
    if (otp && otp.length === 6) {
      return { status: 200, data: { verified: true } };
    }
    throw new Error('Invalid OTP provided. Please try again.');
  },

  async requestPasswordReset({ identifier }) {
    const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    const body = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      throw new Error(body.message || 'Unable to process password reset request.');
    }
    return body;
  },

  async logout() {
    try {
      const token = localStorage.getItem('csd_auth_token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
    } catch (e) {
      // offline logout
    } finally {
      localStorage.removeItem('csd_auth_token');
      localStorage.removeItem('csd_refresh_token');
      localStorage.removeItem('csd_auth_user');
      localStorage.removeItem('csd_auth_role');
      deleteCookie('csd_auth_token');
      deleteCookie('accessToken');
      deleteCookie('csd_refresh_token');
      deleteCookie('refreshToken');
      deleteCookie('csd_auth_role');
    }
    return { status: 200, data: { success: true } };
  }
};

export default authService;
