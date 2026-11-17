import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value (e.g. search term)
 * @param {any} value - Input value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default 400ms)
 * @returns {any} debouncedValue
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
