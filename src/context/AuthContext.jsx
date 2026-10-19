import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, ROLE_HOMES, getRoleNavigatePath } from '../permissions/roles.js';
import { ROLE_PERMISSIONS } from '../permissions/permissions.js';
import { getMockUserByRole, MOCK_USERS } from '../data/mock/users.mock.js';
import { authService } from '../services/auth.service.js';
import { getCookie, setCookie, deleteCookie } from '../utils/cookie.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export function AuthProvider({ children }) {
  // Check stored real credentials or initialize with null (guest by default)
  const [user, setUser] = useState(() => {
    try {
      const savedToken =
        localStorage.getItem('csd_auth_token') ||
        getCookie('csd_auth_token') ||
        getCookie('accessToken');

      // If token is missing or dummy demo token, clear and stay guest
      if (!savedToken || savedToken === 'csd_demo_token_active' || savedToken.startsWith('csd_token_')) {
        localStorage.removeItem('csd_auth_user');
        localStorage.removeItem('csd_auth_token');
        localStorage.removeItem('csd_auth_role');
        return null;
      }

      const saved = localStorage.getItem('csd_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge mock demo users if previously cached in browser
        if (parsed?.id?.startsWith('USR-') || parsed?.username === 'JC-765432X') {
          localStorage.removeItem('csd_auth_user');
          localStorage.removeItem('csd_auth_token');
          localStorage.removeItem('csd_auth_role');
          return null;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    try {
      const t =
        localStorage.getItem('csd_auth_token') ||
        getCookie('csd_auth_token') ||
        getCookie('accessToken');
      if (!t || t === 'csd_demo_token_active' || t.startsWith('csd_token_')) {
        return null;
      }
      const saved = localStorage.getItem('csd_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id?.startsWith('USR-') || parsed?.username === 'JC-765432X') {
          return null;
        }
      }
      return t;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('csd_auth_user', JSON.stringify(user));
        localStorage.setItem('csd_auth_role', user.role);
        setCookie('csd_auth_role', user.role, 7);
      } catch (e) {
        console.error('Storage error', e);
      }
    } else {
      localStorage.removeItem('csd_auth_user');
      localStorage.removeItem('csd_auth_role');
      localStorage.removeItem('csd_auth_token');
      localStorage.removeItem('csd_refresh_token');
      deleteCookie('csd_auth_user');
      deleteCookie('csd_auth_role');
      deleteCookie('csd_auth_token');
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      if (credentials?.directUser && credentials?.directToken) {
        const u = credentials.directUser;
        const t = credentials.directToken;
        setUser(u);
        setToken(t);
        localStorage.setItem('csd_auth_token', t);
        localStorage.setItem('csd_auth_user', JSON.stringify(u));
        localStorage.setItem('csd_auth_role', u.role);
        setCookie('csd_auth_token', t, 7);
        setCookie('accessToken', t, 7);
        if (credentials.refreshToken) {
          setCookie('refreshToken', credentials.refreshToken, 30);
        }
        return u;
      }
      const res = await authService.login(credentials);
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('csd_auth_token', res.data.token);
      localStorage.setItem('csd_auth_user', JSON.stringify(res.data.user));
      localStorage.setItem('csd_auth_role', res.data.user.role);
      setCookie('csd_auth_token', res.data.token, 7);
      setCookie('accessToken', res.data.token, 7);
      if (res.data.refreshToken) {
        setCookie('refreshToken', res.data.refreshToken, 30);
      }
      return res.data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    deleteCookie('csd_auth_token');
    deleteCookie('accessToken');
    deleteCookie('csd_refresh_token');
    deleteCookie('refreshToken');
    deleteCookie('csd_auth_role');
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

  const hasRole = (targetRole) => {
    if (!user) return false;
    return String(user.role).toLowerCase() === String(targetRole).toLowerCase();
  };

  const currentRole = user?.role ? String(user.role).toLowerCase() : null;

  const value = {
    user,
    token,
    role: currentRole,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    switchRole,
    updateProfile,
    hasPermission,
    hasRole,
    homePath: user ? getRoleNavigatePath(user.role) : '/login',
    roleHome: user ? (currentRole === 'beneficiary' ? '/beneficiary/dashboard' : getRoleNavigatePath(user.role)) : '/login'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
