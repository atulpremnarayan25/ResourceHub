import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY_AUTH = 'resourcehub_active_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved === '__LOGGED_OUT__') {
        return null;
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only retain valid admin or provisioned accounts, wipe legacy mock users
        if (parsed.username === 'student_arun' || parsed.username === 'prof_sharma' || parsed.username === 'student_ananya') {
          localStorage.removeItem(STORAGE_KEY_AUTH);
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved user from storage:', e);
    }
    // Clean initial state starts unauthenticated
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.setItem(STORAGE_KEY_AUTH, '__LOGGED_OUT__');
      }
    } catch (e) {
      console.warn('Failed to persist user to storage:', e);
    }
  }, [currentUser]);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    role: currentUser?.role || null,
    isAuthenticated: Boolean(currentUser),
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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
