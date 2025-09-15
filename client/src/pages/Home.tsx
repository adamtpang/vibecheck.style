import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            <div className="text-center max-w-md mx-auto px-4">
                <div className="flex items-center justify-center mb-12">
                    <Music className="h-16 w-16 text-black mr-4" />
                    <h1 className="text-5xl font-bold text-black">
                        Vibecheck
                    </h1>
                </div>

                <p className="text-xl text-gray-600 mb-16">
                    Discover your ultimate music vibe from Spotify
                </p>

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