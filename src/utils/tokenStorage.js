/**
 * Single source of truth for auth tokens.
 * Persists accessToken and refreshToken in localStorage.
 * 
 * TODO(security): Recommend backend sets HttpOnly, Secure, SameSite refresh cookies
 * so the refresh token is not accessible via JavaScript in localStorage.
 */

const ACCESS_TOKEN_KEY = 'csd_auth_token';
const REFRESH_TOKEN_KEY = 'csd_refresh_token';

export const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setTokens = ({ accessToken, refreshToken } = {}) => {
  try {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('csd_tokens_updated', {
          detail: { accessToken, refreshToken },
        })
      );
    }
  } catch (e) {
    console.warn('Failed to persist tokens in localStorage:', e);
  }
};

export const clearTokens = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('csd_tokens_cleared'));
    }
  } catch (e) {
    console.warn('Failed to clear tokens from localStorage:', e);
  }
};

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
};
