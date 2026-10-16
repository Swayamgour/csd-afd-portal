import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtext,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
  onClick
}) {
  const trendObj = trend || (change ? { value: change, isUp: isPositive !== false } : null);
  const displaySub = subtext || subtitle;

  return (
    <div
      className={`panel stat-card stat-${variant} ${onClick ? 'cursor-pointer hover-lift' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="stat-top between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stat-title muted small">{title}</span>
        {Icon && (
          <div className="stat-icon-wrap" aria-hidden="true">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.4rem 0' }}>{value}</div>

      {(displaySub || trendObj) && (
        <div className="stat-footer small" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {trendObj && (
            <span
              className={`stat-trend ${trendObj.isUp ? 'text-green' : 'text-danger'}`}
              style={{ color: trendObj.isUp ? '#16a34a' : '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}
            >
              {trendObj.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="trend-num">{trendObj.value}</span>
            </span>
          )}
          {displaySub && <span className="stat-subtext muted">{displaySub}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;
