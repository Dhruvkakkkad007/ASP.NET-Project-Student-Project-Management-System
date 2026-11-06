import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';
import { getUserFromToken, isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('spms_token'));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('spms_token');
    if (savedToken && !isTokenExpired(savedToken)) {
      return getUserFromToken(savedToken);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const currentToken = localStorage.getItem('spms_token');
    if (currentToken) {
      if (isTokenExpired(currentToken)) {
        logout();
      } else {
        const u = getUserFromToken(currentToken);
        setUser(u);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const newToken = res.token;
    if (!newToken) {
      throw new Error('No authentication token received');
    }

    localStorage.setItem('spms_token', newToken);
    setToken(newToken);
    const decodedUser = getUserFromToken(newToken);
    setUser(decodedUser);
    return decodedUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('spms_token');
    setToken(null);
    setUser(null);
  }, []);

  const applyToken = useCallback((newToken) => {
    if (!newToken) return;
    localStorage.setItem('spms_token', newToken);
    setToken(newToken);
    setUser(getUserFromToken(newToken));
  }, []);

  /**
   * Check if current user has any of the requested roles
   * @param {string|string[]} roles
   * @returns {boolean}
   */
  const hasRole = useCallback(
    (roles) => {
      if (!user || !user.role) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.some(
        (r) => r.toLowerCase() === user.role.toLowerCase()
      );
    },
    [user]
  );

  const value = {
    user,
    token,
    isAuthenticated: !!token && !isTokenExpired(token),
    hasRole,
    login,
    logout,
    applyToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

