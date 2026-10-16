import { apiClient } from './apiClient.js';
import { MOCK_USERS, getMockUserByRole } from '../data/mock/users.mock.js';
import { ROLES } from '../permissions/roles.js';

export const authService = {
  async login({ username, password, captcha, role = ROLES.BENEFICIARY }) {
    // If username matches a specific known mock user
    let user = MOCK_USERS.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === username.trim().toLowerCase() ||
        (u.serviceNumber && u.serviceNumber.toLowerCase() === username.trim().toLowerCase())
    );

    // If not found by username, pick default user matching requested role
    if (!user) {
      user = getMockUserByRole(role);
    }

    const token = `csd_jwt_${Date.now()}_${user.id}`;
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
    return apiClient.post('/auth/logout', { success: true });
  }
};
