/* ============================================================
   Theme Hook — Light / Dark / System
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import type { ThemeMode } from '../types/student';

const THEME_KEY = 'et03-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return stored || 'system';
  });

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [theme]);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? getSystemTheme() : theme;

  return { theme, setTheme, resolvedTheme };
}
