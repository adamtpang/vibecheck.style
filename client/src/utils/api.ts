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

export async function getVibe(spotifyId: string): Promise<VibeData | null> {
  const res = await fetch(`${API_BASE}/api/vibe/${encodeURIComponent(spotifyId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch vibe');
  return res.json();
}

export async function getUsers(opts: { limit?: number; offset?: number } = {}): Promise<VibeSummary[]> {
  const params = new URLSearchParams();
  if (opts.limit != null) params.set('limit', String(opts.limit));
  if (opts.offset != null) params.set('offset', String(opts.offset));
  const url = `${API_BASE}/api/users${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users || [];
}
