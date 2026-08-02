import { SHARED_TOKEN_KEY } from '../context/AuthContext.jsx';

/**
 * Base URLs for each role portal.
 * Reads environment variables configured in each frontend app.
 */
export const PORTAL_URLS = {
  student: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STUDENT_PORTAL_URL) || 'http://localhost:5173',
  faculty: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FACULTY_PORTAL_URL) || 'http://localhost:5174',
  admin:   (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PORTAL_URL)   || 'http://localhost:5175',
};

/**
 * Build the SSO redirect URL for a user based on their role.
 * 
 * NOTE (v1 Architecture Simplification):
 * We are passing the full JWT session token directly in the URL query parameter `?token=`.
 * In a production setup, this would use a short-lived (e.g. 30-second), single-use SSO handoff code
 * that the target portal exchanges server-side for a session token, preventing raw tokens in URL logs.
 * 
 * @param {string} role - 'student' | 'faculty' | 'admin'
 * @param {string} token - JWT token
 * @returns {string} SSO URL
 */
export function buildSSOUrl(role, token) {
  const baseUrl = PORTAL_URLS[role] || PORTAL_URLS.student;
  // Ensure no trailing slash on base URL
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/sso?token=${encodeURIComponent(token)}`;
}

/**
 * Perform browser redirect to the target portal's SSO endpoint.
 * @param {string} role - 'student' | 'faculty' | 'admin'
 * @param {string} token - JWT token
 */
export function redirectToPortal(role, token) {
  const targetUrl = buildSSOUrl(role, token);
  window.location.href = targetUrl;
}

/**
 * Catch incoming SSO token from URL parameters on app entry, store in localStorage,
 * strip from browser address bar history, and return the token.
 * 
 * @returns {string|null} token or null
 */
export function catchSSOToken() {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    // 1. Store token in shared localStorage key
    localStorage.setItem(SHARED_TOKEN_KEY, token);

    // 2. Strip token from address bar to prevent it sitting visibly in browser history
    const cleanUrl = window.location.pathname + (window.location.hash || '');
    window.history.replaceState({}, document.title, cleanUrl);

    return token;
  }

  return null;
}
