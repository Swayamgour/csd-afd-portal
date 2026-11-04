import React from 'react';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtext,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  iconNode,
  trend,
  variant = 'default',
  className = '',
  onClick
}) {
  const trendObj = trend || (change ? { value: change, isUp: isPositive !== false } : null);
  const displaySub = subtext || subtitle;
  const clickable = typeof onClick === 'function';

  const handleKeyDown = (e) => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={`panel stat-card stat-${variant} ${clickable ? 'cursor-pointer hover-lift' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="stat-top between stat-top-between">
        <span className="stat-title muted small">{title}</span>
        {(Icon || iconNode) && (
          <div className="stat-icon-wrap" aria-hidden="true">
            {Icon ? <Icon size={20} /> : iconNode}
          </div>
        )}
      </div>

      <div className="stat-value stat-value-large">{value}</div>

      {(displaySub || trendObj || clickable) && (
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
          {clickable && <ChevronRight size={16} className="stat-go" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}

export default StatCard;
