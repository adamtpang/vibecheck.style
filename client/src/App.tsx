import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import './index.css';

interface User {
    id: string;
    display_name: string;
    playlistId?: string;
}

const CLIENT_ID = 'a7c7a6bd4b9c408294b6e9b78b0bc936'; // Vibecheck app
const REDIRECT_URI = window.location.origin;

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            handleCallback(code);
        } else {
            const token = localStorage.getItem('spotify_access_token');
            if (token) {
                setAccessToken(token);
                fetchUserProfile(token);
            } else {
                setLoading(false);
            }
        }
    }, []);

    const handleCallback = async (code: string) => {
        try {
            const codeVerifier = localStorage.getItem('code_verifier');
            if (!codeVerifier) return;

            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: REDIRECT_URI,
                    client_id: CLIENT_ID,
                    code_verifier: codeVerifier,
                }),
            });

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.removeItem('code_verifier');
                setAccessToken(data.access_token);
                fetchUserProfile(data.access_token);
                window.history.replaceState({}, document.title, '/');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setLoading(false);
        }
    };

    const fetchUserProfile = async (token: string) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const profile = await response.json();
                setUser({
                    id: profile.id,
                    display_name: profile.display_name || profile.id,
                });
            } else {
                localStorage.removeItem('spotify_access_token');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            localStorage.removeItem('spotify_access_token');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home user={user} setUser={setUser} accessToken={accessToken} />} />
                <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
        </Router>
    );
}