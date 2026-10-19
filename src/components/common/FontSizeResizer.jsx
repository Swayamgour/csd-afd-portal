import React, { useEffect, useState } from 'react';

/**
 * FontSizeResizer Component
 * Standard Government/NIC Portal Accessibility Font Size Controller
 * Renders: |  A-   A   A+  |
 * - A- : Decreases font size across the entire portal
 * - A  : Resets font size to standard default
 * - A+ : Increases font size across the entire portal
 */
export default function FontSizeResizer({ className = '' }) {
  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem('csd_font_size') || 'normal';
    } catch {
      return 'normal';
    }
  });

  const applyFontSize = (size) => {
    setFontSize(size);
    try {
      localStorage.setItem('csd_font_size', size);
    } catch {
      // ignore storage errors
    }
    document.documentElement.setAttribute('data-font-size', size);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('csd_font_size') || 'normal';
      document.documentElement.setAttribute('data-font-size', saved);
    } catch {
      document.documentElement.setAttribute('data-font-size', 'normal');
    }
  }, []);

  return (
    <div
      className={`font-resizer-control ${className}`}
      role="group"
      aria-label="Font size adjustment"
    >
      <span className="font-resizer-sep" aria-hidden="true">|</span>
      <button
        type="button"
        className={`font-resizer-btn ${fontSize === 'small' ? 'active' : ''}`}
        onClick={() => applyFontSize('small')}
        title="Decrease font size (A-)"
        aria-label="Decrease font size"
        aria-pressed={fontSize === 'small'}
      >
        A<sup>-</sup>
      </button>
      <button
        type="button"
        className={`font-resizer-btn ${fontSize === 'normal' ? 'active' : ''}`}
        onClick={() => applyFontSize('normal')}
        title="Normal font size (A)"
        aria-label="Normal font size"
        aria-pressed={fontSize === 'normal'}
      >
        A
      </button>
      <button
        type="button"
        className={`font-resizer-btn ${fontSize === 'large' ? 'active' : ''}`}
        onClick={() => applyFontSize('large')}
        title="Increase font size (A+)"
        aria-label="Increase font size"
        aria-pressed={fontSize === 'large'}
      >
        A<sup>+</sup>
      </button>
      <span className="font-resizer-sep" aria-hidden="true">|</span>
    </div>
  );
}
