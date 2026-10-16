import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_HOMES } from '../permissions/roles.js';

export default function Breadcrumbs({ customItems }) {
  const location = useLocation();
  const { role } = useAuth();
  const homePath = ROLE_HOMES[role] || '/beneficiary/dashboard';

  if (customItems && customItems.length > 0) {
    return (
      <nav className="enterprise-bc" aria-label="Breadcrumb">
        <ol className="row align-center gap-1">
          <li>
            <Link to={homePath} className="bc-home row align-center gap-1 small">
              <Home size={13} aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
          </li>
          {customItems.map(([label, to], idx) => {
            const isLast = idx === customItems.length - 1;
            return (
              <React.Fragment key={idx}>
                <li aria-hidden="true" className="bc-separator">
                  <ChevronRight size={13} />
                </li>
                <li>
                  {isLast || !to ? (
                    <span className="bc-current small font-semibold" aria-current="page">
                      {label}
                    </span>
                  ) : (
                    <Link to={to} className="bc-link small">
                      {label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Derive from location.pathname
  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return null;

  return (
    <nav className="enterprise-bc" aria-label="Breadcrumb">
      <ol className="row align-center gap-1">
        <li>
          <Link to={homePath} className="bc-home row align-center gap-1 small">
            <Home size={13} aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
        </li>
        {segments.slice(1).map((seg, idx) => {
          const isLast = idx === segments.length - 2;
          const formatted = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <React.Fragment key={idx}>
              <li aria-hidden="true" className="bc-separator">
                <ChevronRight size={13} />
              </li>
              <li>
                {isLast ? (
                  <span className="bc-current small font-semibold" aria-current="page">
                    {formatted}
                  </span>
                ) : (
                  <span className="bc-segment small muted">{formatted}</span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
