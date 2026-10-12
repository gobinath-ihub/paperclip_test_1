import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchStudentProfile,
  subscribeToStudentRealtime,
  type SupabaseProfile
} from '../lib/supabase';

interface StudentContextType {
  studentId: string;
  setStudentId: (id: string) => void;
  profile: SupabaseProfile | null;
  isLoadingProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STORAGE_KEY = 'loop_active_student_id';

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentId, setStudentIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'demo-001';
  });
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const setStudentId = useCallback((newId: string) => {
    const trimmed = newId.trim();
    if (!trimmed) return;
    setStudentIdState(trimmed);
    localStorage.setItem(STORAGE_KEY, trimmed);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!studentId) return;
    setIsLoadingProfile(true);
    const p = await fetchStudentProfile(studentId);
    setProfile(p);
    setIsLoadingProfile(false);
  }, [studentId]);

  useEffect(() => {
    refreshProfile();
  }, [studentId, refreshProfile]);

  // Realtime subscription for current student
  useEffect(() => {
    if (!studentId) return;
    const unsubscribe = subscribeToStudentRealtime(studentId, () => {
      refreshProfile();
    });
    return () => {
      unsubscribe();
    };
  }, [studentId, refreshProfile]);

  return (
    <StudentContext.Provider
      value={{
        studentId,
        setStudentId,
        profile,
        isLoadingProfile,
        refreshProfile,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
