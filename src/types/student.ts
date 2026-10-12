/* ============================================================
   Student Domain Types
   ============================================================ */

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  grade: string;
  cohort?: string;
  enrolledDate?: string;
  xp: number;
  xpTarget: number;
  level: number;
  levelTitle: string;
  coins: number;
  streakDays: number;
  preferences?: StudentPreferences;
}

export interface StudentPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEffects: boolean;
  learningStyle?: 'visual' | 'textual' | 'interactive';
}

export interface ChallengeState {
  question: string;
  expectedAnswer: string;
  studentAnswer: string;
  working: string;
  subject: string;
  grade: string;
  topic: string;
  attemptNumber: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
