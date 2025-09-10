const express = require('express');
const session = require('express-session');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for user data (replace with database in production)
const users = {};

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // React dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'vibecheck-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Spotify API configuration
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Utility function to generate a random string for state parameter
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// API Routes

// Root route - helpful message
app.get('/', (req, res) => {
  res.json({
    message: 'Vibecheck.me API Server',
    status: 'running',
    frontend: 'http://localhost:5173',
    endpoints: {
      user: '/api/user',
      login: '/api/login',
      callback: '/api/callback',
      logout: '/api/logout'
    }
  });
});

// Get current user
app.get('/api/user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.session.user);
});

// Get user by ID
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    const user = users[userId];

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
});

// Login route - redirect to Spotify authorization
app.get('/api/login', (req, res) => {
    const state = generateRandomString(16);
    req.session.state = state;

    const scopes = [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'playlist-modify-public',
        'playlist-modify-private'
    ];

    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.json({ url: authorizeURL });
});

// Callback route - handle Spotify authorization response
app.get('/api/callback', async (req, res) => {
    const { code, state } = req.query;

    if (state !== req.session.state) {
        return res.status(400).json({ error: 'State mismatch error' });
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;

        // Set tokens
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        // Get user profile
        const userProfile = await spotifyApi.getMe();
        const user = {
            id: userProfile.body.id,
            display_name: userProfile.body.display_name,
            email: userProfile.body.email,
            access_token,
            refresh_token
        };

        // Store user in session and in-memory storage
        req.session.user = user;
        users[user.id] = user;

        // Create or update the ultimate playlist
        await createUltimatePlaylist(user);

        // Redirect to React app
        res.redirect(`http://localhost:5173/user/${user.id}`);
    } catch (error) {
        console.error('Error during callback:', error);
        res.redirect('http://localhost:5173?error=auth_failed');
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Function to create ultimate playlist
async function createUltimatePlaylist(user) {
    try {
        // Create a new Spotify API instance for this user
        const userSpotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT_URI
        });

        userSpotifyApi.setAccessToken(user.access_token);
        userSpotifyApi.setRefreshToken(user.refresh_token);

        // Fetch top tracks from all time ranges
        const timeRanges = ['short_term', 'medium_term', 'long_term'];
        const allTracks = new Set(); // Use Set to avoid duplicates

        for (const timeRange of timeRanges) {
            try {
                const topTracks = await userSpotifyApi.getMyTopTracks({
                    time_range: timeRange,
                    limit: 50
                });

                topTracks.body.items.forEach(track => {
                    allTracks.add(track.uri);
                });
            } catch (error) {
                console.error(`Error fetching ${timeRange} tracks:`, error);
            }
        }

        const trackUris = Array.from(allTracks);

        if (trackUris.length === 0) {
            console.log('No tracks found for user');
            return;
        }

        // Check if user already has an ultimate playlist
        const playlistName = 'Vibecheck.me - Ultimate Playlist';
        let playlistId = user.playlistId;

        if (!playlistId) {
            // Create new playlist
            const newPlaylist = await userSpotifyApi.createPlaylist(user.id, playlistName, {
                description: 'Your ultimate playlist created from your top tracks across all time periods',
                public: false
            });
            playlistId = newPlaylist.body.id;
            user.playlistId = playlistId;
            users[user.id] = user; // Update stored user
        }

        // Clear existing tracks and add new ones
        const existingTracks = await userSpotifyApi.getPlaylistTracks(playlistId);
        if (existingTracks.body.items.length > 0) {
            const trackUrisToRemove = existingTracks.body.items.map(item => ({ uri: item.track.uri }));
            await userSpotifyApi.removeTracksFromPlaylist(playlistId, trackUrisToRemove);
        }

        // Add tracks to playlist (Spotify API limit is 100 tracks per request)
        const chunkSize = 100;
        for (let i = 0; i < trackUris.length; i += chunkSize) {
            const chunk = trackUris.slice(i, i + chunkSize);
            await userSpotifyApi.addTracksToPlaylist(playlistId, chunk);
        }

        console.log(`Updated playlist for ${user.display_name} with ${trackUris.length} tracks`);

    } catch (error) {
        console.error('Error creating ultimate playlist:', error);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Vibecheck.me API server running on http://localhost:${PORT}`);
    console.log('Make sure to set up your .env file with Spotify credentials!');
    console.log('React app should be running on http://localhost:5173');
});