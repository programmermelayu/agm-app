import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const variantStyles = {
    default: 'bg-gray-200 text-gray-800',
    primary: 'bg-blue-200 text-blue-800',
    success: 'bg-green-200 text-green-800',
    warning: 'bg-yellow-200 text-yellow-800',
    danger: 'bg-red-200 text-red-800',
    info: 'bg-cyan-200 text-cyan-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs rounded',
    md: 'px-3 py-1 text-sm rounded-full',
  };

  return (
    <span
      className={clsx(
        'font-medium inline-block',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {children}
    </span>
  );
};
