import React from 'react';
import { Card } from '../common/Card';
import { Users, Target, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import type { TeacherInsights } from '../../types/teacher';
import './AnalyticsCards.css';

interface AnalyticsCardsProps {
  insights: TeacherInsights;
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ insights }) => {
  return (
    <div className="analytics-cards-grid">
      <Card variant="glass" className="analytics-card">
        <div className="analytics-card-header">
          <span className="analytics-label">Class Mastery</span>
          <div className="analytics-icon-badge badge-primary">
            <Target size={18} />
          </div>
        </div>
        <div className="analytics-value-row">
          <span className="analytics-value">{insights.classMastery}%</span>
          <span className="analytics-trend positive">↑ +4% this week</span>
        </div>
        <span className="analytics-sub">Median across 34 active students</span>
      </Card>

      <Card variant="glass" className="analytics-card">
        <div className="analytics-card-header">
          <span className="analytics-label">Correction Rate</span>
          <div className="analytics-icon-badge badge-success">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="analytics-value-row">
          <span className="analytics-value">{insights.correctionRate}%</span>
          <span className="analytics-trend positive">↑ +8% after retries</span>
        </div>
        <span className="analytics-sub">Successful retry within 2 attempts</span>
      </Card>

      <Card variant="glass" className="analytics-card">
        <div className="analytics-card-header">
          <span className="analytics-label">Class Attempts</span>
          <div className="analytics-icon-badge badge-info">
            <Activity size={18} />
          </div>
        </div>
        <div className="analytics-value-row">
          <span className="analytics-value">{insights.classAttempts}</span>
          <span className="analytics-trend neutral">42 completed today</span>
        </div>
        <span className="analytics-sub">Total problems submitted to AI coach</span>
      </Card>

      <Card variant="glass" className="analytics-card">
        <div className="analytics-card-header">
          <span className="analytics-label">Needs Teacher Intervention</span>
          <div className="analytics-icon-badge badge-warning">
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="analytics-value-row">
          <span className="analytics-value text-warning">{insights.teacherEscalations}</span>
          <span className="analytics-trend negative">3 new today</span>
        </div>
        <span className="analytics-sub">Consecutive misconceptions flagged</span>
      </Card>

      <Card variant="glass" className="analytics-card">
        <div className="analytics-card-header">
          <span className="analytics-label">Active Learners</span>
          <div className="analytics-icon-badge badge-muted">
            <Users size={18} />
          </div>
        </div>
        <div className="analytics-value-row">
          <span className="analytics-value">{insights.activeStudents}</span>
          <span className="analytics-trend positive">85% attendance</span>
        </div>
        <span className="analytics-sub">Currently logged into cohort</span>
      </Card>
    </div>
  );
};
