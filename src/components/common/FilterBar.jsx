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
      <div className="filter-bar-fields row align-end gap-1 flex-wrap filter-bar-flex">
        {onSearchChange !== undefined && (
          <div className="filter-search-col">
            <input
              type="text"
              className="form-control filter-search-input"
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={onSearchChange}
            />
          </div>
        )}
        {filters.map((f, idx) => (
          <div key={idx} className="filter-select-col">
            {f.label && <span className="filter-select-label">{f.label}</span>}
            <select
              value={f.value}
              onChange={f.onChange}
              className="select-input filter-select-input"
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
