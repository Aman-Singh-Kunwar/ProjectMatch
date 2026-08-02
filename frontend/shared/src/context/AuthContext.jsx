import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, me as apiMe } from '../api/authClient.js';

export const SHARED_TOKEN_KEY = 'projectmatch_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from localStorage token on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem(SHARED_TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const fetchedUser = await apiMe(storedToken);
        setUser(fetchedUser);
        setToken(storedToken);
      } catch (err) {
        // Token invalid or expired: clear storage & reset state cleanly
        localStorage.removeItem(SHARED_TOKEN_KEY);
        setUser(null);
        setToken(null);
        setError(err.message || 'Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await apiLogin({ email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(SHARED_TOKEN_KEY, data.token);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (fields) => {
    setError(null);
    try {
      const data = await apiRegister(fields);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(SHARED_TOKEN_KEY, data.token);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(SHARED_TOKEN_KEY);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
