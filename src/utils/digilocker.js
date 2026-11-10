// DigiLocker (MeriPehchaan) sign-in / registration / linking for beneficiaries.
// The browser is sent to the backend, which redirects to DigiLocker and finally back to
// /auth/digilocker/callback?status=ok&mode=..&ticket=..  (or status=error&code=..)

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export function startDigiLocker(mode) {
  const m = String(mode).toUpperCase();
  if (!['LOGIN', 'REGISTER'].includes(m)) throw new Error('Invalid DigiLocker mode');
  window.location.assign(`${API_BASE}/auth/digilocker/start?mode=${m}`);
}

const MESSAGES = {
  DIGILOCKER_DISABLED: 'DigiLocker sign-in is not available right now. Please use your User ID and password.',
  ACCESS_DENIED: 'You did not allow access in DigiLocker. Please try again and tap "Allow".',
  NO_CODE: 'DigiLocker did not return an authorisation. Please try again.',
  MISSING_STATE: 'The DigiLocker session was not valid. Please start again.',
  STATE_INVALID: 'The DigiLocker session expired or was already used. Please start again.',
  NOT_LINKED: 'This DigiLocker account is not linked to any CSD AFD account. Register with DigiLocker, or sign in with your password and link it from Account Settings.',
  ALREADY_REGISTERED: 'This DigiLocker account is already registered. Please sign in with DigiLocker instead.',
  LINKED_TO_OTHER_ACCOUNT: 'This DigiLocker account is already linked to another CSD AFD account.',
  DIGILOCKER_NOT_LINKED: 'This DigiLocker account is not linked to any CSD AFD account.',
  DIGILOCKER_TICKET_INVALID: 'Your DigiLocker session expired or was already used. Please start again.',
  DIGILOCKER_ERROR: 'We could not complete the DigiLocker verification. Please try again in a few minutes.',
  INVALID_ROLE: 'DigiLocker sign-in is only available for beneficiaries.',
  ACCOUNT_LOCKED: 'Your account is temporarily locked. Please try again later.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact the CSD helpdesk.',
};

export const digilockerMessage = (code, fallback) =>
  MESSAGES[code] || fallback || 'DigiLocker verification failed. Please try again.';
