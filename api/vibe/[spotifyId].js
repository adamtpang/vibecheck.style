import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { spotifyId } = req.query;
  if (!spotifyId) {
    return res.status(400).json({ error: 'spotifyId required' });
  }

  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM users WHERE spotify_id = ${spotifyId}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(rows[0]);
    } catch (err) {
      console.error('Error fetching vibe:', err);
      return res.status(500).json({ error: 'Failed to fetch vibe' });
    }
  }

  if (req.method === 'DELETE') {
    // Light proof-of-ownership: caller must hand back a valid Spotify access
    // token whose user.id matches the path. Tokens stay client-side under
    // PKCE so this is the simplest gate that actually verifies identity
    // without us holding any auth state of our own.
    const auth = req.headers.authorization || req.headers.Authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Missing Spotify access token' });
    }
    try {
      const meRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) {
        return res.status(401).json({ error: 'Spotify token rejected' });
      }
      const me = await meRes.json();
      if (me.id !== spotifyId) {
        return res.status(403).json({ error: 'Token does not match target user' });
      }
      await sql`DELETE FROM users WHERE spotify_id = ${spotifyId}`;
      return res.json({ success: true });
    } catch (err) {
      console.error('Error deleting vibe:', err);
      return res.status(500).json({ error: 'Failed to delete vibe' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
