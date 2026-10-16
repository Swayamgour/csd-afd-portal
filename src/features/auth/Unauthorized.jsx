import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOMES } from '../../permissions/roles.js';

export default function Unauthorized() {
  const { role, user } = useAuth();
  const homePath = ROLE_HOMES[role] || '/';

  return (
    <div className="state-screen-container wrap py-4 text-center">
      <div className="panel max-w-lg mx-auto p-4 shadow-lg">
        <div className="shield-icon-circle mx-auto mb-2 text-danger">
          <ShieldAlert size={48} />
        </div>
        <h1 className="h2 mb-1">403 — Unauthorized Access</h1>
        <p className="muted small mb-3">
          Your current security clearance ({role || 'Guest'}) does not possess authorization to view this internal administrative module or resource.
        </p>

        <div className="row justify-center gap-1">
          <Link to={homePath} className="btn">
            <Home size={16} />
            <span>Return to Authorized Home</span>
          </Link>
          <Link to="/login" className="btn out">
            <ArrowLeft size={16} />
            <span>Switch Role / Re-login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
