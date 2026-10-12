import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import './ErrorState.css';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "We couldn't process your request right now. Please try again.",
  onRetry,
  className = '',
}) => {
  return (
    <div className={`error-state ${className}`} role="alert">
      <div className="error-state-icon">
        <AlertTriangle size={36} />
      </div>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
