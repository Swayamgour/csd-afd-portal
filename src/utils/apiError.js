/**
 * Utility to extract a clean user-facing error message from RTK Query error responses
 */
export function getErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  if (!error) return fallback;

  // If error has a direct string or nested message
  if (typeof error === 'string') return error;

  // Backend standardized response: { success: false, message: '...', code: '...' }
  if (error.data?.message) {
    return error.data.message;
  }

  if (error.data?.error) {
    return typeof error.data.error === 'string' ? error.data.error : JSON.stringify(error.data.error);
  }

  if (error.message) {
    return error.message;
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Unable to connect to the CSD server. Please check your network connection or server status.';
  }

  if (error.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (error.status === 403) {
    return error.data?.message || 'Access denied. You do not have permission to perform this action.';
  }

  if (error.status === 404) {
    return error.data?.message || 'Requested resource could not be found.';
  }

  if (error.status === 429) {
    return 'Too many requests. Please wait a few moments before trying again.';
  }

  return fallback;
}
