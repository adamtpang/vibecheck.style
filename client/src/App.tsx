import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import VibeCard from './pages/VibeCard';
import Explore from './pages/Explore';
import './index.css';

export interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  playlistId?: string;
}

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'e4435ec6b82f42189d94e6229acad817';
const REDIRECT_URI = window.location.origin;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user data
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');

    if (userData && token) {
      setUser(JSON.parse(userData));
    }

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setLoading(false);
      return;
    }

    if (code) {
      handleOAuthCallback(code);
    } else {
      setLoading(false);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      const codeVerifier = localStorage.getItem('code_verifier');
      if (!codeVerifier) throw new Error('Code verifier not found');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error_description || data.error);
      if (!data.access_token) throw new Error('No access token received');

      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      if (data.expires_in) {
        const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
        localStorage.setItem('token_expires_at', expiresAt.toString());
      }

      localStorage.removeItem('code_verifier');

      // Get user profile
      const userRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const profile = await userRes.json();
      if (profile.error) throw new Error(profile.error.message);

      const user: User = {
        id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.images?.[0]?.url || null,
      };

      localStorage.setItem('user_data', JSON.stringify(user));
      setUser(user);

      // Redirect to their vibe card
      window.history.replaceState({}, document.title, `/${user.id}`);
    } catch (err) {
      console.error('OAuth error:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user_data');
      localStorage.removeItem('code_verifier');
      window.history.replaceState({}, document.title, '/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/explore" element={<Explore currentUser={user} />} />
        <Route path="/:userId" element={<VibeCard currentUser={user} setUser={setUser} />} />
      </Routes>
    </Router>
  );
}
