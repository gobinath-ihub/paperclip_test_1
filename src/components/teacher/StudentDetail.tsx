import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { Skeleton } from '../common/Skeleton';
import {
  ArrowLeft, User, Target, AlertTriangle,
  CheckCircle2, XCircle, Send, Check, Sparkles
} from 'lucide-react';
import type { TeacherStudentEntry, InterventionRecommendation } from '../../types/teacher';
import type { AttemptRecord } from '../../types/learning';
import {
  fetchAttemptsFromSupabase,
  fetchInterventionsFromSupabase,
  saveInterventionToSupabase,
  subscribeToStudentRealtime
} from '../../lib/supabase';
import './StudentDetail.css';

interface StudentDetailProps {
  student: TeacherStudentEntry;
  onBack?: () => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ student, onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'attempts' | 'interventions'>('overview');
  const [assignedNote, setAssignedNote] = useState('');
  const [assignedSuccess, setAssignedSuccess] = useState(false);
  const [realAttempts, setRealAttempts] = useState<AttemptRecord[]>([]);
  const [interventionsList, setInterventionsList] = useState<InterventionRecommendation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    const [atts, interv] = await Promise.all([
      fetchAttemptsFromSupabase(student.studentId),
      fetchInterventionsFromSupabase(student.studentId),
    ]);
    setRealAttempts(atts);
    setInterventionsList(interv);
    setIsLoadingData(false);
  }, [student.studentId]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStudentRealtime(student.studentId, () => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, [student.studentId, loadData]);

  const handleAssignAction = async () => {
    if (!assignedNote.trim()) return;
    await saveInterventionToSupabase({
      student_id: student.studentId,
      student_name: student.name,
      concept: student.topMisconceptionLabel || 'Linear Equations',
      observed_issue: student.topMisconception ? `Observed struggle with ${student.topMisconceptionLabel}` : 'Teacher assigned practice',
      recommended_intervention: assignedNote.trim(),
      status: 'assigned',
    });
    setAssignedSuccess(true);
    setAssignedNote('');
    loadData();
    setTimeout(() => {
      setAssignedSuccess(false);
    }, 2500);
  };

  const attemptsCount = realAttempts.length > 0 ? realAttempts.length : student.attempts;

  return (
    <div className="student-detail-view animate-fade-in">
      {/* Back button */}
      <div className="detail-top-nav">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (onBack ? onBack() : navigate('/teacher/students'))}
        >
          <ArrowLeft size={16} /> Back to Class Roster
        </Button>
      </div>

      {/* Header Profile Card */}
      <Card variant="glass" className="student-detail-header-card">
        <div className="detail-header-row">
          <div className="detail-avatar-section">
            <div className="detail-avatar">
              <User size={32} />
            </div>
            <div>
              <div className="detail-name-row">
                <h2 className="detail-name">{student.name}</h2>
                <Badge
                  variant={
                    student.status === 'excelling'
                      ? 'success'
                      : student.status === 'struggling'
                      ? 'destructive'
                      : 'brand'
                  }
                >
                  {student.status.toUpperCase()}
                </Badge>
              </div>
              <div className="detail-meta">
                <span>ID: <strong>{student.studentId}</strong></span>
                <span>•</span>
                <span>Grade {student.grade}</span>
                <span>•</span>
                <span>Topic: {student.topic}</span>
              </div>
            </div>
          </div>

          <div className="detail-kpis">
            <div className="detail-kpi-item">
              <span className="detail-kpi-label">Mastery</span>
              <span className="detail-kpi-val text-primary">{student.mastery}%</span>
            </div>
            <div className="detail-kpi-item">
              <span className="detail-kpi-label">Realtime Attempts</span>
              <span className="detail-kpi-val">{attemptsCount}</span>
            </div>
            <div className="detail-kpi-item">
              <span className="detail-kpi-label">Correction Rate</span>
              <span className="detail-kpi-val text-success">{student.correctionRate}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`detail-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Diagnostic Overview
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'attempts' ? 'active' : ''}`}
          onClick={() => setActiveTab('attempts')}
        >
          Attempt History ({attemptsCount})
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'interventions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interventions')}
        >
          Interventions & Actions {interventionsList.length > 0 && `(${interventionsList.length})`}
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="detail-tab-content">
          <div className="detail-overview-grid">
            <Card variant="default">
              <CardHeader>
                <div className="card-title-row">
                  <Target size={18} className="text-primary" />
                  <h3 className="section-title">Mastery Progress</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mastery-summary-box">
                  <ProgressBar
                    value={student.mastery}
                    variant={student.mastery >= 80 ? 'success' : student.mastery >= 60 ? 'primary' : 'warning'}
                    size="lg"
                  />
                  <p className="mastery-explanation">
                    {student.name} has logged {attemptsCount} attempts on {student.topic} with a {student.mastery}% mastery index.
                    {student.topMisconception ? ` Main challenge area: ${student.topMisconceptionLabel}.` : ' Good conceptual trajectory.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardHeader>
                <div className="card-title-row">
                  <AlertTriangle size={18} className="text-warning" />
                  <h3 className="section-title">Diagnosed Misconception Profile</h3>
                </div>
              </CardHeader>
              <CardContent>
                {student.topMisconception && student.topMisconception !== 'none' ? (
                  <div className="student-misconception-callout">
                    <Badge variant="warning">Primary Misconception</Badge>
                    <h4 className="callout-misconception-title">
                      {student.topMisconceptionLabel || student.topMisconception}
                    </h4>
                    <p className="callout-misconception-desc">
                      Frequently detected in student submissions. The AI coach has provided Level 1-2 scaffolded hints on undoing terms.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted">No prominent recurring misconceptions detected for this student.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Attempts */}
      {activeTab === 'attempts' && (
        <div className="detail-tab-content">
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className="section-title">Supabase Realtime Submissions</h3>
                <Badge variant="brand" size="sm">ID: {student.studentId}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-3">
                  <Skeleton height="80px" borderRadius="var(--radius-md)" />
                  <Skeleton height="80px" borderRadius="var(--radius-md)" />
                </div>
              ) : realAttempts.length > 0 ? (
                <div className="attempts-sample-list">
                  {realAttempts.map((att) => {
                    const isCorrect = att.verdict === 'correct';
                    return (
                      <div key={att.id} className="detail-attempt-card">
                        <div className="attempt-card-head">
                          <Badge
                            variant={isCorrect ? 'success' : 'destructive'}
                            icon={isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          >
                            {isCorrect ? 'Correct' : 'Misconception Flagged'}
                          </Badge>
                          <span className="attempt-date">
                            {att.timestamp ? new Date(att.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'Recent'}
                          </span>
                        </div>

                        <p className="attempt-q">{att.question}</p>

                        <div className="attempt-io-row">
                          <div>
                            <span className="sub-tag">Submitted Answer</span>
                            <code>{att.studentAnswer}</code>
                          </div>
                          <div>
                            <span className="sub-tag">{isCorrect ? 'Outcome' : 'Diagnosed Misconception'}</span>
                            <span className={isCorrect ? 'text-success font-600' : 'text-destructive font-600'}>
                              {isCorrect ? 'Mathematically Sound' : (att.misconceptionLabel || att.misconceptionType || 'Calculation error')}
                            </span>
                          </div>
                        </div>

                        {att.steps && (
                          <div className="attempt-steps-box">
                            <span className="sub-tag">Working Steps</span>
                            <pre className="attempt-steps-code">{att.steps}</pre>
                          </div>
                        )}

                        {att.feedback && (
                          <div className="attempt-feedback-box">
                            <span className="sub-tag">AI Coach Feedback Given</span>
                            <p className="attempt-feedback-text">{att.feedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-attempts-state text-center py-6">
                  <p className="text-muted">No challenge attempts recorded yet in Supabase for {student.studentId}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Interventions */}
      {activeTab === 'interventions' && (
        <div className="detail-tab-content">
          <Card variant="default">
            <CardHeader>
              <div className="card-title-row">
                <Sparkles size={18} className="text-primary" />
                <h3 className="section-title">Prescribe Custom Intervention</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prescribe-box">
                <label className="prescribe-label">Instructional Note or Targeted Assignment</label>
                <textarea
                  className="prescribe-textarea"
                  placeholder="e.g. Assigned visual balance scale manipulative and 3 retry questions on linear equation steps..."
                  value={assignedNote}
                  onChange={(e) => setAssignedNote(e.target.value)}
                  rows={3}
                />
                <div className="prescribe-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAssignAction}
                    disabled={!assignedNote.trim()}
                  >
                    {assignedSuccess ? (
                      <>
                        <Check size={14} /> Assigned to {student.studentId}
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Dispatch Intervention to Student
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Existing Interventions */}
              {interventionsList.length > 0 && (
                <div className="existing-interventions-list mt-6">
                  <h4 className="font-700 text-sm mb-3">Active Interventions for {student.name}</h4>
                  <div className="space-y-3">
                    {interventionsList.map((interv, i) => (
                      <div key={i} className="p-3 bg-muted rounded-md border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-600 text-sm">{interv.concept}</span>
                          <Badge variant="brand" size="sm">Assigned</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{interv.observedIssue}</p>
                        <p className="text-xs font-500 bg-background p-2 rounded border border-border">
                          {interv.recommendedIntervention}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
