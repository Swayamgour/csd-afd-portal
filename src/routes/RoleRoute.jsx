import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingState } from '../components/common/States.jsx';

export function RoleRoute({ allowedRoles = [], children }) {
  const { role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Verifying role permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}&reason=auth-required`} replace />;
  }

  const currentRole = String(role || '').toLowerCase();

  // Admin has access to all panels for supervisory oversight
  if (currentRole === 'admin' || currentRole === 'administrator') {
    return children;
  }

  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());
  const hasAccess = normalizedAllowed.includes(currentRole);
  if (!hasAccess) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}&reason=role-unauthorized`} replace />;
  }

  return children;
}

export default RoleRoute;
