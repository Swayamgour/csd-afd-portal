import React from 'react';

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = '',
  headerClassName = ''
}) {
  return (
    <div className={`panel enterprise-card ${className}`}>
      {(title || subtitle || actions) && (
        <div className={`card-header between ${headerClassName}`}>
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle muted small">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export default Card;
