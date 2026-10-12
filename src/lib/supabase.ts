/* ============================================================
   Supabase Client & Data Access Layer
   ============================================================ */

import { createClient } from '@supabase/supabase-js';
import type { AttemptRecord } from '../types/learning';
import type { TeacherStudentEntry, InterventionRecommendation } from '../types/teacher';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xbqoyupdveusmqijwnkl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VBm7FZ4vSyMBqbBti88kOw_7BehYdOh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/* ============================================================
   Profile Queries
   ============================================================ */

export interface SupabaseProfile {
  student_id: string;
  name: string;
  grade: string;
  cohort: string;
  mastery: number;
  total_attempts: number;
  correction_rate: number;
  teacher_escalations: number;
  active_streak: number;
  learning_pace: string;
  notifications_enabled: boolean;
  status: 'active' | 'struggling' | 'excelling' | 'inactive';
  top_misconception?: string;
  topic?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchStudentProfile(studentId: string = 'demo-001'): Promise<SupabaseProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchStudentProfile:', error.message);
      return null;
    }

    if (data) return data as SupabaseProfile;

    // If profile doesn't exist yet for this studentId, auto-create a starting profile
    const newProfile: Partial<SupabaseProfile> = {
      student_id: studentId,
      name: `Student ${studentId.replace(/^demo-?/, '')}`,
      grade: '9',
      cohort: 'Alpha-26',
      mastery: 50,
      total_attempts: 0,
      correction_rate: 60,
      teacher_escalations: 0,
      active_streak: 1,
      learning_pace: 'guided',
      notifications_enabled: true,
      status: 'active',
      topic: 'Linear Equations',
      updated_at: new Date().toISOString(),
    };

    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (!createError && created) return created as SupabaseProfile;
    return null;
  } catch (err) {
    console.warn('Supabase error:', err);
    return null;
  }
}

export async function updateStudentProfile(
  studentId: string,
  updates: Partial<SupabaseProfile>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('student_id', studentId);

    return !error;
  } catch {
    return false;
  }
}

/* ============================================================
   Attempts Queries & Realtime Recording
   ============================================================ */

export interface SupabaseAttempt {
  id?: string;
  student_id: string;
  topic: string;
  question: string;
  expected_answer?: string;
  student_answer: string;
  steps?: string;
  verdict: 'correct' | 'incorrect' | 'partial';
  misconception_type?: string;
  feedback_level?: number;
  feedback?: string;
  retry_question?: string;
  confidence?: number;
  teacher_flag?: boolean;
  created_at?: string;
}

export async function saveAttemptToSupabase(attempt: SupabaseAttempt): Promise<boolean> {
  try {
    // 1. Ensure profile exists first so foreign key is satisfied
    await fetchStudentProfile(attempt.student_id);

    // 2. Insert attempt into attempts table
    const { error: insertError } = await supabase
      .from('attempts')
      .insert([attempt]);

    if (insertError) {
      console.warn('Supabase saveAttemptToSupabase error:', insertError.message);
      return false;
    }

    // 3. Re-calculate student stats in real-time
    const { data: allAttempts } = await supabase
      .from('attempts')
      .select('verdict, misconception_type, teacher_flag')
      .eq('student_id', attempt.student_id);

    if (allAttempts && allAttempts.length > 0) {
      const total = allAttempts.length;
      const correct = allAttempts.filter((a) => a.verdict === 'correct').length;
      const mastery = Math.round((correct / total) * 100);
      const escalations = allAttempts.filter((a) => a.teacher_flag).length;

      const miscCounts: Record<string, number> = {};
      for (const a of allAttempts) {
        if (a.misconception_type && a.misconception_type !== 'none') {
          miscCounts[a.misconception_type] = (miscCounts[a.misconception_type] || 0) + 1;
        }
      }
      const sorted = Object.entries(miscCounts).sort((a, b) => b[1] - a[1]);
      const topMisc = sorted.length > 0 ? sorted[0][0] : null;

      let status: 'active' | 'struggling' | 'excelling' = 'active';
      if (mastery >= 80) status = 'excelling';
      else if (mastery < 60 || escalations > 0) status = 'struggling';

      await updateStudentProfile(attempt.student_id, {
        total_attempts: total,
        mastery,
        correction_rate: Math.min(100, Math.max(0, Math.round((correct / Math.max(1, total)) * 100))),
        teacher_escalations: escalations,
        top_misconception: topMisc || undefined,
        status,
      });
    }

    return true;
  } catch (err) {
    console.warn('saveAttemptToSupabase exception:', err);
    return false;
  }
}

