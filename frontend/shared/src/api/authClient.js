const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'http://localhost:5000/api';
};

class AuthError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Perform login request (Supports Email OR Admission Number)
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export async function login({ email, password }) {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new AuthError(data.error || data.message || 'Login failed', res.status, data);
    }

    return data; // Expected { token, user }
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError(err.message || 'Network error during login', 0);
  }
}

/**
 * Perform user registration
 * Role must be restricted to "student" or "faculty" in this form. Admin accounts are not self-registrable.
 * @param {Object} fields - { name, email, admissionNo, password, role }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export async function register({ name, email, admissionNo, password, role, program, currentYear }) {
  if (role !== 'student' && role !== 'faculty') {
    throw new AuthError('Role must be student or faculty. Admin accounts cannot be self-registered.', 400);
  }

  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, admissionNo, password, role, program, currentYear }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new AuthError(data.error || data.message || 'Registration failed', res.status, data);
    }

    return data; // Expected { token, user }
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError(err.message || 'Network error during registration', 0);
  }
}

/**
 * Fetch current user profile with JWT token
 * @param {string} token
 * @returns {Promise<Object>} user object
 */
export async function me(token) {
  if (!token) {
    throw new AuthError('No authentication token provided', 401);
  }

  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new AuthError(data.error || data.message || 'Session verification failed', res.status, data);
    }

    return data.user || data;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError(err.message || 'Network error verifying session', 0);
  }
}

export { AuthError };
