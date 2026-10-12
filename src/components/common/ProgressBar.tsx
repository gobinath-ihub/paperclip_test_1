import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress-container ${className}`}>
      {(label || showPercentage) && (
        <div className="progress-label">
          {label && <span className="progress-label-text">{label}</span>}
          {showPercentage && (
            <span className="progress-percentage">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={`progress-track progress-${size}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={`progress-fill progress-fill-${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
