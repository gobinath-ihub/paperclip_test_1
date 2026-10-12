import React from 'react';
import './Card.css';

interface CardProps {
  variant?: 'default' | 'elevated' | 'glass';
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  style,
}) => {
  return (
    <div className={`card card-${variant} ${className}`} style={style}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className = '', children }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
