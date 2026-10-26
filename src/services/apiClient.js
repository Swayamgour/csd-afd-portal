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

export const apiClient = {
  async get(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders()
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return { status: res.status, data: json.data || json };
  },

  async post(endpoint, payload = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return { status: res.status, data: json.data || json };
  },

  async put(endpoint, payload = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return { status: res.status, data: json.data || json };
  },

  async delete(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return { status: res.status, data: json.data || json, success: true };
  },

  async download(endpoint, filename) {
    const headers = getHeaders();
    delete headers['Content-Type']; // Let browser handle stream response

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
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
