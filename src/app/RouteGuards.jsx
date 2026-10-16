import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard that requires authentication and optionally checks for permitted roles.
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

/**
 * Smart index redirector based on current user role.
 */
export const RoleHomeRedirect = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/topics" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (role === 'FACILITATOR') {
    return <Navigate to="/facilitator" replace />;
  }

  return <Navigate to="/topics" replace />;
};
