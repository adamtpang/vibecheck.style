import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import './index.css';

interface User {
    id: string;
    display_name: string;
    playlistId?: string;
}

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:3000/api/callback'
    : 'https://vibecheck.style/api/callback';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing user data
        const userData = localStorage.getItem('user_data');
        const token = localStorage.getItem('access_token');
        const expiresAt = localStorage.getItem('token_expires_at');

        if (userData && token) {
            // Check if token is expired
            if (expiresAt && Date.now() >= parseInt(expiresAt)) {
                // Token is expired, will refresh on first API call
            }
            setUser(JSON.parse(userData));
            setAccessToken(token);
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


            if (!codeVerifier) {
                throw new Error('Code verifier not found');
            }

            const tokenData = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                code_verifier: codeVerifier,
            };


            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(tokenData),
            });


            const data = await response.json();


            if (data.error) {
                throw new Error(data.error_description || data.error);
            }

            if (!data.access_token) {
                throw new Error('No access token received');
            }

            // Store the access token and refresh token
            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            
            // Store expiration time (current time + expires_in seconds - 5 min buffer)
            if (data.expires_in) {
                const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
                localStorage.setItem('token_expires_at', expiresAt.toString());
            }
            
            setAccessToken(data.access_token);

            // Clean up
            localStorage.removeItem('code_verifier');
            window.history.replaceState({}, document.title, '/');

            // Get user profile
            const userResponse = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                },
            });


            const userData = await userResponse.json();


            if (userData.error) {
                throw new Error(userData.error.message || 'Failed to get user profile');
            }

            const user: User = {
                id: userData.id,
                display_name: userData.display_name,
            };

            localStorage.setItem('user_data', JSON.stringify(user));
            setUser(user);
            
            // Auto-create playlist after successful OAuth
            setTimeout(() => {
                window.location.href = `/user/${user.id}`;
            }, 100);
        } catch (error) {
            // Clear any partial state
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token_expires_at');
            localStorage.removeItem('user_data');
            localStorage.removeItem('code_verifier');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen bg-white">
                <Routes>
                    <Route path="/" element={<Home user={user} setUser={setUser} accessToken={accessToken} />} />
                    <Route path="/user/:userId" element={<UserProfile user={user} accessToken={accessToken} setUser={setUser} />} />
                    <Route path="/discover" element={<Dashboard currentUser={user} />} />
                    <Route path="/analytics" element={<Analytics />} />
                </Routes>
            </div>
        </Router>
    );
}// Force redeploy Sat Jul  5 20:37:19 +08 2025
