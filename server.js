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
  } = req.body;

  if (!spotify_id || !display_name) {
    return res.status(400).json({ error: 'spotify_id and display_name required' });
  }

  try {
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
