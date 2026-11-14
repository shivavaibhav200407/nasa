/**
 * ASTRA REST API Client.
 * Automatically attaches X-Browser-Id header to isolate student sessions.
 */

import { getOrCreateBrowserId } from './browserId';
import type {
  AdvanceDayPayload,
  AdvanceDayResponse,
  DifficultyMode,
  MissionDetail,
  MissionReport,
  MissionSummary,
} from '../types/mission';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const browserId = getOrCreateBrowserId();
  const headers = new Headers(options.headers || {});
  headers.set('X-Browser-Id', browserId);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to HTTP status text
        errorMsg = res.statusText || errorMsg;
      }
      throw new ApiError(errorMsg, res.status);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Unable to connect to Mission Control backend.', 0);
  }
}

export const api = {
  async listMissions(status?: string): Promise<MissionSummary[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<MissionSummary[]>(`/api/missions${query}`);
  },

  async createMission(
    difficulty_mode: DifficultyMode,
    label?: string,
    seed?: string
  ): Promise<MissionDetail> {
    return request<MissionDetail>('/api/missions', {
      method: 'POST',
      body: JSON.stringify({ difficulty_mode, label, seed }),
    });
  },

  async getMission(id: string): Promise<MissionDetail> {
    return request<MissionDetail>(`/api/missions/${id}`);
  },

  async advanceDay(id: string, payload: AdvanceDayPayload): Promise<AdvanceDayResponse> {
    return request<AdvanceDayResponse>(`/api/missions/${id}/advance-day`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resolveEvent(
    missionId: string,
    eventId: string,
    chosen_option_id: string
  ): Promise<any> {
    return request(`/api/missions/${missionId}/events/${eventId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ chosen_option_id }),
    });
  },

  async getMissionReport(id: string): Promise<MissionReport> {
    return request<MissionReport>(`/api/missions/${id}/report`);
  },

  async getHealth(): Promise<{ status: string }> {
    return request<{ status: string }>('/api/health');
  },
};
