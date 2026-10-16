import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, ROLE_HOMES } from '../permissions/roles.js';
import { ROLE_PERMISSIONS } from '../permissions/permissions.js';
import { getMockUserByRole, MOCK_USERS } from '../data/mock/users.mock.js';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export function AuthProvider({ children }) {
  // Check stored credentials or initialize with null (guest) or default demo beneficiary
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('csd_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Beneficiary for immediate portal readiness
    return getMockUserByRole(ROLES.BENEFICIARY);
  });

  const [token, setToken] = useState(() => localStorage.getItem('csd_auth_token') || 'csd_demo_token_active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('csd_auth_user', JSON.stringify(user));
        localStorage.setItem('csd_auth_role', user.role);
      } catch (e) {
        console.error('Storage error', e);
      }
    } else {
      localStorage.removeItem('csd_auth_user');
      localStorage.removeItem('csd_auth_role');
      localStorage.removeItem('csd_auth_token');
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('csd_auth_token', res.data.token);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const switchRole = (newRole) => {
    const targetUser = getMockUserByRole(newRole);
    setUser(targetUser);
    const newToken = `csd_token_${newRole}_${Date.now()}`;
    setToken(newToken);
    localStorage.setItem('csd_auth_token', newToken);
    return targetUser;
  };

  const updateProfile = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    switchRole,
    updateProfile,
    hasPermission,
    hasRole,
    homePath: user ? ROLE_HOMES[user.role] || '/beneficiary/dashboard' : '/login',
    roleHome: user ? ROLE_HOMES[user.role] || '/beneficiary/dashboard' : '/login'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
