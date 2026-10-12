import React, { useState, useCallback } from 'react';
import { CurrentChallenge } from './CurrentChallenge';
import { FeedbackPanel } from './FeedbackPanel';
import { WorkedExample } from './WorkedExample';
import { RetryChallenge } from './RetryChallenge';
import { LearningResources } from './LearningResources';
import { ResourceDiscoveryConnector } from './ResourceDiscoveryConnector';
import { LearningEvidence } from './LearningEvidence';
import { useFeedback } from '../../hooks/useFeedback';
import { useResourceDiscovery } from '../../hooks/useResourceDiscovery';
import { useStudent } from '../../context/StudentContext';
import type { ChallengeState } from '../../types/student';
import './StudentWorkspace.css';

const DEFAULT_CHALLENGE: ChallengeState = {
  question: 'Solve 6x + 4 = 22.\nFirst subtract 4 from both sides,\nthen divide by 6 to find x.',
  expectedAnswer: '',
  studentAnswer: '',
  working: '',
  subject: 'Mathematics',
  grade: '9',
  topic: 'Linear Equations',
  attemptNumber: 1,
};

export const StudentWorkspace: React.FC = () => {
  const { studentId, setStudentId } = useStudent();
  const [challenge, setChallenge] = useState<ChallengeState>(DEFAULT_CHALLENGE);
  const {
    isLoading, feedback, coachStatus, feedbackHistory, submit,
  } = useFeedback();
  const resourceDiscovery = useResourceDiscovery();

  const handleSubmit = useCallback(async () => {
    if (!challenge.studentAnswer.trim() || !challenge.working.trim()) return;
    await submit(challenge, studentId);
  }, [challenge, studentId, submit]);

  // Asynchronously discover targeted remedial resources when misconception is identified
  React.useEffect(() => {
    if (feedback && feedback.verdict !== 'correct') {
      resourceDiscovery.discover({
        studentId,
        subject: challenge.subject || 'Mathematics',
        grade: challenge.grade || '9',
        topic: challenge.topic || 'Linear Equations',
        question: challenge.question,
        studentAnswer: challenge.studentAnswer,
        expectedAnswer: challenge.expectedAnswer,
        misconceptionType: feedback.misconceptionType || '',
      });
    }
  }, [feedback]);

  const handleReset = useCallback(() => {
    setChallenge(DEFAULT_CHALLENGE);
  }, []);

  const handleRetry = useCallback((retryQuestion: string) => {
    setChallenge((prev) => ({
      ...prev,
      question: retryQuestion,
      studentAnswer: '',
      working: '',
      expectedAnswer: '',
      attemptNumber: prev.attemptNumber + 1,
    }));
    // Scroll to challenge
    const el = document.getElementById('current-challenge');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleFieldChange = useCallback((field: keyof ChallengeState, value: string) => {
    setChallenge((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="workspace">
      <div className="workspace-main">
        <div id="current-challenge">
          <CurrentChallenge
            challenge={challenge}
            studentId={studentId}
            isLoading={isLoading}
            onStudentIdChange={setStudentId}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </div>

        {/* CRITICAL: All feedback sections remain visible together */}
        {feedback && (
          <div className="workspace-feedback-flow stagger-children">
            <FeedbackPanel
              feedback={feedback}
              coachStatus={coachStatus}
            />

            {feedback.workedExample && (
              <WorkedExample content={feedback.workedExample} />
            )}

            {feedback.retryQuestion && (
              <RetryChallenge
                retryQuestion={feedback.retryQuestion}
                onRetry={handleRetry}
              />
            )}

            {/* Targeted Multi-Source Resource Discovery Connector (Remedial) */}
            {feedback.verdict !== 'correct' && (
              <ResourceDiscoveryConnector
                status={resourceDiscovery.status}
                topic={resourceDiscovery.topic || challenge.topic}
                query={resourceDiscovery.query}
                misconceptionLabel={feedback.misconceptionLabel}
                resources={resourceDiscovery.resources}
                errorMessage={resourceDiscovery.errorMessage}
                onRetry={() => {
                  resourceDiscovery.discover({
                    studentId,
                    subject: challenge.subject || 'Mathematics',
                    grade: challenge.grade || '9',
                    topic: challenge.topic || 'Linear Equations',
                    question: challenge.question,
                    studentAnswer: challenge.studentAnswer,
                    expectedAnswer: challenge.expectedAnswer,
                    misconceptionType: feedback.misconceptionType || '',
                  });
                }}
              />
            )}

            {feedback.verdict !== 'correct' && feedback.resources.length > 0 && resourceDiscovery.status === 'idle' && (
              <LearningResources resources={feedback.resources} />
            )}
          </div>
        )}
      </div>

      <aside className="workspace-sidebar">
        <LearningEvidence
          studentId={studentId}
          feedbackHistory={feedbackHistory}
        />
      </aside>
    </div>
  );
};
