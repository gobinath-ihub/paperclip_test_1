import React from 'react';
import { Badge } from './Badge';
import { Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Brain } from 'lucide-react';
import type { CoachStatus } from '../../types/learning';
import { getCoachStatusLabel } from '../../types/learning';

interface StatusBadgeProps {
  status: CoachStatus;
  className?: string;
}

const statusConfig: Record<CoachStatus, {
  variant: 'info' | 'success' | 'warning' | 'destructive' | 'muted' | 'brand';
  icon: React.ReactNode;
}> = {
  idle: { variant: 'muted', icon: <Brain size={12} /> },
  analyzing: { variant: 'brand', icon: <Loader2 size={12} className="animate-spin" /> },
  feedback_ready: { variant: 'info', icon: <AlertCircle size={12} /> },
  retry_ready: { variant: 'warning', icon: <RefreshCw size={12} /> },
  correct: { variant: 'success', icon: <CheckCircle2 size={12} /> },
  needs_review: { variant: 'destructive', icon: <XCircle size={12} /> },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.idle;

  return (
    <Badge variant={config.variant} className={className} icon={config.icon}>
      {getCoachStatusLabel(status)}
    </Badge>
  );
};
