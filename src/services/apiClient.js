/**
 * Central API Client abstraction.
 * Communicates with backend Express REST API with standard authentication headers.
 */
import { getCookie } from '../utils/cookie.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getHeaders = (extraHeaders = {}) => {
  const token =
    localStorage.getItem('csd_auth_token') ||
    sessionStorage.getItem('csd_auth_token') ||
    getCookie('csd_auth_token') ||
    getCookie('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

const parseResponse = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || `API request failed with status ${res.status}`);
    err.status = res.status;
    err.code = json.code;
    err.details = json.details;
    throw err;
  }
  return { status: res.status, data: json.data || json };
};

export const apiClient = {
  async get(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return parseResponse(res);
  },

  async post(endpoint, payload = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  async patch(endpoint, payload = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  async put(endpoint, payload = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  async delete(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    const parsed = await parseResponse(res);
    return { ...parsed, success: true };
  },

  async download(endpoint, filename) {
    const headers = getHeaders();
    delete headers['Content-Type']; // Let browser handle stream response

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || `Export failed with HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || `oem-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  }
};

export default apiClient;
