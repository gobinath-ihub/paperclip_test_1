import React from 'react';
import { useTeacherInsights } from '../../hooks/useTeacherInsights';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { BarChart3, Activity } from 'lucide-react';
import './AnalyticsPage.css';

export const AnalyticsPage: React.FC = () => {
  const { isLoading, error, insights, refetch } = useTeacherInsights();

  return (
    <div className="analytics-page animate-fade-in">
      <div className="analytics-page-header">
        <div>
          <span className="analytics-kicker">COHORT TELEMETRY</span>
          <h1 className="analytics-title">Diagnostic & Mastery Analytics</h1>
          <p className="analytics-subtitle">
            Deep dive into learning curve dynamics, retry efficacy, and misconception resolution rates.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton height="350px" borderRadius="var(--radius-xl)" />
      ) : error || !insights ? (
        <ErrorState message={error || 'Failed to load analytics.'} onRetry={refetch} />
      ) : (
        <>
          {/* Key Metrics Row */}
          <div className="analytics-metric-grid">
            <Card variant="glass" className="analytics-stat-card">
              <span className="stat-label">Correction Efficacy</span>
              <div className="stat-val-row">
                <span className="stat-val text-success">68%</span>
                <Badge variant="success">+8% vs prior month</Badge>
              </div>
              <p className="stat-desc">Percentage of learners who correctly answer on their first retry</p>
            </Card>

            <Card variant="glass" className="analytics-stat-card">
              <span className="stat-label">Average Retries to Mastery</span>
              <div className="stat-val-row">
                <span className="stat-val text-primary">1.6</span>
                <Badge variant="brand">Healthy Velocity</Badge>
              </div>
              <p className="stat-desc">Number of retry cycles before misconception score drops to zero</p>
            </Card>

            <Card variant="glass" className="analytics-stat-card">
              <span className="stat-label">Escalation Threshold</span>
              <div className="stat-val-row">
                <span className="stat-val text-warning">4.8%</span>
                <Badge variant="muted">&lt; 5% Target</Badge>
              </div>
              <p className="stat-desc">Rate of problems requiring direct human educator intervention</p>
            </Card>
          </div>

          {/* Subtopic Mastery Breakdown & Misconception Matrix */}
          <div className="analytics-grid-two-col">
            <Card variant="default">
              <CardHeader>
                <div className="card-title-row">
                  <BarChart3 size={18} className="text-primary" />
                  <h3 className="section-title">Subtopic Mastery Progression</h3>
                </div>
              </CardHeader>
              <CardContent className="subtopics-list">
                <div className="subtopic-bar-item">
                  <div className="subtopic-info">
                    <span className="subtopic-name">Additive & Subtractive Inverse</span>
                    <strong className="subtopic-score">86%</strong>
                  </div>
                  <ProgressBar value={86} variant="success" size="md" showPercentage={false} />
                </div>

                <div className="subtopic-bar-item">
                  <div className="subtopic-info">
                    <span className="subtopic-name">Multiplication & Division Operations</span>
                    <strong className="subtopic-score">74%</strong>
                  </div>
                  <ProgressBar value={74} variant="primary" size="md" showPercentage={false} />
                </div>

                <div className="subtopic-bar-item">
                  <div className="subtopic-info">
                    <span className="subtopic-name">Combining Like Terms</span>
                    <strong className="subtopic-score">68%</strong>
                  </div>
                  <ProgressBar value={68} variant="primary" size="md" showPercentage={false} />
                </div>

                <div className="subtopic-bar-item">
                  <div className="subtopic-info">
                    <span className="subtopic-name">Distributive Property (Parentheses)</span>
                    <strong className="subtopic-score">52%</strong>
                  </div>
                  <ProgressBar value={52} variant="warning" size="md" showPercentage={false} />
                </div>

                <div className="subtopic-bar-item">
                  <div className="subtopic-info">
                    <span className="subtopic-name">Negative Multipliers & Distribution</span>
                    <strong className="subtopic-score">41%</strong>
                  </div>
                  <ProgressBar value={41} variant="destructive" size="md" showPercentage={false} />
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardHeader>
                <div className="card-title-row">
                  <Activity size={18} className="text-warning" />
                  <h3 className="section-title">Cohort Error Classification Matrix</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="error-class-table">
                  <div className="matrix-row header">
                    <span>Misconception Pattern</span>
                    <span>Class Impact</span>
                    <span>Avg Resolution</span>
                  </div>

                  <div className="matrix-row">
                    <div>
                      <strong>Arithmetic Subtraction Error</strong>
                      <span className="matrix-sub">Slip in mental calculation</span>
                    </div>
                    <div>
                      <Badge variant="warning">3 Students</Badge>
                    </div>
                    <span className="matrix-time">1 attempt</span>
                  </div>

                  <div className="matrix-row">
                    <div>
                      <strong>Invalid Inverse Operation</strong>
                      <span className="matrix-sub">Applied addition instead of subtraction</span>
                    </div>
                    <div>
                      <Badge variant="warning">2 Students</Badge>
                    </div>
                    <span className="matrix-time">2 attempts</span>
                  </div>

                  <div className="matrix-row">
                    <div>
                      <strong>Algebraic Manipulation</strong>
                      <span className="matrix-sub">Distributed incorrectly across bracket</span>
                    </div>
                    <div>
                      <Badge variant="destructive">1 Student</Badge>
                    </div>
                    <span className="matrix-time">3 attempts (Escalated)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
