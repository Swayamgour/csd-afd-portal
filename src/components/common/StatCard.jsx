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
      <div className="stat-top between stat-top-between">
        <span className="stat-title muted small">{title}</span>
        {Icon && (
          <div className="stat-icon-wrap" aria-hidden="true">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value stat-value-large">{value}</div>

      {(displaySub || trendObj) && (
        <div className="stat-footer small stat-footer-flex">
          {trendObj && (
            <span
              className={`stat-trend stat-trend-indicator ${trendObj.isUp ? 'stat-trend-up' : 'stat-trend-down'}`}
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
