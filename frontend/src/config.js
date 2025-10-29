// Centralized API base URL resolver for runtime and build-time environments
// Prefer an explicit environment variable, else derive from the current origin
// and finally fall back to localhost for local development.

export function getApiBaseUrl() {
  // Ensure no trailing slash
  const fromEnv = (process.env.REACT_APP_API_URL || '').trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    // On Railway frontend domains, default to the deployed backend URL
    if (window.location.hostname.endsWith('railway.app')) {
      return 'https://coach-link-octick-production.up.railway.app/api';
    }
    return `${window.location.origin.replace(/\/$/, '')}/api`;
  }

  return 'http://localhost:5000/api';
}


