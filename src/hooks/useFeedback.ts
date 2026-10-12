/* ============================================================
   Feedback Hook — Manages the student learning loop
   ============================================================ */

import { useState, useCallback } from 'react';
import { submitFeedback } from '../lib/api';
import { normalizeFeedbackResponse, type NormalizedFeedback } from '../lib/api-adapters';
import { demoFeedbackIncorrect } from '../data/demo/feedback';
import { saveAttemptToSupabase } from '../lib/supabase';
import type { ChallengeState } from '../types/student';
import type { CoachStatus } from '../types/learning';

interface FeedbackState {
  isLoading: boolean;
  error: string | null;
  feedback: NormalizedFeedback | null;
  coachStatus: CoachStatus;
  feedbackHistory: NormalizedFeedback[];
}

export function useFeedback() {
  const [state, setState] = useState<FeedbackState>({
    isLoading: false,
    error: null,
    feedback: null,
    coachStatus: 'idle',
    feedbackHistory: [],
  });

  const submit = useCallback(async (
    challenge: ChallengeState,
    studentId: string
  ) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      coachStatus: 'analyzing',
    }));

    const response = await submitFeedback({
      studentId,
      subject: challenge.subject,
      grade: challenge.grade,
      topic: challenge.topic,
      question: challenge.question,
      expectedAnswer: challenge.expectedAnswer,
      studentAnswer: challenge.studentAnswer,
      steps: challenge.working,
      attemptNumber: challenge.attemptNumber,
    });

    if (response.error) {
      // Fallback to demo data
      const demoFeedback = normalizeFeedbackResponse(demoFeedbackIncorrect);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
        feedback: demoFeedback,
        coachStatus: demoFeedback?.retryQuestion ? 'retry_ready' : 'feedback_ready',
        feedbackHistory: demoFeedback
          ? [...prev.feedbackHistory, demoFeedback]
          : prev.feedbackHistory,
      }));
      return;
    }

    const normalized = normalizeFeedbackResponse(response.data);

    let coachStatus: CoachStatus = 'feedback_ready';
    if (normalized?.verdict === 'correct') coachStatus = 'correct';
    else if (normalized?.retryQuestion) coachStatus = 'retry_ready';
    else if (normalized?.feedbackLevel && normalized.feedbackLevel >= 3) coachStatus = 'needs_review';

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: null,
      feedback: normalized,
      coachStatus,
      feedbackHistory: normalized
        ? [...prev.feedbackHistory, normalized]
        : prev.feedbackHistory,
    }));

    // Async record attempt to Supabase
    saveAttemptToSupabase({
      student_id: studentId,
      topic: challenge.topic,
      question: challenge.question,
      expected_answer: challenge.expectedAnswer,
      student_answer: challenge.studentAnswer,
      steps: challenge.working,
      verdict: normalized?.verdict || 'incorrect',
      misconception_type: normalized?.misconceptionType || undefined,
      feedback_level: normalized?.feedbackLevel || 1,
      feedback: normalized?.feedback,
      retry_question: normalized?.retryQuestion || undefined,
      confidence: normalized?.confidence,
    });
  }, []);

  const clearFeedback = useCallback(() => {
    setState((prev) => ({
      ...prev,
      feedback: null,
      error: null,
      coachStatus: 'idle',
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    submit,
    clearFeedback,
    clearError,
  };
}
