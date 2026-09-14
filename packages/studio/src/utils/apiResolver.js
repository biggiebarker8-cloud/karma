/**
 * Resolves API endpoints for both HTTP and file:// (Electron) contexts
 * 
 * This utility ensures that API calls work correctly in both:
 * - Web context (HTTP/HTTPS): Uses relative paths routed through Next.js
 * - Desktop context (file://): Uses absolute URLs to the API server
 * 
 * This fixes the issue where Electron desktop builds (loaded via file://)
 * couldn't fetch from /api/... paths since there's no valid origin.
 * 
 * @param {string} path - The API path (e.g., '/api/app/get_homepage_models')
 * @returns {string} - The resolved endpoint URL
 * 
 * @example
 * // In web context (http://localhost:3000)
 * resolveApiEndpoint('/api/models') // Returns: '/api/models'
 * 
 * // In Electron context (file://)
 * resolveApiEndpoint('/api/models') // Returns: 'https://api.muapi.ai/api/models'
 */
export function resolveApiEndpoint(path) {
  if (typeof window === 'undefined') {
    // SSR context - default to relative path
    return path;
  }

  // Check if we're in a file:// context (Electron) or HTTP/HTTPS (web)
  const isFileProtocol = window.location.protocol === 'file:';

  if (isFileProtocol) {
    // Electron: use absolute URL to bypass origin restrictions
    return `https://api.muapi.ai${path}`;
  }

  // Web: use relative path (routed through Next.js proxy)
  return path;
}

/**
 * Helper to detect if running in Electron/desktop context
 * @returns {boolean} - True if running in file:// protocol context
 */
export function isElectronContext() {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'file:';
}
