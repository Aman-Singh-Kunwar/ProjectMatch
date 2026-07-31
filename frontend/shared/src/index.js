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

export { request, authApi } from './api/client.js';
export { AuthProvider, useAuth } from './context/AuthContext.jsx';
