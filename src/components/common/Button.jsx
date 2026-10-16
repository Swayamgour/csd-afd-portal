import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'outline':
      case 'secondary':
        return 'btn out';
      case 'ghost':
        return 'btn ghost';
      case 'danger':
        return 'btn danger';
      default:
        return 'btn';
    }
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'sm';
    if (size === 'lg') return 'big';
    return '';
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${getVariantClass()} ${getSizeClass()} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span className="spinner-sm" aria-hidden="true" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 16} aria-hidden="true" />
      )}
      <span>{children}</span>
      {!loading && IconRight && <IconRight size={size === 'sm' ? 14 : 16} aria-hidden="true" />}
    </button>
  );
}

export default Button;
