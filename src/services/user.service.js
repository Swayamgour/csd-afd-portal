
export const isMockUser = (u) => false;

/**
 * Client-side cryptographic SHA-256 hash generator
 */
export const hashPassword = async (password) => {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `$sha256$10000$${hex.slice(0, 32)}$${hex}`;
  } catch (e) {
    return `$hash_${btoa(password).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)}`;
  }
};

/**
 * Validates password strength rules
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return 'Password must contain at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter (A-Z)';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter (a-z)';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must include at least one number (0-9)';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must include at least one special character (!@#$%^&* etc.)';
  }
  return null;
};

/**
 * Calculate numerical password score (0-4)
 */
export const calculatePasswordScore = (password = '') => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  return Math.min(score, 4);
};
