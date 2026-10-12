import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">
        {icon || <Inbox size={40} />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <Button variant="outline" onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};
