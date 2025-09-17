import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Users, Heart } from 'lucide-react';

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

const CLIENT_ID = 'e4435ec6b82f42189d94e6229acad817';
const REDIRECT_URI = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:3000/api/callback'
    : 'https://vibecheck.style/api/callback';

// Debug logging

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
    const navigate = useNavigate();

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


            window.location.href = authUrl;
        } catch (error) {
            setLoading(false);
        }
    };

    if (user) {
        // User is logged in, redirect to their profile automatically
        setTimeout(() => {
            navigate(`/user/${user.id}`);
        }, 100);
        
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="flex items-center justify-center mb-8">
                        <Music className="h-16 w-16 text-black mr-4" />
                        <h1 className="text-5xl font-bold text-black">Vibecheck</h1>
                    </div>

                    <p className="text-xl text-gray-600 mb-8">
                        Loading your vibe, {user.display_name}...
                    </p>

                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-center mb-8">
                    <Music className="h-16 w-16 text-black mr-4" />
                    <h1 className="text-5xl font-bold text-black">
                        Vibecheck
                    </h1>
                </div>

                <div className="mb-12 max-w-2xl mx-auto">
                    <div className="border-l-4 border-black pl-6 mb-8">
                        <h2 className="text-lg font-medium text-black mb-3">What is vibecheck.style?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Connect your Spotify to analyze your listening patterns across different time periods.
                            We create your ultimate vibe playlist, calculate your music DNA, and let you discover
                            compatibility with others in the community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="border border-gray-200 p-4">
                            <Music className="h-8 w-8 text-black mx-auto mb-2" />
                            <h3 className="font-medium text-black mb-1">Analyze</h3>
                            <p className="text-sm text-gray-600">Top tracks from 4 weeks, 6 months, and all-time</p>
                        </div>
                        <div className="border border-gray-200 p-4">
                            <Users className="h-8 w-8 text-black mx-auto mb-2" />
                            <h3 className="font-medium text-black mb-1">Discover</h3>
                            <p className="text-sm text-gray-600">Find music compatibility with other users</p>
                        </div>
                        <div className="border border-gray-200 p-4">
                            <Heart className="h-8 w-8 text-black mx-auto mb-2" />
                            <h3 className="font-medium text-black mb-1">Share</h3>
                            <p className="text-sm text-gray-600">Your unique vibe profile and playlist</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-black text-white px-12 py-4 rounded-none text-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto border border-black"
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