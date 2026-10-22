/**
 * BrunoVerse URL and Media Resolution Utility
 * Handles resolving uploaded assets across local development, Vercel deployments, and production APIs.
 */

export function getAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const rawBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.origin.includes('localhost') ? 'http://localhost:8080' : '');
  const cleanBase = rawBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  return cleanBase ? `${cleanBase}${cleanPath}` : cleanPath;
}

export default getAssetUrl;
