/**
 * Standardized API Error Parser for BrunoVerse
 * 
 * Extracts clean, human-readable error messages from Axios / HTTP / Error objects.
 * Never outputs raw objects like "[object Object]".
 */
export function parseApiError(error, defaultMessage = 'An unexpected error occurred') {
  if (!error) return defaultMessage;

  // 1. If error is already a string
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      return defaultMessage;
    }
    return trimmed;
  }

  // 2. Extract from Axios response body
  const data = error.response?.data;
  if (data) {
    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        const status = error.response?.status;
        return `Server returned an error (${status || 'HTTP'}). Please try again.`;
      }
      return trimmed;
    }

    if (typeof data === 'object') {
      // Priority 1: message
      if (data.message && typeof data.message === 'string') {
        // If details exist and add value (e.g. "Audience mismatch")
        if (data.details && typeof data.details === 'string' && data.details !== data.message) {
          return `${data.message} (${data.details})`;
        }
        return data.message;
      }
      // Priority 2: details
      if (data.details && typeof data.details === 'string') {
        return data.details;
      }
      // Priority 3: error field
      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
      // Priority 4: errors array (e.g., Spring validation errors)
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map(e => (typeof e === 'string' ? e : e.defaultMessage || e.message)).filter(Boolean).join(', ');
      }
    }
  }

  // 3. Native Error object message
  if (error.message && typeof error.message === 'string') {
    // Avoid displaying Network Error if server is down, make it friendly
    if (error.message === 'Network Error') {
      return 'Unable to connect to the BrunoVerse server. Please ensure the backend is running.';
    }
    return error.message;
  }

  return defaultMessage;
}

/**
 * Logs full error details to browser console with context
 */
export function logError(context, error) {
  console.error(`[BrunoVerse Error] ${context}:`, error);
  if (error?.response) {
    console.error('Response Status:', error.response.status);
    console.error('Response Data:', error.response.data);
  }
}
