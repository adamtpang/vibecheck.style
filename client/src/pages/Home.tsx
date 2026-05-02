import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../App';
import Footer from '../components/Footer';

interface HomeProps {
  user: User | null;
}

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'e4435ec6b82f42189d94e6229acad817';
const REDIRECT_URI = window.location.origin;

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export default function Home({ user }: HomeProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If logged in, go to their vibe card
  useEffect(() => {
    if (user) {
      navigate(`/${user.id}`, { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      localStorage.setItem('code_verifier', codeVerifier);

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        // Bumped in v2.14 to include playback + library scopes so we can show
        // now-playing, recently-played, and library size on the profile card.
        // Existing users keep their old scopes until they next re-auth — the
        // new sections silently no-op for them until they reconnect.
        scope: [
          'user-read-private',
          'user-top-read',
          'playlist-modify-public',
          'playlist-modify-private',
          'user-read-recently-played',
          'user-read-currently-playing',
          'user-read-playback-state',
          'user-library-read',
        ].join(' '),
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params}`;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <h1 className="text-6xl sm:text-7xl font-bold text-white tracking-tight mb-4">
          vibe<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">check</span>
        </h1>

        <p className="text-white/50 text-lg mb-12 font-light">
          what does your music say about you?
        </p>

        {/* CTA */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="group relative bg-[#1DB954] text-black px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#1ed760] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connect with Spotify
            </span>
          )}
        </button>

        <div className="mt-6">
          <Link
            to="/explore"
            className="text-white/40 hover:text-white/80 text-sm font-medium transition-colors"
          >
            or explore other vibes →
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl mb-2">🎵</div>
            <p className="text-white/40 text-sm">connect spotify</p>
          </div>
          <div>
            <div className="text-2xl mb-2">✨</div>
            <p className="text-white/40 text-sm">get your vibe</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🔗</div>
            <p className="text-white/40 text-sm">share with friends</p>
          </div>
        </div>

        <p className="text-white/20 text-xs mt-12">
          vibecheck.style
        </p>

        <Footer />
      </div>
    </div>
  );
}
