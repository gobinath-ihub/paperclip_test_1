/* ============================================================
   Teacher Domain Types
   ============================================================ */

export interface TeacherInsights {
  classAttempts: number;
  correctionRate: number;
  teacherEscalations: number;
  activeStudents: number;
  classMastery: number;
  commonMisconceptions: TeacherMisconception[];
  students: TeacherStudentEntry[];
}

export interface TeacherMisconception {
  type: string;
  label: string;
  count: number;
}

export interface TeacherStudentEntry {
  studentId: string;
  name: string;
  mastery: number;
  attempts: number;
  correctionRate: number;
  topMisconception: string;
  topMisconceptionLabel: string;
  lastActivity: string;
  status: 'active' | 'struggling' | 'excelling' | 'inactive';
  grade: string;
  topic: string;
}

export interface InterventionRecommendation {
  studentId: string;
  studentName: string;
  concept: string;
  observedIssue: string;
  recommendedIntervention: string;
  practiceCount: number;
}

export interface StudentDetailData {
  profile: {
    studentId: string;
    name: string;
    grade: string;
    mastery: number;
    totalAttempts: number;
    correctionRate: number;
    escalations: number;
  };
  attempts: Array<{
    id: string;
    question: string;
    studentAnswer: string;
    verdict: string;
    misconceptionType?: string;
    feedbackLevel?: number;
    feedback?: string;
    timestamp: string;
    topic: string;
  }>;
  misconceptions: Array<{
    type: string;
    label: string;
    count: number;
  }>;
  resources: Array<{
    title: string;
    type: string;
    topic: string;
  }>;
  interventions: InterventionRecommendation[];
}
