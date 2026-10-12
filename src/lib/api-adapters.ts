/* ============================================================
   API Adapters — Normalize backend responses for UI
   ============================================================
   The UI MUST NEVER depend directly on unknown n8n response
   structures. All raw responses are normalized here first.
   ============================================================ */

import type {
  FeedbackResponse,
  StudentHistoryResponse,
  TeacherInsightsResponse,
  ResourcesResponse,
  ResourceItem,
} from '../types/api';
import type { LearningResource, AttemptRecord, CategorizedResources } from '../types/learning';
import type { TeacherInsights, TeacherStudentEntry, TeacherMisconception } from '../types/teacher';
import { formatMisconception } from '../types/learning';

/* ============================================================
   Feedback
   ============================================================ */

export interface NormalizedFeedback {
  verdict: 'correct' | 'incorrect' | 'partial';
  misconceptionType: string | null;
  misconceptionLabel: string;
  confidence: number;
  feedbackLevel: number;
  feedback: string;
  explanation: string;
  workedExample: string;
  retryQuestion: string | null;
  resources: LearningResource[];
}

export function normalizeFeedbackResponse(
  raw: FeedbackResponse | null | undefined
): NormalizedFeedback | null {
  if (!raw) return null;

  const verdict =
    raw.verdict === 'correct' || raw.verdict === 'incorrect' || raw.verdict === 'partial'
      ? raw.verdict
      : 'incorrect';

  const isCorrect = verdict === 'correct';
  const hasMisconception = !isCorrect && raw.misconceptionType && raw.misconceptionType !== 'none';

  return {
    verdict,
    misconceptionType: hasMisconception ? raw.misconceptionType! : null,
    misconceptionLabel: hasMisconception ? formatMisconception(raw.misconceptionType) : '',
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0,
    feedbackLevel: typeof raw.feedbackLevel === 'number' ? raw.feedbackLevel : 1,
    feedback: raw.feedback || '',
    explanation: raw.explanation || '',
    workedExample: isCorrect ? '' : (raw.workedExample || ''),
    retryQuestion: raw.retryQuestion || null,
    resources: normalizeResources(raw.resources ? { resources: raw.resources } : null),
  };
}

/* ============================================================
   Student History
   ============================================================ */

export interface NormalizedStudentHistory {
  studentId: string;
  mastery: number;
  totalAttempts: number;
  correctionRate: number;
  escalations: number;
  attempts: AttemptRecord[];
  misconceptionPatterns: Array<{ type: string; label: string; count: number }>;
}

export function normalizeStudentHistory(
  raw: StudentHistoryResponse | null | undefined
): NormalizedStudentHistory {
  if (!raw) {
    return {
      studentId: '',
      mastery: 0,
      totalAttempts: 0,
      correctionRate: 0,
      escalations: 0,
      attempts: [],
      misconceptionPatterns: [],
    };
  }

  const rawAny = raw as Record<string, any>;
  const rawAttempts: any[] = raw.attempts || [];

  const attempts: AttemptRecord[] = rawAttempts.map((a: any, i: number) => ({
    id: a.id || a.attemptId || `attempt-${i}`,
    question: a.question || '',
    studentAnswer: a.studentAnswer || '',
    steps: Array.isArray(a.steps) ? a.steps.join('\n') : (typeof a.steps === 'string' ? a.steps : ''),
    verdict: (a.verdict === 'correct' || a.verdict === 'incorrect' || a.verdict === 'partial')
      ? a.verdict
      : 'incorrect',
    misconceptionType: a.misconceptionType || undefined,
    misconceptionLabel: formatMisconception(a.misconceptionType),
    feedbackLevel: typeof a.feedbackLevel === 'number' ? a.feedbackLevel : 1,
    feedback: a.feedback || '',
    retryQuestion: a.retryQuestion || undefined,
    timestamp: a.timestamp || a.recordedAt || new Date().toISOString(),
    topic: a.topic || 'Linear Equations',
  }));

  // Build patterns if not directly returned by backend
  let patterns = (raw.misconceptionPatterns || []).map((mp) => ({
    type: mp.type,
    label: formatMisconception(mp.type),
    count: mp.count,
  }));

  if (patterns.length === 0 && attempts.length > 0) {
    const counts: Record<string, number> = {};
    attempts.forEach((att) => {
      if (att.misconceptionType) {
        counts[att.misconceptionType] = (counts[att.misconceptionType] || 0) + 1;
      }
    });
    patterns = Object.entries(counts).map(([type, count]) => ({
      type,
      label: formatMisconception(type),
      count,
    }));
  }

  const correctionRateRaw = raw.correctionRate ?? 0;
  const correctionRate = correctionRateRaw <= 1 && correctionRateRaw > 0
    ? Math.round(correctionRateRaw * 100)
    : Math.round(correctionRateRaw);

  return {
    studentId: raw.studentId || 'demo-001',
    mastery: raw.mastery || 0,
    totalAttempts: raw.totalAttempts || attempts.length,
    correctionRate,
    escalations: raw.escalations ?? rawAny.teacherEscalations ?? 0,
    attempts,
    misconceptionPatterns: patterns,
  };
}

/* ============================================================
   Teacher Insights
   ============================================================ */

