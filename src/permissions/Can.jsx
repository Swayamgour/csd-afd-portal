import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Declarative component for conditional rendering based on user permissions or roles.
 * Example:
 * <Can permission="demands.approve">
 *   <button>Approve Demand</button>
 * </Can>
 */
export function Can({ permission, role, anyRole, children, fallback = null }) {
  const { hasPermission, hasRole } = useAuth();

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (role && !hasRole(role)) {
    return fallback;
  }

  if (anyRole && Array.isArray(anyRole)) {
    const matched = anyRole.some((r) => hasRole(r));
    if (!matched) return fallback;
  }

  return <>{children}</>;
}
export default Can;
