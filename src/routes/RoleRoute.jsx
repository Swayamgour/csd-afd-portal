import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { normalizeRole, getRoleNavigatePath } from '../permissions/roles.js';
import { LoadingState } from '../components/common/States.jsx';

export function RoleRoute({ allowedRoles = [], children }) {
  const { role, user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Verifying role permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}&reason=auth-required`} replace />;
  }

  const currentRole = normalizeRole(role || user?.role);

  // Admin has access to all panels for supervisory oversight
  if (currentRole === 'admin') {
    return children;
  }

  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
  const hasAccess = normalizedAllowed.includes(currentRole);
  if (!hasAccess) {
    // Authenticated user with a valid role is routed to their own dashboard
    const authorizedHome = getRoleNavigatePath(currentRole);
    if (authorizedHome && authorizedHome !== location.pathname) {
      return <Navigate to={authorizedHome} replace />;
    }
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}&reason=role-unauthorized`} replace />;
  }

  return children;
}

export default RoleRoute;
