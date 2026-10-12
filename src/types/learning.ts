/* ============================================================
   Learning Domain Types
   ============================================================ */

export interface LearningResource {
  id: string;
  title: string;
  type: 'web' | 'youtube' | 'book' | 'article' | 'video' | 'practice' | string;
  source: string;
  url?: string;
  description?: string;
  topic?: string;
  difficulty?: string;
  reason?: string;
  thumbnail?: string;
  channelTitle?: string;
  videoId?: string;
  duration?: string;
  publishedAt?: string;
  relevanceScore?: number;
}

export interface CategorizedResources {
  web: LearningResource[];
  youtube: LearningResource[];
  books: LearningResource[];
}

export interface ResourceDiscoveryResponse {
  ok: boolean;
  studentId: string;
  topic: string;
  query: string;
  resources: CategorizedResources;
  allResources?: LearningResource[];
  generatedAt?: string;
}

export interface AttemptRecord {
  id: string;
  question: string;
  studentAnswer: string;
  steps: string;
  verdict: 'correct' | 'incorrect' | 'partial';
  misconceptionType?: string;
  misconceptionLabel?: string;
  feedbackLevel?: number;
  feedback?: string;
  explanation?: string;
  workedExample?: string;
  retryQuestion?: string;
  timestamp: string;
  topic?: string;
}

export interface MasteryData {
  percentage: number;
  totalAttempts: number;
  correctAttempts: number;
  escalations: number;
  correctionRate: number;
}

export interface LearningEvidence {
  mastery: MasteryData;
  recentAttempts: AttemptRecord[];
}

/** Map of backend misconception keys to human-readable labels */
export const MISCONCEPTION_LABELS: Record<string, string> = {
  invalid_inverse_operation: 'Incorrect inverse operation',
  failure_to_simplify_arithmetic: 'Arithmetic simplification error',
  transposition_and_arithmetic_error: 'Transposition and arithmetic error',
  incorrect_algebraic_manipulation: 'Incorrect algebraic manipulation',
  no_meaningful_mathematical_attempt: 'No meaningful mathematical attempt',
  sign_error: 'Sign error',
  arithmetic_subtraction_error: 'Arithmetic subtraction error',
  division_error: 'Division error',
  order_of_operations_error: 'Order of operations error',
  variable_isolation_error: 'Variable isolation error',
};

/**
 * Convert a snake_case misconception type to a human-readable label.
 * Uses known labels first, then auto-converts unknown values.
 */
export function formatMisconception(type: string | undefined): string {
  if (!type) return 'Unknown';
  if (MISCONCEPTION_LABELS[type]) return MISCONCEPTION_LABELS[type];
  // Auto-convert snake_case to Title Case
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export type Verdict = 'correct' | 'incorrect' | 'partial';

export type CoachStatus =
  | 'idle'
  | 'analyzing'
  | 'feedback_ready'
  | 'retry_ready'
  | 'correct'
  | 'needs_review';

export function getCoachStatusLabel(status: CoachStatus): string {
  switch (status) {
    case 'idle': return 'READY';
    case 'analyzing': return 'ANALYZING';
    case 'feedback_ready': return 'FEEDBACK READY';
    case 'retry_ready': return 'RETRY READY';
    case 'correct': return 'CORRECT';
    case 'needs_review': return 'NEEDS REVIEW';
    default: return 'READY';
  }
}

export function getVerdictColor(verdict: Verdict | string): string {
  switch (verdict) {
    case 'correct': return 'var(--success)';
    case 'incorrect': return 'var(--destructive)';
    case 'partial': return 'var(--warning)';
    default: return 'var(--muted-foreground)';
  }
}
