import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await api.get('/auth/me');
          setUser(profile);
        } catch (err) {
          console.error('Failed to load user info', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      
      // Fetch full profile info right after login
      const profile = await api.get('/auth/me');
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      
      // Fetch full profile info right after registration
      const profile = await api.get('/auth/me');
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await api.put('/auth/me', profileData);
      setUser(updatedUser);
      setLoading(false);
      return updatedUser;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
