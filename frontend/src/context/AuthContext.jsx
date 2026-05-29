import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);
const storedUser = localStorage.getItem('miniCrmUser');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate token on app startup
    const validateToken = async () => {
      const token = localStorage.getItem('miniCrmToken');
      if (token && user) {
        try {
          // Make a simple API call to verify token is still valid
          await api.get('/auth/me');
          setLoading(false);
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem('miniCrmToken');
            localStorage.removeItem('miniCrmUser');
            setUser(null);
          }
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const persistAuth = (data) => {
    localStorage.setItem('miniCrmToken', data.token);
    localStorage.setItem('miniCrmUser', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistAuth(data);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    persistAuth(data);
  };

  const logout = () => {
    localStorage.removeItem('miniCrmToken');
    localStorage.removeItem('miniCrmUser');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, signup, logout, isAuthenticated: Boolean(user), loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