export async function fetchAttemptsFromSupabase(studentId: string): Promise<AttemptRecord[]> {
  try {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any, i: number) => ({
      id: row.id || `attempt-${i}`,
      question: row.question || '',
      studentAnswer: row.student_answer || '',
      steps: typeof row.steps === 'string' ? row.steps.replace(/^\["|"\]$/g, '').replace(/\\n/g, '\n') : '',
      verdict: row.verdict || 'incorrect',
      misconceptionType: row.misconception_type || undefined,
      misconceptionLabel: row.misconception_type && row.misconception_type !== 'none'
        ? row.misconception_type.replace(/_/g, ' ')
        : undefined,
      feedbackLevel: row.feedback_level || 1,
      feedback: row.feedback || '',
      retryQuestion: row.retry_question || undefined,
      timestamp: row.created_at || new Date().toISOString(),
      topic: row.topic || 'Linear Equations',
    }));
  } catch {
    return [];
  }
}

/* ============================================================
   Teacher Insights & Roster Queries
   ============================================================ */

export async function fetchCohortStudentsFromSupabase(): Promise<TeacherStudentEntry[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((p: SupabaseProfile) => ({
      studentId: p.student_id,
      name: p.name,
      mastery: p.mastery || 0,
      attempts: p.total_attempts || 0,
      correctionRate: p.correction_rate || 0,
      topMisconception: p.top_misconception || '',
      topMisconceptionLabel: p.top_misconception?.replace(/_/g, ' ') || '',
      lastActivity: p.updated_at || new Date().toISOString(),
      status: p.status || 'active',
      grade: p.grade || '9',
      topic: p.topic || 'Linear Equations',
    }));
  } catch {
    return [];
  }
}

