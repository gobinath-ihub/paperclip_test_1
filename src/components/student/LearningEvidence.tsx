import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { Trophy, Target, TrendingUp, BarChart2, CheckCircle2, XCircle } from 'lucide-react';
import { useStudentHistory } from '../../hooks/useStudentHistory';
import { Skeleton } from '../common/Skeleton';
import type { NormalizedFeedback } from '../../lib/api-adapters';
import './LearningEvidence.css';

interface LearningEvidenceProps {
  studentId: string;
  feedbackHistory: NormalizedFeedback[];
}

export const LearningEvidence: React.FC<LearningEvidenceProps> = ({
  studentId,
  feedbackHistory,
}) => {
  const { isLoading, history } = useStudentHistory(studentId);

  if (isLoading) {
    return (
      <Card variant="default" className="evidence-card">
        <CardHeader><Skeleton width="60%" height="1.25rem" /></CardHeader>
        <CardContent>
          <Skeleton width="100%" height="2rem" />
          <div style={{ marginTop: '1rem' }}><Skeleton width="100%" height="8px" /></div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Skeleton width="30%" height="3rem" />
            <Skeleton width="30%" height="3rem" />
            <Skeleton width="30%" height="3rem" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const mastery = history?.mastery || 0;
  const totalAttempts = history?.totalAttempts || 0;
  const escalations = history?.escalations || 0;
  const correctionRate = history?.correctionRate || 0;

  return (
    <Card variant="default" className="evidence-card">
      <CardHeader>
        <div className="evidence-header">
          <Trophy size={18} className="evidence-icon" />
          <h3 className="evidence-title">Learning Evidence</h3>
        </div>
      </CardHeader>

      <CardContent>
        {/* Mastery */}
        <div className="evidence-mastery">
          <span className="mastery-value">{mastery}%</span>
          <span className="mastery-label">Mastery</span>
        </div>
        <ProgressBar
          value={mastery}
          showPercentage={false}
          variant={mastery >= 70 ? 'success' : mastery >= 40 ? 'warning' : 'destructive'}
          size="md"
        />

        {/* Stats */}
        <div className="evidence-stats">
          <div className="evidence-stat">
            <Target size={14} className="evidence-stat-icon" />
            <span className="stat-value">{totalAttempts}</span>
            <span className="stat-label">Attempts</span>
          </div>
          <div className="evidence-stat">
            <TrendingUp size={14} className="evidence-stat-icon" />
            <span className="stat-value">{escalations}</span>
            <span className="stat-label">Escalations</span>
          </div>
          <div className="evidence-stat">
            <BarChart2 size={14} className="evidence-stat-icon" />
            <span className="stat-value">{correctionRate}%</span>
            <span className="stat-label">Correction</span>
          </div>
        </div>

        {/* Recent attempts timeline */}
        {history && history.attempts.length > 0 && (
          <div className="evidence-timeline">
            <div className="timeline-header-row">
              <h4 className="evidence-section-title">Recent attempts</h4>
              <span className="timeline-count-badge">{history.attempts.length} logged</span>
            </div>
            <div className="timeline-list">
              {history.attempts.map((attempt) => (
                <div key={attempt.id} className="timeline-entry">
                  <div className="timeline-entry-top">
                    <Badge
                      variant={attempt.verdict === 'correct' ? 'success' : 'destructive'}
                      size="sm"
                      icon={attempt.verdict === 'correct' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    >
                      {attempt.verdict === 'correct' ? 'CORRECT' : 'INCORRECT'}
                    </Badge>
                    {attempt.feedbackLevel && (
                      <span className="timeline-level">Level {attempt.feedbackLevel}</span>
                    )}
                  </div>
                  {attempt.misconceptionLabel && attempt.verdict !== 'correct' && (
                    <p className="timeline-misconception">{attempt.misconceptionLabel}</p>
                  )}
                  <span className="timeline-time">
                    {attempt.timestamp ? new Date(attempt.timestamp).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    }) + ' • ' + new Date(attempt.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit', minute: '2-digit',
                    }) : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session feedback */}
        {feedbackHistory.length > 0 && (
          <div className="evidence-session">
            <h4 className="evidence-section-title">This session</h4>
            <div className="session-summary">
              <span className="session-stat">
                {feedbackHistory.filter((f) => f.verdict === 'correct').length} correct
              </span>
              <span className="session-divider">•</span>
              <span className="session-stat">
                {feedbackHistory.filter((f) => f.verdict !== 'correct').length} to review
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
