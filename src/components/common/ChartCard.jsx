import React from 'react';
import Card from './Card.jsx';

export function ChartCard({
  title,
  subtitle,
  data = [], // [{ label: 'Tata Motors', value: 450, max: 600, color: 'var(--brand)' }]
  actions,
  className = ''
}) {
  return (
    <Card title={title} subtitle={subtitle} actions={actions} className={className}>
      <div className="chart-bars-list">
        {data.map((item, idx) => {
          const maxVal = item.max || Math.max(...data.map((d) => d.value), 1);
          const pct = Math.round((item.value / maxVal) * 100);
          const widthClass = `chart-w-${Math.min(100, Math.max(0, Math.round(pct / 5) * 5))}`;
          return (
            <div key={idx} className="chart-bar-item">
              <div className="chart-bar-labels between small">
                <span className="chart-bar-label font-semibold">{item.label}</span>
                <span className="chart-bar-val muted">{item.displayValue || item.value}</span>
              </div>
              <div className="chart-bar-track">
                <div
                  className={`chart-bar-fill ${widthClass} chart-bar-color-brand`}
                  role="progressbar"
                  aria-valuenow={item.value}
                  aria-valuemin={0}
                  aria-valuemax={maxVal}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default ChartCard;
