import React from 'react';
import { useTeacherInsights } from '../../hooks/useTeacherInsights';
import { AnalyticsCards } from '../../components/teacher/AnalyticsCards';
import { ClassOverview } from '../../components/teacher/ClassOverview';
import { MisconceptionPanel } from '../../components/teacher/MisconceptionPanel';
import { StudentProgressTable } from '../../components/teacher/StudentProgressTable';
import { InterventionPanel } from '../../components/teacher/InterventionPanel';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';
import { RotateCcw } from 'lucide-react';
import './TeacherHomePage.css';

export const TeacherHomePage: React.FC = () => {
  const { isLoading, error, insights, refetch } = useTeacherInsights();

  return (
    <div className="teacher-home-page animate-fade-in">
      <div className="teacher-home-header">
        <div>
          <span className="teacher-kicker">EDUCATOR DASHBOARD</span>
          <h1 className="teacher-title">Cohort Intelligence & Diagnostic Telemetry</h1>
          <p className="teacher-subtitle">
            Real-time aggregated view of student practice, misconception distributions, and automated intervention recommendations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCcw size={16} /> Refresh Telemetry
        </Button>
      </div>

      {isLoading ? (
        <div className="teacher-skeleton-grid">
          <Skeleton height="120px" borderRadius="var(--radius-xl)" />
          <Skeleton height="120px" borderRadius="var(--radius-xl)" />
          <Skeleton height="120px" borderRadius="var(--radius-xl)" />
          <Skeleton height="120px" borderRadius="var(--radius-xl)" />
          <Skeleton height="120px" borderRadius="var(--radius-xl)" />
        </div>
      ) : error || !insights ? (
        <ErrorState message={error || 'Failed to load teacher telemetry.'} onRetry={refetch} />
      ) : (
        <>
          {/* Top KPI Metrics */}
          <AnalyticsCards insights={insights} />

          {/* Middle Row: Class Mastery Overview + Misconception Panel */}
          <div className="teacher-analytics-row">
            <div className="analytics-col-left">
              <ClassOverview insights={insights} />
            </div>
            <div className="analytics-col-right">
              <MisconceptionPanel misconceptions={insights.commonMisconceptions} />
            </div>
          </div>

          {/* Automated Interventions */}
          <InterventionPanel />

          {/* Student Progress Roster */}
          <div className="roster-section">
            <div className="section-head">
              <h2 className="section-title">Cohort Student Roster</h2>
              <span className="section-meta">Grade 9 • Mathematics • 34 Enrolled</span>
            </div>
            <StudentProgressTable students={insights.students} />
          </div>
        </>
      )}
    </div>
  );
};
