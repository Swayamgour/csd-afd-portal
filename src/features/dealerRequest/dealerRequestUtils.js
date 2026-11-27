// Status labels / colours for the dealer-request workflow
export const DR_STATUS = {
  PENDING_ADMIN: { label: 'Pending with Admin', variant: 'warning' },
  WITH_DEPOT: { label: 'With Depot for verification', variant: 'info' },
  DEPOT_VERIFIED: { label: 'Depot verified - awaiting approval', variant: 'warning' },
  DEALER_CREATED: { label: 'Dealer created', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  CANCELLED: { label: 'Cancelled', variant: 'neutral' },
  // legacy (old URC flow) - only for old records
  WITH_URC: { label: 'With Depot for verification', variant: 'info' },
  URC_SUBMITTED: { label: 'With Depot for verification', variant: 'info' },
};

export const statusMeta = (s) => DR_STATUS[s] || { label: String(s || '—').replace(/_/g, ' '), variant: 'default' };

export const FINAL_STATUSES = ['DEALER_CREATED', 'REJECTED', 'CANCELLED'];

// the 4 stages shown in the progress strip
export const STAGES = [
  { key: 'PENDING_ADMIN', label: 'OEM request' },
  { key: 'WITH_DEPOT', label: 'Admin → Depot' },
  { key: 'DEPOT_VERIFIED', label: 'Depot verified' },
  { key: 'DEALER_CREATED', label: 'Dealer created' },
];

import { API_ORIGIN } from '../../config/env.js';

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

// Uploaded files are served by the backend (images are public); build an absolute URL for <img src>
// export const fileSrc = (url) => {
//   if (!url) return '';
//   if (/^https?:\/\//i.test(url)) return url;
//   const base = API_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '');
//   return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
// };


export const placeholderPhoto = (label = 'Verification Photo') =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f8fafc"/><g fill="%23475569" transform="translate(110, 50)"><rect x="0" y="10" width="80" height="56" rx="8" fill="%23cbd5e1"/><circle cx="40" cy="38" r="17" fill="%23f8fafc"/><circle cx="40" cy="38" r="11" fill="%2364748b"/><rect x="18" y="3" width="24" height="7" rx="2" fill="%2364748b"/></g><text x="150" y="140" font-family="sans-serif" font-size="12" font-weight="600" fill="%23475569" text-anchor="middle">${encodeURIComponent(label)}</text><text x="150" y="158" font-family="sans-serif" font-size="10" fill="%2394a3b8" text-anchor="middle">Depot Verification</text></svg>`;

export const fileSrc = (url) => {
  if (!url) return '';
  const rawUrl = typeof url === 'object' ? (url.url || url.path || url.fileUrl || url.src || '') : url;
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  // Already a complete URL or data URI
  if (/^(?:https?:|data:)/i.test(rawUrl)) {
    return rawUrl;
  }

  const base =
    API_ORIGIN ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return `${base}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
};

export const mapsLink = (loc) => (loc?.lat != null && loc?.lng != null ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : '');
