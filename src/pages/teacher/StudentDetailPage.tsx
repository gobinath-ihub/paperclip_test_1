import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherInsights } from '../../hooks/useTeacherInsights';
import { StudentDetail } from '../../components/teacher/StudentDetail';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchStudentProfile } from '../../lib/supabase';
import type { TeacherStudentEntry } from '../../types/teacher';
import './StudentDetailPage.css';

export const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { isLoading, error, insights, refetch } = useTeacherInsights();
  const [profileFallback, setProfileFallback] = useState<TeacherStudentEntry | null>(null);

  const student = insights?.students.find((s) => s.studentId === studentId);

  useEffect(() => {
    if (!student && studentId) {
      fetchStudentProfile(studentId).then((p) => {
        if (p) {
          setProfileFallback({
            studentId: p.student_id,
            name: p.name,
            grade: p.grade,
            topic: p.topic || 'Linear Equations',
            mastery: p.mastery,
            attempts: p.total_attempts,
            correctionRate: p.correction_rate,
            topMisconception: p.top_misconception || '',
            topMisconceptionLabel: p.top_misconception?.replace(/_/g, ' ') || '',
            status: p.status,
            lastActivity: p.updated_at || new Date().toISOString(),
          });
        }
      });
    }
  }, [student, studentId]);

  if (isLoading && !profileFallback) {
    return (
      <div className="student-detail-page">
        <Skeleton height="150px" borderRadius="var(--radius-xl)" />
        <Skeleton height="300px" borderRadius="var(--radius-xl)" />
      </div>
    );
  }

  const activeStudent = student || profileFallback;

  if (!activeStudent) {
    if (error && !insights) {
      return <ErrorState message={error || 'Failed to load student data.'} onRetry={refetch} />;
    }

    return (
      <div className="student-detail-page">
        <EmptyState
          title="Student Not Found"
          description={`No student record could be located matching ID "${studentId}".`}
          action={{
            label: 'Back to Students',
            onClick: () => navigate('/teacher/students'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="student-detail-page animate-fade-in">
      <StudentDetail student={activeStudent} onBack={() => navigate('/teacher/students')} />
    </div>
  );
};
