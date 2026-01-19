import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import { mockUser, mockApi, USE_MOCK_DATA } from '../data/mockData';
import React from 'react'

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(USE_MOCK_DATA ? mockUser : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setUser(mockUser);
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      if (USE_MOCK_DATA) {
        const response = await mockApi.login(email, password);
        const { user: userData, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        return { success: true, user: userData };
      }

      // Backend returns: { message: 'Login successful', user: {...}, accessToken: '...', refreshToken: '...' }
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken || !userData) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !USE_MOCK_DATA) {
        // Call backend logout to revoke refresh token
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch (err) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', err);
        }
      }
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
