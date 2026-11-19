/**
 * Unified application environment & API configuration.
 * Single source of truth for base URLs - import from here, never read
 * import.meta.env.VITE_API_* anywhere else.
 *
 * Resolution order:
 *   1. VITE_API_BASE_URL  (preferred)
 *   2. VITE_API_URL       (legacy alias)
 *   3. dev build   -> http://localhost:5000/api/v1
 *      prod build  -> <current origin>/api/v1 (same-origin reverse proxy)
 */
const fromEnv = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

const fallback = import.meta.env.DEV
  ? 'http://localhost:5000/api/v1'
  : `${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1`;

export const API_BASE_URL = (fromEnv || fallback).replace(/\/$/, '');

/** Backend origin without the /api/v1 suffix (used for /uploads/... file URLs). */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');
