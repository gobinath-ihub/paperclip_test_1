import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius,
  className = '',
}) => {
  return (
    <div
      className={`skeleton animate-shimmer ${className}`}
      style={{ width, height, borderRadius: borderRadius || 'var(--radius-md)' }}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <Skeleton height="1.25rem" width="60%" />
    <Skeleton height="0.875rem" width="40%" />
    <div style={{ marginTop: '1rem' }}>
      <Skeleton height="0.75rem" width="100%" />
      <Skeleton height="0.75rem" width="80%" />
    </div>
  </div>
);
