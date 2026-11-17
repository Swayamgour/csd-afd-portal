import React, { useState, useEffect, useRef } from 'react';
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
  filters = [],
  debounceMs = 400
}) {
  const [innerSearch, setInnerSearch] = useState(
    typeof searchValue === 'string' ? searchValue : searchValue?.target?.value || ''
  );
  const onChangeRef = useRef(onSearchChange);
  onChangeRef.current = onSearchChange;

  useEffect(() => {
    const strVal = typeof searchValue === 'string' ? searchValue : searchValue?.target?.value || '';
    setInnerSearch(strVal);
  }, [searchValue]);

  useEffect(() => {
    const strVal = typeof searchValue === 'string' ? searchValue : searchValue?.target?.value || '';
    if (innerSearch === strVal) return;

    const timer = setTimeout(() => {
      if (onChangeRef.current) {
        onChangeRef.current({ target: { value: innerSearch }, value: innerSearch });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [innerSearch, debounceMs, searchValue]);

  return (
    <div className={`filter-bar-container panel mb-2 ${className}`}>
      <div className="filter-bar-fields row align-end gap-1 flex-wrap filter-bar-flex">
        {onSearchChange !== undefined && (
          <div className="filter-search-col">
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={innerSearch}
              onChange={(e) => setInnerSearch(e.target.value)}
            />
          </div>
        )}
        {filters.map((f, idx) => (
          <div key={idx} className="filter-select-col">
            {f.label && <span className="filter-select-label">{f.label}</span>}
            <select
              value={f.value}
              onChange={f.onChange}
              className="form-control"
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
