/* ============================================================
   Centralized API Client
   ============================================================
   All backend communication flows through this module.
   Components MUST NEVER construct n8n URLs directly.
   ============================================================ */

import type {
  FeedbackRequest,
  FeedbackResponse,
  StudentHistoryResponse,
  TeacherInsightsResponse,
  ResourcesResponse,
  ResourceDiscoveryRequest,
} from '../types/api';

const BASE_URL = import.meta.env.VITE_N8N_BASE_URL || '';

const ENDPOINTS = {
  app: '/webhook/et03/master/app',
  feedback: '/webhook/et03/master/feedback',
  studentHistory: '/webhook/et03/master/student-history',
  teacherInsights: '/webhook/et03/master/teacher-insights',
  resources: '/webhook/et03/master/resources',
} as const;

/** User-friendly error messages by HTTP status */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Authentication required. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource could not be found.',
  408: 'The request timed out. Please try again.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'Something went wrong on our end. Please try again later.',
};

function getErrorMessage(status: number): string {
  return ERROR_MESSAGES[status] || "We couldn't process your request right now. Please try again.";
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        data: null,
        error: getErrorMessage(response.status),
        status: response.status,
      };
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return { data: null, error: null, status: response.status };
    }

    try {
      const data = JSON.parse(text) as T;
      return { data, error: null, status: response.status };
    } catch {
      return {
        data: null,
        error: 'Received an invalid response. Please try again.',
        status: response.status,
      };
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        data: null,
        error: 'The request timed out. Please try again.',
        status: 408,
      };
    }

    return {
      data: null,
      error: "We couldn't connect to the learning engine. Please check your connection and try again.",
      status: 0,
    };
  }
}

/* ============================================================
   PUBLIC API FUNCTIONS
   ============================================================ */

/** Submit a student attempt for AI feedback */
export async function submitFeedback(
  payload: FeedbackRequest
): Promise<ApiResponse<FeedbackResponse>> {
  return request<FeedbackResponse>(ENDPOINTS.feedback, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Fetch student attempt history */
export async function getStudentHistory(
  studentId: string
): Promise<ApiResponse<StudentHistoryResponse>> {
  const params = new URLSearchParams({ studentId });
  return request<StudentHistoryResponse>(
    `${ENDPOINTS.studentHistory}?${params.toString()}`
  );
}

/** Fetch teacher class insights */
export async function getTeacherInsights(): Promise<ApiResponse<TeacherInsightsResponse>> {
  return request<TeacherInsightsResponse>(ENDPOINTS.teacherInsights);
}

/** Discover targeted learning resources across Web, YouTube, and Books */
export async function discoverResources(
  requestData: ResourceDiscoveryRequest
): Promise<ApiResponse<ResourcesResponse>> {
  return request<ResourcesResponse>(ENDPOINTS.resources, {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

/** Fetch learning resources */
export async function getResources(
  filters?: { subject?: string; grade?: string; topic?: string; type?: string }
): Promise<ApiResponse<ResourcesResponse>> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  const queryString = params.toString();
  const endpoint = queryString
    ? `${ENDPOINTS.resources}?${queryString}`
    : ENDPOINTS.resources;
  return request<ResourcesResponse>(endpoint);
}

/** Check if the learning engine (backend) is reachable */
export async function checkEngineStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINTS.app}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/* ============================================================
   OPENCLAW NGROK BRIDGE ADAPTER (System B)
   ============================================================ */

const OPENCLAW_STORAGE_KEY = 'gtda_openclaw_url';

/** Get active OpenClaw base URL (localStorage override or env var) */
export function getOpenClawBaseUrl(): string {
  const custom = typeof window !== 'undefined' ? localStorage.getItem(OPENCLAW_STORAGE_KEY) : null;
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  return (import.meta.env.VITE_OPENCLAW_API_URL || '').replace(/\/+$/, '');
}

/** Set dynamic OpenClaw URL (useful for live Ngrok sessions) */
export function setOpenClawBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem(OPENCLAW_STORAGE_KEY);
    } else {
      localStorage.setItem(OPENCLAW_STORAGE_KEY, url.trim().replace(/\/+$/, ''));
    }
  }
}

/** Check if the OpenClaw Ngrok tunnel is online and responding */
export async function checkOpenClawHealth(customUrl?: string): Promise<{ ok: boolean; message?: string }> {
  const baseUrl = (customUrl || getOpenClawBaseUrl()).replace(/\/+$/, '');
  if (!baseUrl) {
    return { ok: false, message: 'No OpenClaw Ngrok URL configured.' };
  }

  // 1. Try native System B bridge /health endpoint
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'healthy' || data.openclaw_available) {
        return {
          ok: true,
          message: `Connected: OpenClaw Agent ${data.version ? `v${data.version}` : '2026.9.1'} (System B Active)`,
        };
      }
    }
  } catch {
    // Continue to fallback check below
  }

  // 2. Try fallback bridge endpoint /api/openclaw/health
  try {
    const response = await fetch(`${baseUrl}/api/openclaw/health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return { ok: true, message: `Connected to ${data.engine || 'OpenClaw'} (System B)` };
    }
    return { ok: false, message: `Server returned status ${response.status}` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Could not reach OpenClaw via Ngrok',
    };
  }
}

/** Discover resources using OpenClaw on System B via Ngrok */
export async function discoverOpenClawResources(
  requestData: ResourceDiscoveryRequest
): Promise<ApiResponse<ResourcesResponse>> {
  const baseUrl = getOpenClawBaseUrl();
  if (!baseUrl) {
    return {
      data: null,
      error: 'OpenClaw Ngrok URL is not set.',
      status: 0,
    };
  }

  const topic = requestData.topic || 'Linear Equations';
  const misconception = requestData.misconceptionType || 'Incorrect inverse operation';

  // Strategy A: Call System B live execution endpoint (/execute)
  try {
    const execResponse = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        command: 'python3',
        args: [
          '/Users/snsimac32/.openclaw/workspace/scripts/openclaw_extractor.py',
          '--topic',
          topic,
          '--misconception',
          misconception,
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (execResponse.ok) {
      const execResult = await execResponse.json();
      if (execResult.success && execResult.stdout) {
        const payload = JSON.parse(execResult.stdout);
        return {
          data: {
            ok: true,
            topic: payload.topic || topic,
            query: payload.query,
            resources: payload.resources,
            total: payload.totalCount,
            generatedAt: new Date().toISOString(),
          },
          error: null,
          status: 200,
        };
      }
    }
  } catch {
    // Continue to Strategy B
  }

  // Strategy B: Call direct bridge /api/openclaw/extract endpoint
  try {
    const response = await fetch(`${baseUrl}/api/openclaw/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        ...requestData,
        searchQuery: `${topic} ${misconception} remediation`,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return {
        data: null,
        error: `OpenClaw extraction failed (Status ${response.status})`,
        status: response.status,
      };
    }

    const payload = await response.json();
    return {
      data: {
        ok: true,
        topic: payload.topic || topic,
        query: payload.query,
        resources: payload.resources,
        total: payload.totalCount,
        generatedAt: new Date().toISOString(),
      },
      error: null,
      status: 200,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error communicating with OpenClaw via Ngrok',
      status: 0,
    };
  }
}
