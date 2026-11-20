// Status labels / colours for the dealer-request workflow
export const DR_STATUS = {
  PENDING_ADMIN: { label: 'Pending with Admin', variant: 'warning' },
  WITH_DEPOT: { label: 'With Depot', variant: 'info' },
  WITH_URC: { label: 'With URC for verification', variant: 'info' },
  URC_SUBMITTED: { label: 'URC report submitted', variant: 'warning' },
  DEALER_CREATED: { label: 'Dealer created', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  CANCELLED: { label: 'Cancelled', variant: 'neutral' },
};

export const statusMeta = (s) => DR_STATUS[s] || { label: String(s || '—').replace(/_/g, ' '), variant: 'default' };

export const FINAL_STATUSES = ['DEALER_CREATED', 'REJECTED', 'CANCELLED'];

// the 5 stages shown in the progress strip
export const STAGES = [
  { key: 'PENDING_ADMIN', label: 'OEM request' },
  { key: 'WITH_DEPOT', label: 'Admin → Depot' },
  { key: 'WITH_URC', label: 'Depot → URC' },
  { key: 'URC_SUBMITTED', label: 'URC verified' },
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


export const fileSrc = (url) => {
  if (!url) return '';

  // Already a complete URL
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base =
    API_ORIGIN ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const mapsLink = (loc) => (loc?.lat != null && loc?.lng != null ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : '');
