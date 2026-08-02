import dbuuLogo from './assets/dbuu_logo.jpeg';
import dbuuFullLogo from './assets/dbuu-logo-png.jpeg';
import dbuuLogoBig from './assets/dbuu-logo-big.jpeg';

export const API_BASE_URL = 'http://localhost:5000/api';

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
};

export const PROJECT_SOURCES = {
  FACULTY_POOL: 'faculty_pool',
  STUDENT_PROPOSED: 'student_proposed',
};

export const MENTOR_STATUSES = {
  NOT_APPLICABLE: 'not_applicable',
  PENDING_MENTOR_REVIEW: 'pending_mentor_review',
  MENTOR_ACCEPTED: 'mentor_accepted',
  MENTOR_REJECTED: 'mentor_rejected',
};

export const TEAM_STATUSES = {
  FORMING: 'forming',
  PENDING_ADMIN_APPROVAL: 'pending_admin_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNASSIGNED_POOL: 'unassigned_pool',
};

export { dbuuLogo, dbuuFullLogo, dbuuLogoBig };
export { request, authApi, getApiBaseUrl } from './api/client.js';

// Auth API Client
export { login, register, me, AuthError } from './api/authClient.js';

// Auth Context
export { AuthProvider, useAuth, SHARED_TOKEN_KEY } from './context/AuthContext.jsx';

// SSO Handoff Utilities
export { PORTAL_URLS, buildSSOUrl, redirectToPortal, catchSSOToken } from './utils/ssoHandoff.js';

// Reusable Auth Components
export { default as LoginForm } from './components/auth/LoginForm.jsx';
export { default as RegisterForm } from './components/auth/RegisterForm.jsx';
export { default as SplitAuthModal } from './components/auth/SplitAuthModal.jsx';
export { default as SplitAuthPage } from './components/auth/SplitAuthPage.jsx';
