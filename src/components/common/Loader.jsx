import React, { useEffect, useState } from 'react';

/**
 * THE one loader for the whole app. Never build another spinner - use this.
 *
 *   <Loader />                                  block loader with default label (sections, cards, tables)
 *   <Loader label="Loading products" />         block loader with custom label
 *   <Loader variant="page" label="Loading…" />  fills the content area (route / Suspense fallbacks)
 *   <Loader variant="inline" size="sm" />       small spinner inside buttons / text rows
 *   <Loader variant="inline" label="Saving" />  inline spinner + text
 *   icon={LoaderIcon}                           use where a component is expected as an icon (e.g. <Button icon=...>)
 *
 * Props: label | variant: 'block' | 'page' | 'inline' | size: 'sm' | 'md' | 'lg' | number
 *        slowAfter (ms) + onRetry -> shows a "taking longer" hint and a Retry button (block / page only)
 */

const SIZES = { sm: 16, md: 28, lg: 44 };

const cleanLabel = (s) => String(s).replace(/[\s.…]+$/, '');

export default function Loader({
  label,
  text, // alias of label
  message, // alias of label
  variant = 'block',
  size,
  slowAfter = 8000,
  onRetry,
  className = '',
}) {
  const [slow, setSlow] = useState(false);
  const isInline = variant === 'inline';

  useEffect(() => {
    if (isInline || !onRetry) return undefined;
    const t = setTimeout(() => setSlow(true), slowAfter);
    return () => clearTimeout(t);
  }, [isInline, onRetry, slowAfter]);

  const resolved = label ?? text ?? message;
  const px = typeof size === 'number' ? size : SIZES[size || (isInline ? 'sm' : 'md')] || SIZES.md;
  const shown = resolved === undefined ? (isInline ? null : 'Loading') : resolved;

  const ring = (
    <span
      className="app-loader__ring"
      style={{ width: px, height: px, borderWidth: Math.max(2, Math.round(px / 9)) }}
      aria-hidden="true"
    />
  );

  if (isInline) {
    return (
      <span className={`app-loader app-loader--inline ${className}`.trim()} role="status" aria-live="polite">
        {ring}
        {shown ? <span className="app-loader__label">{shown}</span> : null}
      </span>
    );
  }

  return (
    <div className={`app-loader app-loader--${variant} ${className}`.trim()} role="status" aria-live="polite">
      {ring}
      {shown ? <p className="app-loader__label">{cleanLabel(shown)}…</p> : null}
      {slow && (
        <>
          <p className="app-loader__hint">This is taking longer than usual. Please wait a moment.</p>
          <button type="button" className="btn out" onClick={onRetry}>Retry</button>
        </>
      )}
    </div>
  );
}

/** Same loader, shaped as an icon component for APIs that take `icon={Component}`. */
export const LoaderIcon = ({ size = 16 }) => <Loader variant="inline" size={size} />;
