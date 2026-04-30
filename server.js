const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Neon Postgres (HTTP-based, no TCP socket needed)
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// --- API Routes ---

// Save or update a user's vibe
app.post('/api/vibe', async (req, res) => {
  const {
    spotify_id,
    display_name,
    avatar_url,
    playlist_id,
    vibe_label,
    vibe_gradient,
    average_features,
    top_tracks,
    top_genres,
    is_public,
  } = req.body;

  if (!spotify_id || !display_name) {
    return res.status(400).json({ error: 'spotify_id and display_name required' });
  }

  const explicitPublic = typeof is_public === 'boolean';

  try {
    if (explicitPublic) {
      await sql`INSERT INTO users (spotify_id, display_name, avatar_url, playlist_id, vibe_label, vibe_gradient, average_features, top_tracks, top_genres, is_public, updated_at)
         VALUES (${spotify_id}, ${display_name}, ${avatar_url}, ${playlist_id}, ${vibe_label}, ${vibe_gradient}, ${JSON.stringify(average_features)}, ${JSON.stringify(top_tracks)}, ${JSON.stringify(top_genres)}, ${is_public}, NOW())
         ON CONFLICT (spotify_id) DO UPDATE SET
           display_name = ${display_name},
           avatar_url = ${avatar_url},
           playlist_id = ${playlist_id},
           vibe_label = ${vibe_label},
           vibe_gradient = ${vibe_gradient},
           average_features = ${JSON.stringify(average_features)},
           top_tracks = ${JSON.stringify(top_tracks)},
           top_genres = ${JSON.stringify(top_genres)},
           is_public = ${is_public},
           updated_at = NOW()`;
    } else {
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
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving vibe:', err);
    res.status(500).json({ error: 'Failed to save vibe' });
  }
});

// List recent users for the /explore directory.
// Mirrors api/users.js (Vercel serverless) so dev and prod stay in sync.
app.get('/api/users', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(req.query.offset ?? '0', 10) || 0, 0);

  try {
    const rows = await sql`
      SELECT spotify_id, display_name, avatar_url,
             vibe_label, vibe_gradient,
             average_features, top_genres,
             updated_at
      FROM users
      WHERE vibe_label IS NOT NULL
        AND is_public = true
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [stats] = await sql`
      SELECT COUNT(*)::int AS total
      FROM users
      WHERE vibe_label IS NOT NULL AND is_public = true
    `;
    const topLabels = await sql`
      SELECT vibe_label AS label, COUNT(*)::int AS count
      FROM users
      WHERE vibe_label IS NOT NULL AND is_public = true
      GROUP BY vibe_label
      ORDER BY count DESC, vibe_label ASC
      LIMIT 5
    `;
    res.json({
      users: rows,
      limit,
      offset,
      total: stats?.total ?? rows.length,
      topLabels,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a user's vibe by spotify ID
app.get('/api/vibe/:spotifyId', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM users WHERE spotify_id = ${req.params.spotifyId}`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching vibe:', err);
    res.status(500).json({ error: 'Failed to fetch vibe' });
  }
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Vibecheck API running on http://localhost:${PORT}`);
});
