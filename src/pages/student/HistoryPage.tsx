import React, { useState } from 'react';
import { useStudentHistory } from '../../hooks/useStudentHistory';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Clock, CheckCircle2, XCircle, AlertTriangle,
  RotateCcw, Target, TrendingUp, Sparkles, Filter
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import './HistoryPage.css';

export const HistoryPage: React.FC = () => {
  const { studentId } = useStudent();
  const [filterVerdict, setFilterVerdict] = useState<'all' | 'correct' | 'incorrect'>('all');
  const { isLoading, error, history, refetch } = useStudentHistory(studentId);

  const filteredAttempts = history?.attempts.filter((att) => {
    if (filterVerdict === 'all') return true;
    return att.verdict.toLowerCase() === filterVerdict;
  }) ?? [];

  return (
    <div className="history-page animate-fade-in">
      <div className="history-header">
        <div>
          <span className="history-kicker">LEARNING ARCHIVE</span>
          <h1 className="history-title">Attempt History & Misconception Insights</h1>
          <p className="history-subtitle">
            Review past feedback, trace how your problem solving has evolved, and see conceptual corrections over time.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="history-refresh-btn">
          <RotateCcw size={16} /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="history-loading-grid">
          <Skeleton height="110px" borderRadius="var(--radius-xl)" />
          <Skeleton height="110px" borderRadius="var(--radius-xl)" />
          <Skeleton height="110px" borderRadius="var(--radius-xl)" />
          <Skeleton height="110px" borderRadius="var(--radius-xl)" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="history-kpi-grid">
            <Card variant="glass" className="history-kpi-card">
              <div className="kpi-icon-wrapper kpi-primary">
                <Target size={22} />
              </div>
              <div>
                <span className="kpi-label">Overall Mastery</span>
                <div className="kpi-value">{history?.mastery ?? 0}%</div>
              </div>
            </Card>

            <Card variant="glass" className="history-kpi-card">
              <div className="kpi-icon-wrapper kpi-success">
                <TrendingUp size={22} />
              </div>
              <div>
                <span className="kpi-label">Correction Rate</span>
                <div className="kpi-value">{history?.correctionRate ?? 0}%</div>
              </div>
            </Card>

            <Card variant="glass" className="history-kpi-card">
              <div className="kpi-icon-wrapper kpi-info">
                <Clock size={22} />
              </div>
              <div>
                <span className="kpi-label">Total Attempts</span>
                <div className="kpi-value">{history?.totalAttempts ?? 0}</div>
              </div>
            </Card>

            <Card variant="glass" className="history-kpi-card">
              <div className="kpi-icon-wrapper kpi-warning">
                <AlertTriangle size={22} />
              </div>
              <div>
                <span className="kpi-label">Teacher Escalations</span>
                <div className="kpi-value">{history?.escalations ?? 0}</div>
              </div>
            </Card>
          </div>

          {/* Misconception Patterns Breakdown */}
          {history?.misconceptionPatterns && history.misconceptionPatterns.length > 0 && (
            <Card variant="default" className="misconception-summary-card">
              <CardHeader>
                <div className="misconception-card-header">
                  <Sparkles size={18} className="misconception-header-icon" />
                  <h3 className="misconception-card-title">Identified Misconception Trends</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="misconception-tags-list">
                  {history.misconceptionPatterns.map((p, idx) => (
                    <div key={idx} className="misconception-tag-pill">
                      <span className="misconception-tag-name">{p.label}</span>
                      <span className="misconception-tag-badge">{p.count} occurrences</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Bar */}
          <div className="history-filter-bar">
            <div className="filter-group">
              <Filter size={16} className="filter-icon" />
              <span className="filter-label">Filter:</span>
              <button
                className={`filter-btn ${filterVerdict === 'all' ? 'active' : ''}`}
                onClick={() => setFilterVerdict('all')}
              >
                All ({history?.attempts.length ?? 0})
              </button>
              <button
                className={`filter-btn ${filterVerdict === 'correct' ? 'active' : ''}`}
                onClick={() => setFilterVerdict('correct')}
              >
                Correct Only
              </button>
              <button
                className={`filter-btn ${filterVerdict === 'incorrect' ? 'active' : ''}`}
                onClick={() => setFilterVerdict('incorrect')}
              >
                Needs Review Only
              </button>
            </div>
          </div>

          {/* Attempts List */}
          {filteredAttempts.length === 0 ? (
            <EmptyState
              title="No attempts found"
              description="You haven't completed any challenges matching this filter yet."
            />
          ) : (
            <div className="history-timeline">
              {filteredAttempts.map((attempt) => {
                const isCorrect = attempt.verdict.toLowerCase() === 'correct';
                return (
                  <Card key={attempt.id} variant="elevated" className="attempt-history-card">
                    <div className="attempt-history-top">
                      <div className="attempt-topic-group">
                        <Badge variant={isCorrect ? 'success' : 'destructive'} icon={isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}>
                          {isCorrect ? 'SOLVED' : 'MISCONCEPTION DETECTED'}
                        </Badge>
                        <span className="attempt-topic-badge">{attempt.topic}</span>
                        {attempt.feedbackLevel && (
                          <Badge variant="muted" size="sm">
                            Level {attempt.feedbackLevel} Guidance
                          </Badge>
                        )}
                      </div>
                      <time className="attempt-time">
                        {new Date(attempt.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>

                    <div className="attempt-question-box">
                      <span className="attempt-label">Problem</span>
                      <p className="attempt-question-text">{attempt.question}</p>
                    </div>

                    <div className="attempt-details-grid">
                      <div className="attempt-answer-box">
                        <span className="attempt-label">Your Submitted Answer</span>
                        <code className="attempt-answer-value">{attempt.studentAnswer}</code>
                      </div>

                      {attempt.steps && (
                        <div className="attempt-working-box">
                          <span className="attempt-label">Working Shown</span>
                          <pre className="attempt-working-value">{attempt.steps}</pre>
                        </div>
                      )}
                    </div>

                    {attempt.misconceptionType && (
                      <div className="attempt-misconception-callout">
                        <div className="misconception-title-row">
                          <AlertTriangle size={15} />
                          <strong>Diagnosed Issue:</strong> {attempt.misconceptionLabel || attempt.misconceptionType}
                        </div>
                        {attempt.feedback && (
                          <p className="attempt-feedback-text">{attempt.feedback}</p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
