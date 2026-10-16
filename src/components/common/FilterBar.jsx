import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import Button from './Button.jsx';

export function FilterBar({
  children,
  onReset,
  hasActiveFilters = false,
  className = '',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = []
}) {
  return (
    <div className={`filter-bar-container panel mb-2 ${className}`}>
      <div className="filter-bar-fields row align-end gap-1 flex-wrap" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {onSearchChange !== undefined && (
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={onSearchChange}
            />
          </div>
        )}
        {filters.map((f, idx) => (
          <div key={idx} style={{ minWidth: '150px' }}>
            {f.label && <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{f.label}</span>}
            <select
              value={f.value}
              onChange={f.onChange}
              className="select-input"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
            >
              {(f.options || []).map((opt, oIdx) => (
                <option key={oIdx} value={typeof opt === 'object' ? opt.value : opt}>
                  {typeof opt === 'object' ? opt.label : opt}
                </option>
              ))}
            </select>
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}

export default FilterBar;
