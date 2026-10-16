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
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved user from storage:', e);
    }
    // Default demo session: Student
    return {
      id: 'usr_stu_1',
      username: 'student_arun',
      name: 'Arun Patel',
      role: 'STUDENT',
      status: 'ACTIVE'
    };
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

  const switchRole = (role) => {
    if (role === 'STUDENT') {
      setCurrentUser({
        id: 'usr_stu_1',
        username: 'student_arun',
        name: 'Arun Patel',
        role: 'STUDENT',
        status: 'ACTIVE'
      });
    } else if (role === 'FACILITATOR') {
      setCurrentUser({
        id: 'usr_fac_1',
        username: 'prof_sharma',
        name: 'Prof. Rahul Sharma',
        role: 'FACILITATOR',
        status: 'ACTIVE'
      });
    } else if (role === 'ADMIN') {
      setCurrentUser({
        id: 'usr_adm_1',
        username: 'admin_dean',
        name: 'Dean Academic Affairs',
        role: 'ADMIN',
        status: 'ACTIVE'
      });
    }
  };

  const value = {
    currentUser,
    role: currentUser?.role || null,
    isAuthenticated: Boolean(currentUser),
    login,
    logout,
    switchRole
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
