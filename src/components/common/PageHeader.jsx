import React from 'react';
import { Link } from 'react-router-dom';

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  className = ''
}) {
  return (
    <div className={`page-header-box mb-2 ${className}`}>
      {breadcrumbs && (
        <div className="page-header-breadcrumbs mb-1">
          {Array.isArray(breadcrumbs) ? (
            <nav className="bc" aria-label="Breadcrumb">
              <ol className="page-header-bc-list">
                {breadcrumbs.map((b, idx) => {
                  const label = typeof b === 'object' ? b.label : b;
                  const href = typeof b === 'object' ? b.href : null;
                  return (
                    <li key={idx} className="page-header-bc-item">
                      {idx > 0 && <span className="page-header-bc-separator">/</span>}
                      {href ? (
                        <Link to={href} className="page-header-bc-link">
                          {label}
                        </Link>
                      ) : (
                        <span className="page-header-bc-current">{label}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : (
            breadcrumbs
          )}
        </div>
      )}
      <div className="page-header-main between align-start flex-wrap gap-1">
        <div className="page-header-left">
          <div className="page-header-title-row row align-center gap-1 flex-wrap">
            <h1 className="page-header-title">{title}</h1>
            {badge && <div className="page-header-badge-wrap inline-block">{badge}</div>}
          </div>
          {subtitle && <p className="page-header-subtitle muted small mb-0">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions row gap-1 align-center flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;

