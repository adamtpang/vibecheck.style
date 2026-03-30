import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../App';
import { spotifyApiGet, spotifyApiPost } from '../utils/spotify-api';
import { createVibeProfile } from '../utils/vibe-analysis';
import { getVibeLabel } from '../utils/vibe-labels';
import { getVibeGradient, getContrastTextColor, getSubtleTextColor } from '../utils/vibe-colors';
import { saveVibe, getVibe } from '../utils/api';
import type { VibeData } from '../utils/api';
import StoryGenerator from '../components/StoryGenerator';

interface VibeCardProps {
  currentUser: User | null;
  setUser: (user: User | null) => void;
}

export default function VibeCard({ currentUser, setUser }: VibeCardProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [vibeData, setVibeData] = useState<VibeData | null>(null);
  const [showStory, setShowStory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    loadVibe();
  }, [userId]);

  async function loadVibe() {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      // Try loading from DB first
      const saved = await getVibe(userId);

      if (saved && saved.vibe_label) {
        setVibeData(saved);
        setLoading(false);

        // If owner, also generate fresh in background
        if (isOwner && localStorage.getItem('access_token')) {
          generateVibe(true);
        }
        return;
      }

      // No saved data — if owner, generate it
      if (isOwner && localStorage.getItem('access_token')) {
        await generateVibe(false);
      } else {
        setError('This person hasn\'t created their vibe yet.');
        setLoading(false);
      }
    } catch {
      setError('Failed to load vibe. Try again.');
      setLoading(false);
    }
  }

  async function generateVibe(background: boolean) {
    if (!currentUser || !userId) return;
    if (!background) setGenerating(true);

    try {
      // Fetch top tracks from all time periods
      const [shortTerm, mediumTerm, longTerm] = await Promise.all([
        spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50'),
        spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50'),
        spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50'),
      ]);

      // Weighted scoring
      const trackScores = new Map<string, number>();
      const trackDetails = new Map<string, any>();
      const weights: Record<string, number> = { short_term: 100, medium_term: 50, long_term: 25 };

      [
        { tracks: shortTerm.items || [], label: 'short_term' },
        { tracks: mediumTerm.items || [], label: 'medium_term' },
        { tracks: longTerm.items || [], label: 'long_term' },
      ].forEach(({ tracks, label }) => {
        tracks.forEach((track: any, index: number) => {
          const uri = track.uri;
          const score = (tracks.length - index) * weights[label];
          trackScores.set(uri, (trackScores.get(uri) || 0) + score);
          if (!trackDetails.has(uri)) trackDetails.set(uri, track);
        });
      });

      const sortedTracks = Array.from(trackScores.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([uri]) => trackDetails.get(uri));

      if (sortedTracks.length === 0) {
        setError('No listening history found. Listen to some music on Spotify first!');
        setGenerating(false);
        setLoading(false);
        return;
      }

      // Create vibe profile (audio features analysis)
      const profile = await createVibeProfile(currentUser.id, currentUser.display_name, sortedTracks);

      // Generate vibe label and gradient
      const vibeLabel = getVibeLabel(profile.averageFeatures);
      const gradient = getVibeGradient(profile.averageFeatures);

      // Create Spotify playlist
      let playlistId = currentUser.playlistId;
      try {
        const playlist = await spotifyApiPost(
          `https://api.spotify.com/v1/users/${currentUser.id}/playlists`,
          {
            name: 'vibecheck.style',
            description: `${currentUser.display_name}'s music vibe — ${vibeLabel.emoji} ${vibeLabel.label}`,
            public: false,
          }
        );
        playlistId = playlist.id;

        // Add top tracks (max 100)
        const uris = sortedTracks.slice(0, 100).map((t: any) => t.uri);
        await spotifyApiPost(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, { uris });
      } catch (err) {
        console.error('Playlist creation failed:', err);
      }

      // Top 5 tracks for display (with album art)
      const top5 = sortedTracks.slice(0, 5).map((t: any) => ({
        name: t.name,
        artist: t.artists.map((a: any) => a.name).join(', '),
        albumArt: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
        uri: t.uri,
      }));

      const data: VibeData = {
        spotify_id: currentUser.id,
        display_name: currentUser.display_name,
        avatar_url: currentUser.avatar_url || null,
        playlist_id: playlistId || null,
        vibe_label: `${vibeLabel.emoji} ${vibeLabel.label}`,
        vibe_gradient: gradient.css,
        average_features: profile.averageFeatures as any,
        top_tracks: top5,
        top_genres: profile.topGenres,
      };

      setVibeData(data);

      // Update user
      const updatedUser = { ...currentUser, playlistId: playlistId || undefined };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));

      // Save to DB
      await saveVibe(data);
    } catch (err) {
      console.error('Generate vibe error:', err);
      if (!background) {
        // If token is invalid, clear session and redirect to login
        if (String(err).includes('Authentication failed') || String(err).includes('No valid access token')) {
          localStorage.clear();
          setUser(null);
          navigate('/');
          return;
        }
        setError('Failed to generate your vibe. Try refreshing.');
      }
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/${userId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
    navigate('/');
  }

  // --- Loading State ---
  if (loading && !vibeData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">{generating ? 'Analyzing your music...' : 'Loading vibe...'}</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error && !vibeData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-white/60 text-lg mb-6">{error}</p>
          <a href="/" className="text-[#1DB954] hover:underline font-medium">
            Create your vibe
          </a>
        </div>
      </div>
    );
  }

  if (!vibeData) return null;

  // --- Parse data ---
  const features = vibeData.average_features || {};
  const gradient = vibeData.vibe_gradient || 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';
  const textColor = features.valence != null ? getContrastTextColor(features as any) : '#ffffff';
  const subtleColor = features.valence != null ? getSubtleTextColor(features as any) : 'rgba(255,255,255,0.6)';
  const topTracks = vibeData.top_tracks || [];
  const topGenres = vibeData.top_genres || [];

  const meters = [
    { label: 'Energy', value: features.energy || 0 },
    { label: 'Mood', value: features.valence || 0 },
    { label: 'Dance', value: features.danceability || 0 },
    { label: 'Acoustic', value: features.acousticness || 0 },
  ];

  return (
    <div className="min-h-screen" style={{ background: gradient }}>
      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          {vibeData.avatar_url && (
            <img
              src={vibeData.avatar_url}
              alt=""
              className="w-20 h-20 rounded-full mx-auto mb-4 border-2"
              style={{ borderColor: textColor }}
            />
          )}
          <h1 className="text-4xl font-bold mb-1" style={{ color: textColor }}>
            {vibeData.display_name}
          </h1>
          <p className="text-sm uppercase tracking-widest" style={{ color: subtleColor }}>
            vibecheck.style
          </p>
        </div>

        {/* Vibe Label — the hero */}
        <div className="text-center mb-10">
          <div
            className="text-5xl sm:text-6xl font-bold leading-tight"
            style={{ color: textColor }}
          >
            {vibeData.vibe_label}
          </div>
          {topGenres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {topGenres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: `${textColor}15`,
                    color: textColor,
                    border: `1px solid ${textColor}30`,
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mood Meters */}
        <div className="grid grid-cols-4 gap-3 mb-10">
          {meters.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="relative h-24 w-full rounded-lg overflow-hidden mb-2" style={{ background: `${textColor}10` }}>
                <div
                  className="absolute bottom-0 w-full rounded-lg transition-all duration-700"
                  style={{
                    height: `${Math.round(value * 100)}%`,
                    background: `${textColor}30`,
                  }}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                  style={{ color: textColor }}
                >
                  {Math.round(value * 100)}
                </span>
              </div>
              <span className="text-xs uppercase tracking-wide" style={{ color: subtleColor }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Top 5 Tracks */}
        {topTracks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm uppercase tracking-widest mb-4" style={{ color: subtleColor }}>
              Top Tracks
            </h2>
            <div className="space-y-3">
              {topTracks.map((track: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg font-bold w-6" style={{ color: `${textColor}40` }}>
                    {i + 1}
                  </span>
                  {track.albumArt && (
                    <img src={track.albumArt} alt="" className="w-12 h-12 rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: textColor }}>
                      {track.name}
                    </p>
                    <p className="text-sm truncate" style={{ color: subtleColor }}>
                      {track.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spotify Playlist Embed */}
        {vibeData.playlist_id && (
          <div className="mb-10 rounded-xl overflow-hidden">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${vibeData.playlist_id}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-full font-semibold text-lg transition-all duration-200"
            style={{
              background: textColor,
              color: gradient.includes('hsl') ? '#000' : '#fff',
            }}
          >
            {copied ? 'Copied!' : 'Share Your Vibe'}
          </button>

          <div className="flex gap-3">
            {vibeData.playlist_id && (
              <a
                href={`https://open.spotify.com/playlist/${vibeData.playlist_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-full font-medium text-center border transition-all duration-200"
                style={{ borderColor: `${textColor}40`, color: textColor }}
              >
                Open in Spotify
              </a>
            )}
            <button
              onClick={() => setShowStory(true)}
              className="flex-1 py-3 rounded-full font-medium border transition-all duration-200"
              style={{ borderColor: `${textColor}40`, color: textColor }}
            >
              Story
            </button>
          </div>

          {isOwner && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => generateVibe(false)}
                disabled={generating}
                className="flex-1 py-2 rounded-full text-sm font-medium border transition-all duration-200 disabled:opacity-50"
                style={{ borderColor: `${textColor}20`, color: subtleColor }}
              >
                {generating ? 'Refreshing...' : 'Refresh Vibe'}
              </button>
              <button
                onClick={handleLogout}
                className="py-2 px-4 rounded-full text-sm font-medium transition-all duration-200"
                style={{ color: subtleColor }}
              >
                Logout
              </button>
            </div>
          )}

          {!isOwner && (
            <a
              href="/"
              className="w-full py-3 rounded-full font-medium text-center border transition-all duration-200 block"
              style={{ borderColor: `${textColor}40`, color: textColor }}
            >
              Create Your Own Vibe
            </a>
          )}
        </div>

        <p className="text-center mt-8 text-xs" style={{ color: `${textColor}30` }}>
          vibecheck.style
        </p>
      </div>

      {/* Story Generator */}
      {showStory && (
        <StoryGenerator
          user={{ display_name: vibeData.display_name, id: vibeData.spotify_id }}
          topTracks={topTracks.map((t: any) => ({
            name: t.name,
            artists: [{ name: t.artist }],
            album: { images: [{ url: t.albumArt }] },
          }))}
          vibeLabel={vibeData.vibe_label || ''}
          gradient={gradient}
          onClose={() => setShowStory(false)}
        />
      )}
    </div>
  );
}
