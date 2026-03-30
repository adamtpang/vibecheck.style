import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    spotify_id, display_name, avatar_url, playlist_id,
    vibe_label, vibe_gradient, average_features, top_tracks, top_genres,
  } = req.body;

  if (!spotify_id || !display_name) {
    return res.status(400).json({ error: 'spotify_id and display_name required' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`INSERT INTO users (spotify_id, display_name, avatar_url, playlist_id, vibe_label, vibe_gradient, average_features, top_tracks, top_genres, updated_at)
       VALUES (${spotify_id}, ${display_name}, ${avatar_url}, ${playlist_id}, ${vibe_label}, ${vibe_gradient}, ${JSON.stringify(average_features)}, ${JSON.stringify(top_tracks)}, ${JSON.stringify(top_genres)}, NOW())
       ON CONFLICT (spotify_id) DO UPDATE SET
         display_name = ${display_name},
         avatar_url = ${avatar_url},
         playlist_id = ${playlist_id},
         vibe_label = ${vibe_label},
         vibe_gradient = ${vibe_gradient},
         average_features = ${JSON.stringify(average_features)},
         top_tracks = ${JSON.stringify(top_tracks)},
         top_genres = ${JSON.stringify(top_genres)},
         updated_at = NOW()`;
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving vibe:', err);
    res.status(500).json({ error: 'Failed to save vibe' });
  }
}
