import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, allowedRole }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('projectmatch_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Auth check failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      
      if (allowedRole && res.user.role !== allowedRole) {
        throw new Error(`This portal is for ${allowedRole}s only.`);
      }

      localStorage.setItem('projectmatch_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const res = await authApi.register({ name, email, password, role });
      
      if (allowedRole && res.user.role !== allowedRole) {
        throw new Error(`This portal is for ${allowedRole}s only.`);
      }

      localStorage.setItem('projectmatch_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('projectmatch_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