export async function fetchTeacherInsightsDirectFromSupabase() {
  try {
    const [{ data: profiles }, { data: attempts }] = await Promise.all([
      supabase.from('profiles').select('*').order('name', { ascending: true }),
      supabase.from('attempts').select('*').order('created_at', { ascending: false }),
    ]);

    const profs = profiles || [];
    const atts = attempts || [];

    const studentAttempts: Record<string, any[]> = {};
    const misconceptionCounts: Record<string, number> = {};
    let totalEscalations = 0;

    for (const a of atts) {
      const sId = a.student_id || 'demo-001';
      if (!studentAttempts[sId]) studentAttempts[sId] = [];
      studentAttempts[sId].push(a);

      if (a.misconception_type && a.misconception_type !== 'none') {
        misconceptionCounts[a.misconception_type] = (misconceptionCounts[a.misconception_type] || 0) + 1;
      }

      if (a.teacher_flag === true) {
        totalEscalations++;
      }
    }

    const students: TeacherStudentEntry[] = profs.map((p: any) => {
      const sId = p.student_id || p.id;
      const sAtts = studentAttempts[sId] || [];
      const totalAtts = Math.max(sAtts.length, p.total_attempts || 0);
      const correctCount = sAtts.filter((a) => String(a.verdict).toLowerCase() === 'correct').length;

      let mastery = p.mastery || 0;
      if (sAtts.length > 0) {
        mastery = Math.round((correctCount / sAtts.length) * 100);
      }

      const sMiscCounts: Record<string, number> = {};
      for (const a of sAtts) {
        if (a.misconception_type && a.misconception_type !== 'none') {
          sMiscCounts[a.misconception_type] = (sMiscCounts[a.misconception_type] || 0) + 1;
        }
      }
      const sortedMisc = Object.entries(sMiscCounts).sort((a, b) => b[1] - a[1]);
      const topMisc = sortedMisc.length > 0 ? sortedMisc[0][0] : (p.top_misconception || 'none');

      let status: 'active' | 'struggling' | 'excelling' = 'active';
      if (mastery >= 80) status = 'excelling';
      else if (mastery < 60 || p.teacher_escalations > 0) status = 'struggling';

      return {
        studentId: sId,
        name: p.name || `Student ${sId}`,
        grade: p.grade || '9',
        topic: p.topic || 'Linear Equations',
        mastery,
        attempts: totalAtts,
        correctionRate: p.correction_rate || (totalAtts ? Math.round((correctCount / totalAtts) * 100) : 70),
        topMisconception: topMisc,
        topMisconceptionLabel: topMisc.replace(/_/g, ' '),
        status,
        lastActivity: sAtts[0]?.created_at || p.updated_at || p.created_at || new Date().toISOString(),
      };
    });

    const activeStudents = Math.max(profs.length, 1);
    const totalRosterAttempts = students.reduce((sum, s) => sum + s.attempts, 0);
    const classAttempts = Math.max(atts.length, totalRosterAttempts);
    const totalMastery = students.reduce((sum, s) => sum + s.mastery, 0);
    const classMastery = Math.round(totalMastery / activeStudents);
    const totalCorrection = students.reduce((sum, s) => sum + s.correctionRate, 0);
    const classCorrectionRate = Math.round(totalCorrection / activeStudents);

    const commonMisconceptions = Object.entries(misconceptionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        label: type.replace(/_/g, ' '),
        count,
      }));

    return {
      classAttempts,
      correctionRate: classCorrectionRate,
      teacherEscalations: totalEscalations,
      activeStudents: profs.length,
      classMastery,
      commonMisconceptions,
      students,
    };
  } catch (err) {
    console.warn('Direct Supabase teacher insights error:', err);
    return null;
  }
}

/* ============================================================
   Interventions Queries & Storage
   ============================================================ */

export interface SupabaseIntervention {
  id?: string;
  student_id: string;
  student_name: string;
  concept: string;
  observed_issue: string;
  recommended_intervention: string;
  practice_count?: number;
  status?: 'pending' | 'assigned' | 'resolved';
  created_at?: string;
}

export async function fetchInterventionsFromSupabase(studentId?: string): Promise<InterventionRecommendation[]> {
  try {
    let query = supabase
      .from('interventions')
      .select('*')
      .order('created_at', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((item: any) => ({
      studentId: item.student_id,
      studentName: item.student_name,
      concept: item.concept,
      observedIssue: item.observed_issue,
      recommendedIntervention: item.recommended_intervention,
      practiceCount: item.practice_count || 1,
    }));
  } catch {
    return [];
  }
}

export async function saveInterventionToSupabase(intervention: SupabaseIntervention): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('interventions')
      .insert([{
        student_id: intervention.student_id,
        student_name: intervention.student_name,
        concept: intervention.concept,
        observed_issue: intervention.observed_issue,
        recommended_intervention: intervention.recommended_intervention,
        practice_count: intervention.practice_count || 1,
        status: intervention.status || 'assigned',
      }]);

    return !error;
  } catch {
    return false;
  }
}

/* ============================================================
   Realtime Subscription Channels
   ============================================================ */

export function subscribeToStudentRealtime(
  studentId: string,
  onAttemptChange: () => void
) {
  try {
    const channelName = `student-${studentId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attempts',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          onAttemptChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          onAttemptChange();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('Error removing student realtime channel:', e);
      }
    };
  } catch (err) {
    console.warn('Student realtime subscription error:', err);
    return () => {};
  }
}

export function subscribeToTeacherRealtime(onAnyChange: () => void) {
  try {
    const channelName = `teacher-global-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attempts' },
        () => onAnyChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => onAnyChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interventions' },
        () => onAnyChange()
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('Error removing teacher realtime channel:', e);
      }
    };
  } catch (err) {
    console.warn('Teacher realtime subscription error:', err);
    return () => {};
  }
}
