const API_BASE = import.meta.env.VITE_API_URL || '';

export interface VibeData {
  spotify_id: string;
  display_name: string;
  avatar_url: string | null;
  playlist_id: string | null;
  vibe_label: string | null;
  vibe_gradient: string | null;
  average_features: Record<string, number> | null;
  top_tracks: any[] | null;
  top_genres: string[] | null;
  is_public?: boolean;
}

/**
 * Lean shape returned by GET /api/users for the explore directory.
 * Excludes top_tracks (heavier) and playlist_id (not needed for grid).
 */
export interface VibeSummary {
  spotify_id: string;
  display_name: string;
  avatar_url: string | null;
  vibe_label: string | null;
  vibe_gradient: string | null;
  average_features: Record<string, number> | null;
  top_genres: string[] | null;
  updated_at: string;
}

export async function saveVibe(data: VibeData): Promise<void> {
  const res = await fetch(`${API_BASE}/api/vibe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save vibe');
}

/**
 * Updates only the is_public flag for the given user. Sends a minimal POST
 * that the upsert endpoint treats as a privacy-only change (server preserves
 * the rest). The server still requires display_name on the wire.
 */
export async function updatePrivacy(
  spotifyId: string,
  displayName: string,
  isPublic: boolean
): Promise<void> {
  // We have to send all NOT-NULL fields the upsert expects. Re-fetch the
  // current row server-side would be cleaner; for v2.7 we just round-trip
  // the existing record.
  const current = await getVibe(spotifyId);
  if (!current) throw new Error('No saved vibe to update');
  const res = await fetch(`${API_BASE}/api/vibe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...current,
      display_name: current.display_name || displayName,
      is_public: isPublic,
    }),
  });
  if (!res.ok) throw new Error('Failed to update privacy');
}

export async function getVibe(spotifyId: string): Promise<VibeData | null> {
  const res = await fetch(`${API_BASE}/api/vibe/${encodeURIComponent(spotifyId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch vibe');
  return res.json();
}

export interface VibeLabelCount {
  label: string;
  count: number;
}

export interface UsersResponse {
  users: VibeSummary[];
  total: number;
  topLabels: VibeLabelCount[];
}

export async function getUsers(opts: { limit?: number; offset?: number } = {}): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (opts.limit != null) params.set('limit', String(opts.limit));
  if (opts.offset != null) params.set('offset', String(opts.offset));
  const url = `${API_BASE}/api/users${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return {
    users: data.users || [],
    total: data.total ?? (data.users?.length ?? 0),
    topLabels: data.topLabels || [],
  };
}
