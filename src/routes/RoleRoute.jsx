import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingState } from '../components/common/States.jsx';

export function RoleRoute({ allowedRoles = [], children }) {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Verifying role permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access to all panels for supervisory oversight
  if (role === 'admin') {
    return children;
  }

  const hasAccess = allowedRoles.includes(role);
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RoleRoute;