export function normalizeTeacherInsights(
  raw: TeacherInsightsResponse | null | undefined
): TeacherInsights {
  if (!raw) {
    return {
      classAttempts: 0,
      correctionRate: 0,
      teacherEscalations: 0,
      activeStudents: 0,
      classMastery: 0,
      commonMisconceptions: [],
      students: [],
    };
  }

  const rawAny = raw as Record<string, any>;

  // Handle commonMisconceptions vs topMisconceptions from live n8n
  const rawMisconceptions: any[] =
    raw.commonMisconceptions ||
    (rawAny.topMisconceptions || []).map((m: any) => ({
      type: m.misconception || m.type,
      count: m.count,
    }));

  const misconceptions: TeacherMisconception[] = rawMisconceptions.map((m: any) => ({
    type: m.type,
    label: formatMisconception(m.type),
    count: m.count,
  }));

  const correctionRateRaw = raw.correctionRate ?? rawAny.correctionRate ?? 0;
  const correctionRate = correctionRateRaw <= 1 && correctionRateRaw > 0
    ? Math.round(correctionRateRaw * 100)
    : Math.round(correctionRateRaw);

  const students: TeacherStudentEntry[] = (raw.students && raw.students.length > 0)
    ? raw.students.map((s) => ({
        studentId: s.studentId || '',
        name: s.name || `Student ${s.studentId}`,
        mastery: s.mastery || 0,
        attempts: s.attempts || 0,
        correctionRate: s.correctionRate || 0,
        topMisconception: s.topMisconception || '',
        topMisconceptionLabel: formatMisconception(s.topMisconception),
        lastActivity: s.lastActivity || '',
        status:
          s.status === 'active' || s.status === 'struggling' || s.status === 'excelling' || s.status === 'inactive'
            ? s.status
            : 'active',
        grade: s.grade || '9',
        topic: s.topic || 'Linear Equations',
      }))
    : [];

  const totalRosterAttempts = students.reduce((sum, s) => sum + (s.attempts || 0), 0);
  const classAttempts = raw.classAttempts ?? rawAny.totalAttempts ?? totalRosterAttempts;

  const totalMastery = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.mastery, 0) / students.length) : 0;
  const classMastery = raw.classMastery ?? totalMastery;

  const avgCorrection = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.correctionRate, 0) / students.length) : 0;
  const finalCorrectionRate = correctionRate > 0 ? correctionRate : avgCorrection;

  return {
    classAttempts,
    correctionRate: finalCorrectionRate,
    teacherEscalations: raw.teacherEscalations ?? rawAny.teacherEscalations ?? 0,
    activeStudents: raw.activeStudents ?? rawAny.activeStudents ?? students.length,
    classMastery,
    commonMisconceptions: misconceptions,
    students,
  };
}

/* ============================================================
   Resources
   ============================================================ */

export function normalizeResourceItem(item: ResourceItem, index: number): LearningResource {
  let normalizedType = (item.type || 'web').toLowerCase();
  if (normalizedType === 'article') normalizedType = 'web';
  if (normalizedType === 'video' && (item.source === 'YouTube' || item.url?.includes('youtube.com') || item.url?.includes('youtu.be'))) {
    normalizedType = 'youtube';
  }

  return {
    id: item.id || `resource-${index}`,
    title: item.title || 'Learning Resource',
    type: normalizedType,
    source: item.source || (normalizedType === 'youtube' ? 'YouTube' : 'Web'),
    url: item.url || undefined,
    description: item.description || undefined,
    topic: item.topic || undefined,
    difficulty: item.difficulty || undefined,
    reason: item.reason || undefined,
    thumbnail: item.thumbnail || undefined,
    channelTitle: item.channelTitle || undefined,
    videoId: item.videoId || undefined,
    duration: item.duration || undefined,
    publishedAt: item.publishedAt || undefined,
    relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : undefined,
  };
}

export function normalizeCategorizedResources(
  raw: ResourcesResponse | null | undefined
): CategorizedResources {
  const result: CategorizedResources = {
    web: [],
    youtube: [],
    books: [],
  };

  if (!raw || !raw.resources) return result;

  // Case 1: Already categorized object { web?: [...], youtube?: [...], books?: [...] }
  if (typeof raw.resources === 'object' && !Array.isArray(raw.resources)) {
    const cat = raw.resources;
    if (Array.isArray(cat.web)) {
      result.web = cat.web.map((item, i) => normalizeResourceItem(item, i));
    }
    if (Array.isArray(cat.youtube)) {
      result.youtube = cat.youtube.map((item, i) => normalizeResourceItem(item, i));
    }
    if (Array.isArray(cat.books)) {
      result.books = cat.books.map((item, i) => normalizeResourceItem(item, i));
    }
    return result;
  }

  // Case 2: Flat array of ResourceItem[]
  if (Array.isArray(raw.resources)) {
    raw.resources.forEach((item, i) => {
      const normalized = normalizeResourceItem(item, i);
      if (normalized.type === 'youtube' || normalized.source?.toLowerCase().includes('youtube')) {
        result.youtube.push(normalized);
      } else if (normalized.type === 'book' || normalized.source?.toLowerCase().includes('book')) {
        result.books.push(normalized);
      } else {
        result.web.push(normalized);
      }
    });
  }

  return result;
}

export function normalizeResources(
  raw: ResourcesResponse | null | undefined
): LearningResource[] {
  if (!raw || !raw.resources) return [];

  if (Array.isArray(raw.resources)) {
    return raw.resources.map((item, i) => normalizeResourceItem(item, i));
  }

  // If categorized, flatten all resources
  const categorized = normalizeCategorizedResources(raw);
  return [...categorized.web, ...categorized.youtube, ...categorized.books];
}
