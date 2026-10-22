import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES, ROLE_HOMES, getRoleNavigatePath, normalizeRole } from '../permissions/roles.js';
import { ROLE_PERMISSIONS } from '../permissions/permissions.js';
import { getCookie, setCookie, deleteCookie } from '../utils/cookie.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      const t =
        localStorage.getItem('csd_auth_token') ||
        getCookie('csd_auth_token') ||
        getCookie('accessToken');
      if (!t || t === 'csd_demo_token_active' || t.startsWith('csd_token_')) {
        return null;
      }
      return t;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('csd_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id?.startsWith('USR-') || parsed?.username === 'JC-765432X') {
          localStorage.removeItem('csd_auth_user');
          localStorage.removeItem('csd_auth_token');
          localStorage.removeItem('csd_auth_role');
          return null;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Authenticated user session verification via GET /auth/me
  const refreshMe = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setUser(null);
      setInitialized(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const freshUser = data?.data?.user || data?.data || data?.user;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('csd_auth_user', JSON.stringify(freshUser));
          localStorage.setItem('csd_auth_role', freshUser.role);
          setCookie('csd_auth_role', freshUser.role, 7);
        }
      } else if (res.status === 401) {
        // Expired or invalid token
        setUser(null);
        setToken(null);
        localStorage.removeItem('csd_auth_user');
        localStorage.removeItem('csd_auth_token');
        localStorage.removeItem('csd_auth_role');
      }
    } catch (e) {
      console.warn('Failed to fetch /auth/me on init:', e);
    } finally {
      setInitialized(true);
    }
  }, [token]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

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
      if (credentials?.authenticatedUser && credentials?.authenticatedToken) {
        const u = credentials.authenticatedUser;
        const t = credentials.authenticatedToken;
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

      // Real Express REST backend call
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.message || 'Login failed');
      }

      const userObj = resData?.data?.user || resData?.user;
      const accessToken = resData?.data?.token || resData?.data?.accessToken || resData?.token;
      const refreshToken = resData?.data?.refreshToken || resData?.refreshToken;

      setUser(userObj);
      setToken(accessToken);
      localStorage.setItem('csd_auth_token', accessToken);
      localStorage.setItem('csd_auth_user', JSON.stringify(userObj));
      localStorage.setItem('csd_auth_role', userObj.role);
      setCookie('csd_auth_token', accessToken, 7);
      setCookie('accessToken', accessToken, 7);
      if (refreshToken) {
        setCookie('refreshToken', refreshToken, 30);
      }
      return userObj;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('csd_auth_user');
      localStorage.removeItem('csd_auth_role');
      localStorage.removeItem('csd_auth_token');
      localStorage.removeItem('csd_refresh_token');
      deleteCookie('csd_auth_token');
      deleteCookie('accessToken');
      deleteCookie('csd_refresh_token');
      deleteCookie('refreshToken');
      deleteCookie('csd_auth_role');
    }
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
    return normalizeRole(user.role) === normalizeRole(targetRole);
  };

  const currentRole = user?.role ? normalizeRole(user.role) : null;

  const value = {
    user,
    token,
    role: currentRole,
    isAuthenticated: !!user && !!token,
    loading,
    initialized,
    login,
    logout,
    refreshMe,
    updateProfile,
    hasPermission,
    hasRole,
    homePath: user ? getRoleNavigatePath(user.role) : '/login',
    roleHome: user ? (currentRole === 'beneficiary' ? '/beneficiary/dashboard' : getRoleNavigatePath(user.role)) : '/login',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
