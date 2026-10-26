import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search by keyword, ID, or name...',
  onClear,
  className = '',
  size = 'md'
}) {
  const handleChange = (e) => {
    if (!onChange) return;
    onChange(e);
  };

  return (
    <div className={`search-fld fld ${size === 'sm' ? 'fld-sm' : ''} ${className}`}>
      <Search size={16} className="fld-icon text-muted" aria-hidden="true" />
      <input
        type="search"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-control"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onChange) onChange({ target: { value: '' } });
            onClear?.();
          }}
          className="search-clear-btn"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
