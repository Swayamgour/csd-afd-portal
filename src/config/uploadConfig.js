/**
 * Document Upload Configuration & Validation
 * Centralized settings for file types, size limits, and security constraints for CSD AFD Online Portal.
 */

export const UPLOAD_CONFIG = {
  maxSizeMB: 5,
  maxSizeBytes: 5 * 1024 * 1024,
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ],
  acceptString: '.pdf,.jpg,.jpeg,.png'
};

export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file size
  if (file.size > UPLOAD_CONFIG.maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${UPLOAD_CONFIG.maxSizeMB}MB limit (actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`
    };
  }

  // Check file extension
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!UPLOAD_CONFIG.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file format (${ext}). Allowed formats: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`
    };
  }

  return { valid: true, error: null };
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
