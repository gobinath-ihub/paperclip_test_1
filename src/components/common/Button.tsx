import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="btn-spinner" size={size === 'sm' ? 14 : 16} />
      ) : leftIcon ? (
        <span className="btn-icon">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {rightIcon && !isLoading && <span className="btn-icon">{rightIcon}</span>}
    </button>
  );
};
