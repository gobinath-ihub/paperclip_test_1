import React from 'react';
import { useTeacherInsights } from '../../hooks/useTeacherInsights';
import { StudentProgressTable } from '../../components/teacher/StudentProgressTable';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Card } from '../../components/common/Card';
import { Users, AlertCircle, Award } from 'lucide-react';
import './StudentsPage.css';

export const StudentsPage: React.FC = () => {
  const { isLoading, error, insights, refetch } = useTeacherInsights();

  const total = insights?.students.length ?? 0;
  const struggling = insights?.students.filter((s) => s.status === 'struggling').length ?? 0;
  const excelling = insights?.students.filter((s) => s.status === 'excelling').length ?? 0;

  return (
    <div className="students-page animate-fade-in">
      <div className="students-page-header">
        <div>
          <span className="students-kicker">ROSTER MANAGEMENT</span>
          <h1 className="students-title">Class Roster & Student Profiles</h1>
          <p className="students-subtitle">
            Inspect individual student trajectories, track misconception trends, and access personalized diagnostic histories.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton height="350px" borderRadius="var(--radius-xl)" />
      ) : error || !insights ? (
        <ErrorState message={error || 'Failed to load student roster.'} onRetry={refetch} />
      ) : (
        <>
          <div className="roster-kpis">
            <Card variant="glass" className="roster-kpi-pill">
              <Users size={18} className="text-primary" />
              <div className="pill-text">
                <span className="pill-count">{total}</span>
                <span className="pill-name">Total Enrolled</span>
              </div>
            </Card>

            <Card variant="glass" className="roster-kpi-pill">
              <AlertCircle size={18} className="text-destructive" />
              <div className="pill-text">
                <span className="pill-count text-destructive">{struggling}</span>
                <span className="pill-name">Needs Immediate Intervention</span>
              </div>
            </Card>

            <Card variant="glass" className="roster-kpi-pill">
              <Award size={18} className="text-success" />
              <div className="pill-text">
                <span className="pill-count text-success">{excelling}</span>
                <span className="pill-name">Excelling (Mastery &ge; 80%)</span>
              </div>
            </Card>
          </div>

          <StudentProgressTable students={insights.students} />
        </>
      )}
    </div>
  );
};
