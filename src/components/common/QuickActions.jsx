import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Row of big, icon-led shortcuts shown at the top of a dashboard.
 * actions: [{ label, hint, to, icon: LucideIcon, tone?: 'brand'|'success'|'warning'|'danger'|'info' }]
 */
export function QuickActions({ title = 'What would you like to do?', actions = [], className = '' }) {
  if (!actions.length) return null;
  return (
    <section className={`quick-actions ${className}`} aria-label={title}>
      <h2 className="quick-actions-title">{title}</h2>
      <div className="quick-actions-grid">
        {actions.map(({ label, hint, to, icon: Icon, tone = 'brand' }) => (
          <Link key={to + label} to={to} className={`quick-action quick-action-${tone}`}>
            <span className="quick-action-icon" aria-hidden="true">
              {Icon && <Icon size={22} />}
            </span>
            <span className="quick-action-text">
              <span className="quick-action-label">{label}</span>
              {hint && <span className="quick-action-hint">{hint}</span>}
            </span>
            <ChevronRight size={18} className="quick-action-go" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
