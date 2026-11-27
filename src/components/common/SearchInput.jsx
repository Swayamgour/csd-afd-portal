import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search by keyword, ID, or name...',
  onClear,
  className = '',
  size = 'md',
  debounceMs = 0
}) {
  // some pages keep the whole change event in state: always work with the text
  const valueText = typeof value === 'string' ? value : value?.target?.value ?? '';
  const [innerVal, setInnerVal] = useState(valueText);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync if external value changed (e.g. parent reset)
  useEffect(() => {
    setInnerVal(valueText);
  }, [valueText]);

  // Debounce dispatching to parent only if debounceMs > 0
  useEffect(() => {
    if (debounceMs <= 0) return;
    if (innerVal === valueText) return;

    const timer = setTimeout(() => {
      onChangeRef.current?.({ target: { value: innerVal } });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [innerVal, debounceMs, valueText]);

  const handleChange = (e) => {
    const nextVal = e.target.value;
    setInnerVal(nextVal);
    if (debounceMs <= 0) {
      onChange?.(e);
    }
  };

  const handleClear = () => {
    setInnerVal('');
    onChangeRef.current?.({ target: { value: '' } });
    onClear?.();
  };

  return (
    <div className={`search-fld fld ${size === 'sm' ? 'fld-sm' : ''} ${className}`}>
      <Search size={16} className="fld-icon text-muted" aria-hidden="true" />
      <input
        type="search"
        value={innerVal}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-control"
        aria-label={placeholder}
      />
      {innerVal && (
        <button
          type="button"
          onClick={handleClear}
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
