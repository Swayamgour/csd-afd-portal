import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, LogIn } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

export default function SessionExpired() {
  return (
    <div className="state-screen-container wrap py-4 text-center">
      <div className="panel max-w-lg mx-auto p-4 shadow-lg">
        <div className="shield-icon-circle mx-auto mb-2 text-warning">
          <Clock size={48} />
        </div>
        <h1 className="h2 mb-1">Session Expired</h1>
        <p className="muted small mb-3">
          For your protection and in compliance with Ministry of Defence cyber security directives, inactive sessions are automatically terminated after 15 minutes.
        </p>

        <div className="row justify-center gap-1">
          <Link to="/login" className="btn">
            <LogIn size={16} />
            <span>Sign In Again</span>
          </Link>
          <Link to="/" className="btn out">
            <span>Go to Public Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
