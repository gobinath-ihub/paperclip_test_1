import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RefreshCw, ArrowRight } from 'lucide-react';
import './RetryChallenge.css';

interface RetryChallengeProps {
  retryQuestion: string;
  onRetry: (question: string) => void;
}

export const RetryChallenge: React.FC<RetryChallengeProps> = ({
  retryQuestion,
  onRetry,
}) => {
  return (
    <Card variant="elevated" className="retry-card">
      <CardHeader>
        <div className="retry-header">
          <div className="retry-header-left">
            <RefreshCw size={18} className="retry-icon" />
            <h3 className="retry-title">Retry Challenge</h3>
          </div>
          <Badge variant="warning" size="md">RETRY READY</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <h4 className="retry-subtitle">Now prove the concept.</h4>
        <p className="retry-description">
          Your next challenge is loaded below. Solve it and submit again.
        </p>

        <div className="retry-question-box">
          <p className="retry-question">{retryQuestion}</p>
        </div>

        <Button
          variant="primary"
          onClick={() => onRetry(retryQuestion)}
          rightIcon={<ArrowRight size={16} />}
          size="lg"
          className="retry-cta"
        >
          Try this problem
        </Button>
      </CardContent>
    </Card>
  );
};
