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
