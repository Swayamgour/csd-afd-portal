/**
 * Central API Client abstraction.
 * Communicates with backend Express REST API with standard authentication headers.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('csd_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
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
  }
};

export default apiClient;
