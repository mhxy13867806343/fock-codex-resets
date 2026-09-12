export type ResetType = 'regular' | 'banked';

export interface ResetSource {
  type: 'x_post' | 'observed';
  author?: string;
  url?: string;
}

export interface Reset {
  id: string;
  reset_type: ResetType;
  announced_at: string;
  text: string;
  source: ResetSource;
}

export interface ScheduledReset {
  id: string;
  status: 'scheduled';
  reset_type: ResetType;
  announced_at: string;
  scheduled_for: string | null;
  text: string;
  source: ResetSource;
}

export interface Watch {
  level: 'elevated' | 'strong';
  reset_chance_percent: number | null;
  forecast_window: string;
  observed_at: string;
  expires_at: string;
  text: string;
  source: ResetSource;
}

export interface Stats {
  total: number;
  last_reset_at: string | null;
  days_since_last: number | null;
  avg_interval_days: number | null;
}

export interface Meta {
  api_version: string;
  generated_at: string;
}

export interface StatusData {
  latest_reset: Reset | null;
  scheduled_reset: ScheduledReset | null;
  active_watch: Watch | null;
  stats: Stats;
}

export interface StatusResponse {
  data: StatusData;
  meta: Meta;
}

export interface ResetListResponse {
  data: Reset[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
  };
  meta: Meta;
}
