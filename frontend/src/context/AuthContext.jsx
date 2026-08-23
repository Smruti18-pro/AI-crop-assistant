import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('crop_ai_user');
    const token = localStorage.getItem('crop_ai_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('crop_ai_token', token);
    localStorage.setItem('crop_ai_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('crop_ai_token');
    localStorage.removeItem('crop_ai_user');
    setUser(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('crop_ai_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getAuthHeader, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
