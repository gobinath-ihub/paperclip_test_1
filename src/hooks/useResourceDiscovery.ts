/* ============================================================
   Resource Discovery Hook
   ============================================================
   Manages independent, asynchronous resource discovery across
   Web Search, YouTube, and Books with loading/error resilience.
   ============================================================ */

import { useState, useCallback } from 'react';
import { discoverResources, discoverOpenClawResources, getOpenClawBaseUrl } from '../lib/api';
import { normalizeCategorizedResources } from '../lib/api-adapters';
import type { CategorizedResources } from '../types/learning';
import type { ResourceDiscoveryRequest } from '../types/api';

export interface ResourceDiscoveryState {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  topic: string;
  query: string;
  resources: CategorizedResources;
  totalCount: number;
  errorMessage: string | null;
  lastRequestedAt: string | null;
  isLiveOpenClaw?: boolean;
}

const INITIAL_STATE: ResourceDiscoveryState = {
  status: 'idle',
  topic: '',
  query: '',
  resources: {
    web: [],
    youtube: [],
    books: [],
  },
  totalCount: 0,
  errorMessage: null,
  lastRequestedAt: null,
  isLiveOpenClaw: false,
};

export function useResourceDiscovery() {
  const [state, setState] = useState<ResourceDiscoveryState>(INITIAL_STATE);

  const discover = useCallback(async (req: ResourceDiscoveryRequest) => {
    setState((prev) => ({
      ...prev,
      status: 'loading',
      topic: req.topic,
      errorMessage: null,
      lastRequestedAt: new Date().toISOString(),
    }));

    try {
      const openclawUrl = getOpenClawBaseUrl();
      let response = null;
      let usedLiveOpenClaw = false;

      // Try OpenClaw over Ngrok if configured
      if (openclawUrl) {
        response = await discoverOpenClawResources(req);
        if (response.data && !response.error) {
          usedLiveOpenClaw = true;
        }
      }

      // Fallback to internal/n8n learning engine if OpenClaw didn't respond
      if (!response || response.error || !response.data) {
        response = await discoverResources(req);
      }

      if (response.error || !response.data) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: response.error || 'Resource discovery is temporarily unavailable.',
        }));
        return;
      }

      const raw = response.data;
      const categorized = normalizeCategorizedResources(raw);
      const total =
        (categorized.web?.length || 0) +
        (categorized.youtube?.length || 0) +
        (categorized.books?.length || 0);

      setState({
        status: total > 0 ? 'success' : 'empty',
        topic: raw.topic || req.topic,
        query: raw.query || '',
        resources: categorized,
        totalCount: total,
        errorMessage: null,
        lastRequestedAt: new Date().toISOString(),
        isLiveOpenClaw: usedLiveOpenClaw,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Resource discovery is temporarily unavailable.',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    discover,
    reset,
  };
}
