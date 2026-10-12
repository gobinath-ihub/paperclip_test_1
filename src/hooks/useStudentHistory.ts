/* ============================================================
   Student History Hook — Realtime Supabase + n8n Sync
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import { getStudentHistory } from '../lib/api';
import { normalizeStudentHistory, type NormalizedStudentHistory } from '../lib/api-adapters';
import {
  fetchAttemptsFromSupabase,
  fetchStudentProfile,
  subscribeToStudentRealtime,
} from '../lib/supabase';
import { demoStudentHistory } from '../data/demo/history';

interface HistoryState {
  isLoading: boolean;
  error: string | null;
  history: NormalizedStudentHistory | null;
}

export function useStudentHistory(studentId: string) {
  const [state, setState] = useState<HistoryState>({
    isLoading: true,
    error: null,
    history: null,
  });

  const fetchHistory = useCallback(async () => {
    if (!studentId) return;

    try {
      // 1. Fetch real-time data directly from Supabase
      const [supabaseAttempts, supabaseProfile] = await Promise.all([
        fetchAttemptsFromSupabase(studentId),
        fetchStudentProfile(studentId),
      ]);

      if (supabaseAttempts && supabaseAttempts.length > 0) {
        const totalAttempts = supabaseAttempts.length;
        const correctCount = supabaseAttempts.filter((a) => a.verdict === 'correct').length;
        const escalations = supabaseAttempts.filter((a) => (a.feedbackLevel ?? 1) >= 3).length;
        const mastery = supabaseProfile?.mastery ?? Math.round((correctCount / totalAttempts) * 100);
        const correctionRate = supabaseProfile?.correction_rate ?? (totalAttempts ? Math.round((correctCount / totalAttempts) * 100) : 70);

        const miscCounts: Record<string, { label: string; count: number }> = {};
        for (const a of supabaseAttempts) {
          if (a.misconceptionType && a.misconceptionType !== 'none') {
            const label = a.misconceptionLabel || a.misconceptionType.replace(/_/g, ' ');
            if (!miscCounts[a.misconceptionType]) {
              miscCounts[a.misconceptionType] = { label, count: 0 };
            }
            miscCounts[a.misconceptionType].count++;
          }
        }

        const misconceptionPatterns = Object.entries(miscCounts).map(([type, { label, count }]) => ({
          type,
          label,
          count,
        }));

        setState({
          isLoading: false,
          error: null,
          history: {
            studentId,
            mastery,
            totalAttempts,
            correctionRate,
            escalations,
            attempts: supabaseAttempts,
            misconceptionPatterns,
          },
        });
        return;
      }

      // 2. If no direct attempts yet, query n8n master student-history webhook
      const response = await getStudentHistory(studentId);
      if (!response.error && response.data && (response.data.attempts?.length ?? 0) > 0) {
        const normalized = normalizeStudentHistory(response.data);
        setState({ isLoading: false, error: null, history: normalized });
        return;
      }

      // 3. If student profile exists in Supabase with baseline stats
      if (supabaseProfile) {
        setState({
          isLoading: false,
          error: null,
          history: {
            studentId,
            mastery: supabaseProfile.mastery || 50,
            totalAttempts: supabaseProfile.total_attempts || 0,
            correctionRate: supabaseProfile.correction_rate || 60,
            escalations: supabaseProfile.teacher_escalations || 0,
            attempts: [],
            misconceptionPatterns: [],
          },
        });
        return;
      }

      // 4. Fallback demo data
      const normalized = normalizeStudentHistory(demoStudentHistory);
      setState({ isLoading: false, error: null, history: normalized });
    } catch {
      const normalized = normalizeStudentHistory(demoStudentHistory);
      setState({ isLoading: false, error: null, history: normalized });
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchHistory();
    }
  }, [studentId, fetchHistory]);

  // Realtime Supabase subscription for this unique student ID
  useEffect(() => {
    if (!studentId) return;
    const unsubscribe = subscribeToStudentRealtime(studentId, () => {
      fetchHistory();
    });
    return () => {
      unsubscribe();
    };
  }, [studentId, fetchHistory]);

  return { ...state, refetch: fetchHistory };
}
