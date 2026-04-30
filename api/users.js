import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse query params with sane bounds
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(req.query.offset ?? '0', 10) || 0, 0);

  try {
    const sql = neon(process.env.DATABASE_URL);
    // Only return fields needed for the explore grid + compatibility math.
    // Skip top_tracks (heavier, lazy-load on profile page).
    const rows = await sql`
      SELECT spotify_id, display_name, avatar_url,
             vibe_label, vibe_gradient,
             average_features, top_genres,
             updated_at
      FROM users
      WHERE vibe_label IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    res.json({ users: rows, limit, offset });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}
