/* ============================================================
   Teacher Insights Hook
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import { getTeacherInsights } from '../lib/api';
import { normalizeTeacherInsights } from '../lib/api-adapters';
import { fetchTeacherInsightsDirectFromSupabase, subscribeToTeacherRealtime } from '../lib/supabase';
import type { TeacherInsights } from '../types/teacher';
import { demoTeacherInsights } from '../data/demo/teacher';

interface InsightsState {
  isLoading: boolean;
  error: string | null;
  insights: TeacherInsights | null;
}

export function useTeacherInsights() {
  const [state, setState] = useState<InsightsState>({
    isLoading: true,
    error: null,
    insights: null,
  });

  const fetchInsights = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getTeacherInsights();

      // If live n8n returned valid student roster data
      if (!response.error && response.data && (response.data.students?.length ?? 0) > 0) {
        const normalized = normalizeTeacherInsights(response.data);
        setState({ isLoading: false, error: null, insights: normalized });
        return;
      }

      // If n8n response had empty roster or failed, fetch real-time from Supabase directly
      const realSupabaseData = await fetchTeacherInsightsDirectFromSupabase();
      if (realSupabaseData && realSupabaseData.students.length > 0) {
        setState({ isLoading: false, error: null, insights: realSupabaseData });
        return;
      }

      // Last-resort fallback
      const normalized = normalizeTeacherInsights(response.data || demoTeacherInsights);
      setState({ isLoading: false, error: null, insights: normalized });
    } catch {
      const realSupabaseData = await fetchTeacherInsightsDirectFromSupabase();
      if (realSupabaseData && realSupabaseData.students.length > 0) {
        setState({ isLoading: false, error: null, insights: realSupabaseData });
      } else {
        const normalized = normalizeTeacherInsights(demoTeacherInsights);
        setState({ isLoading: false, error: null, insights: normalized });
      }
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Realtime subscription across attempts, profiles, and interventions
  useEffect(() => {
    const unsubscribe = subscribeToTeacherRealtime(() => {
      fetchInsights();
    });
    return () => {
      unsubscribe();
    };
  }, [fetchInsights]);

  return { ...state, refetch: fetchInsights };
}
