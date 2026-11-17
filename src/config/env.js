/**
 * Unified application environment & API configuration.
 * Single source of truth for base URLs and endpoints.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : '/api/v1')
).replace(/\/$/, '');

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error('VITE_API_BASE_URL is required in production build.');
}
