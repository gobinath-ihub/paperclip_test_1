/* ============================================================
   Resources Hook
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import { getResources } from '../lib/api';
import { normalizeResources } from '../lib/api-adapters';
import type { LearningResource } from '../types/learning';
import { demoResources } from '../data/demo/resources';

interface ResourceFilters {
  subject?: string;
  grade?: string;
  topic?: string;
  type?: string;
}

interface ResourcesState {
  isLoading: boolean;
  error: string | null;
  resources: LearningResource[];
}

export function useResources(filters?: ResourceFilters) {
  const [state, setState] = useState<ResourcesState>({
    isLoading: true,
    error: null,
    resources: [],
  });

  const fetchResources = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await getResources(filters);

    if (response.error || !response.data) {
      // Fallback to demo data
      const normalized = normalizeResources(demoResources);
      setState({ isLoading: false, error: null, resources: normalized });
      return;
    }

    const normalized = normalizeResources(response.data);
    setState({ isLoading: false, error: null, resources: normalized });
  }, [filters?.subject, filters?.grade, filters?.topic, filters?.type]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return { ...state, refetch: fetchResources };
}
