import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getRoleNavigatePath, normalizeRole } from '../permissions/roles.js';
import { ROLE_PERMISSIONS } from '../permissions/permissions.js';
import { API_BASE_URL } from '../config/env.js';
import { getAccessToken, setTokens, clearTokens } from '../utils/tokenStorage.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

const API_BASE = API_BASE_URL;

// One in-flight GET /auth/me per token (React.StrictMode / re-renders can never double-call it)
let meInflight = null; // { token, promise }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken());

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('csd_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Authenticated user session verification via GET /auth/me
  const verifiedTokenRef = useRef(null);

  // Listen to silent refresh and token updates across the app (e.g. from Redux baseQueryWithReauth)
  useEffect(() => {
    const onTokensUpdated = (e) => {
      const nextAccessToken = e?.detail?.accessToken;
      if (nextAccessToken) {
        setToken(nextAccessToken);
        verifiedTokenRef.current = nextAccessToken;
      }
    };

    const onTokensCleared = () => {
      setToken(null);
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('csd_tokens_updated', onTokensUpdated);
      window.addEventListener('csd_tokens_cleared', onTokensCleared);
      return () => {
        window.removeEventListener('csd_tokens_updated', onTokensUpdated);
        window.removeEventListener('csd_tokens_cleared', onTokensCleared);
      };
    }
  }, []);

  const refreshMe = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setUser(null);
      setInitialized(true);
      return;
    }
    if (meInflight && meInflight.token === activeToken) return meInflight.promise;
    const run = (async () => {
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
      meInflight = null;
    }
    })();
    meInflight = { token: activeToken, promise: run };
    return run;
  }, [token]);

  // Verify the session ONCE per token. After login() the fresh user is already known,
  // so the token change it causes must not trigger another /auth/me call.
  useEffect(() => {
    if (token && verifiedTokenRef.current === token) return;
    verifiedTokenRef.current = token;
    refreshMe();
  }, [refreshMe, token]);

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
      clearTokens();
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      if (credentials?.authenticatedUser && credentials?.authenticatedToken) {
        const u = credentials.authenticatedUser;
        const t = credentials.authenticatedToken;
        verifiedTokenRef.current = t;
        setUser(u);
        setToken(t);
        setTokens({
          accessToken: t,
          refreshToken: credentials.refreshToken || null,
        });
        localStorage.setItem('csd_auth_user', JSON.stringify(u));
        localStorage.setItem('csd_auth_role', u.role);
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

      verifiedTokenRef.current = accessToken;
      setUser(userObj);
      setToken(accessToken);
      setTokens({
        accessToken,
        refreshToken: refreshToken || null,
      });
      localStorage.setItem('csd_auth_user', JSON.stringify(userObj));
      localStorage.setItem('csd_auth_role', userObj.role);
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
      clearTokens();
      localStorage.removeItem('csd_auth_user');
      localStorage.removeItem('csd_auth_role');
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
