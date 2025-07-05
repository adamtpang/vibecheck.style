import { useState } from 'react';
import { Music } from 'lucide-react';

interface User {
    id: string;
    display_name: string;
    playlistId?: string;
}

interface HomeProps {
    user: User | null;
    setUser: (user: User | null) => void;
    accessToken: string | null;
}

const CLIENT_ID = 'a7c7a6bd4b9c408294b6e9b78b0bc936';
const REDIRECT_URI = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://vibecheck-phi.vercel.app';

// Debug logging
console.log('🔍 DEBUG INFO:');
console.log('- Hostname:', window.location.hostname);
console.log('- Redirect URI:', REDIRECT_URI);
console.log('- Client ID:', CLIENT_ID);

// Generate PKCE code verifier and challenge
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export default function Home({ user, setUser, accessToken }: HomeProps) {
    const [loading, setLoading] = useState(false);

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
                scope: 'user-read-private user-top-read playlist-modify-public playlist-modify-private',
                code_challenge_method: 'S256',
                code_challenge: codeChallenge,
            });

            const authUrl = `https://accounts.spotify.com/authorize?${params}`;

            // Debug logging
            console.log('🚀 STARTING OAUTH FLOW:');
            console.log('- Auth URL:', authUrl);
            console.log('- Redirect URI being sent:', REDIRECT_URI);
            console.log('- Client ID being sent:', CLIENT_ID);
            console.log('- Code verifier stored:', codeVerifier.substring(0, 10) + '...');

            window.location.href = authUrl;
        } catch (error) {
            console.error('❌ Login failed:', error);
            setLoading(false);
        }
    };

    const createUltimatePlaylist = async () => {
        if (!accessToken || !user) return;

        setLoading(true);
        try {
            // Get top tracks from all time periods
            const [shortTerm, mediumTerm, longTerm] = await Promise.all([
                fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }).then(r => r.json()),
                fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=20`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }).then(r => r.json()),
                fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=20`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }).then(r => r.json())
            ]);

            // Combine tracks and dedupe
            const allTracks = new Set();
            [...(shortTerm.items || []), ...(mediumTerm.items || []), ...(longTerm.items || [])]
                .forEach(track => allTracks.add(track.uri));

            const trackUris = Array.from(allTracks) as string[];

            // Create playlist
            const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Vibecheck - Ultimate Playlist',
                    description: 'Your ultimate playlist from top tracks across all time periods',
                    public: false,
                }),
            });

            const playlist = await playlistResponse.json();

            // Add tracks to playlist
            if (trackUris.length > 0) {
                await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uris: trackUris.slice(0, 100) // Spotify limit
                    }),
                });
            }

            // Update user with playlist ID
            const updatedUser = { ...user, playlistId: playlist.id };
            setUser(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));

            // Navigate to profile
            window.location.href = `/user/${user.id}`;
        } catch (error) {
            console.error('Failed to create playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="flex items-center justify-center mb-8">
                        <Music className="h-16 w-16 text-primary mr-4" />
                        <h1 className="text-5xl font-bold text-foreground">Vibecheck</h1>
                    </div>

                    <p className="text-xl text-muted-foreground mb-8">
                        Welcome back, {user.display_name}!
                    </p>

                    <button
                        onClick={createUltimatePlaylist}
                        disabled={loading}
                        className="bg-[#1DB954] text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-[#1DB954]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Creating Playlist...
                            </>
                        ) : (
                            <>
                                <Music className="h-6 w-6" />
                                Create Ultimate Playlist
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                <div className="flex items-center justify-center mb-8">
                    <Music className="h-16 w-16 text-primary mr-4" />
                    <h1 className="text-5xl font-bold text-foreground">Vibecheck</h1>
                </div>

                <p className="text-xl text-muted-foreground mb-12">
                    Your ultimate playlist from Spotify top tracks
                </p>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-[#1DB954] text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-[#1DB954]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Music className="h-6 w-6" />
                            Connect Spotify
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}