import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size = 'md', // 'sm' | 'md'
  className = ''
}) {
  return (
    <span className={`badge-pill badge-${variant} ${size === 'sm' ? 'badge-sm' : ''} ${className}`}>
      {children}
    </span>
  );
}
