import type { StatusResponse, ResetListResponse } from '../types';
import { fallbackStatus, fallbackResets } from '../data/fallbackData';
import { withToken } from '../utils/token';

const API_BASE = import.meta.env.PROD ? 'https://codex-resets.com' : '';

export async function fetchStatus(): Promise<StatusResponse> {
  try {
    const url = withToken(`${API_BASE}/api/v1/status`);
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data: StatusResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to fetch live status, using fallback data:', err);
    return fallbackStatus;
  }
}

export async function fetchResets(limit = 100): Promise<ResetListResponse> {
  try {
    const url = withToken(`${API_BASE}/api/v1/resets?limit=${limit}`);
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data: ResetListResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to fetch live resets, using fallback data:', err);
    return fallbackResets;
  }
}
