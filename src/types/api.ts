/* ============================================================
   API Request & Response Types
   ============================================================ */

export interface FeedbackRequest {
  studentId: string;
  subject: string;
  grade: string;
  topic: string;
  question: string;
  expectedAnswer: string;
  studentAnswer: string;
  steps: string;
  attemptNumber: number;
}

export interface FeedbackResponse {
  verdict: 'correct' | 'incorrect' | 'partial' | string;
  misconceptionType?: string;
  confidence?: number;
  feedbackLevel?: number;
  feedback?: string;
  explanation?: string;
  workedExample?: string;
  retryQuestion?: string;
  resources?: ResourceItem[];
}

export interface ResourceItem {
  id?: string;
  title: string;
  type: 'web' | 'youtube' | 'book' | 'article' | 'video' | 'practice' | string;
  source?: string;
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

export interface StudentHistoryResponse {
  studentId: string;
  attempts?: AttemptEntry[];
  mastery?: number;
  totalAttempts?: number;
  correctionRate?: number;
  escalations?: number;
  misconceptionPatterns?: MisconceptionPattern[];
}

export interface AttemptEntry {
  id?: string;
  question: string;
  studentAnswer: string;
  steps?: string;
  verdict: string;
  misconceptionType?: string;
  feedbackLevel?: number;
  feedback?: string;
  retryQuestion?: string;
  timestamp?: string;
  topic?: string;
}

export interface MisconceptionPattern {
  type: string;
  count: number;
  label?: string;
}

export interface TeacherInsightsResponse {
  classAttempts?: number;
  correctionRate?: number;
  teacherEscalations?: number;
  activeStudents?: number;
  classMastery?: number;
  commonMisconceptions?: MisconceptionPattern[];
  students?: StudentProgressEntry[];
}

export interface StudentProgressEntry {
  studentId: string;
  name?: string;
  mastery?: number;
  attempts?: number;
  correctionRate?: number;
  topMisconception?: string;
  lastActivity?: string;
  status?: 'active' | 'struggling' | 'excelling' | 'inactive' | string;
  grade?: string;
  topic?: string;
}

export interface ResourceDiscoveryRequest {
  studentId: string;
  subject?: string;
  grade?: string;
  topic: string;
  question?: string;
  studentAnswer?: string;
  expectedAnswer?: string;
  misconceptionType?: string;
}

export interface CategorizedResourceItems {
  web?: ResourceItem[];
  youtube?: ResourceItem[];
  books?: ResourceItem[];
}

export interface ResourcesResponse {
  ok?: boolean;
  studentId?: string;
  topic?: string;
  query?: string;
  resources: ResourceItem[] | CategorizedResourceItems;
  allResources?: ResourceItem[];
  total?: number;
  generatedAt?: string;
}

export interface ApiError {
  status: number;
  message: string;
  userMessage: string;
}
