import React from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'muted' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  icon,
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};
