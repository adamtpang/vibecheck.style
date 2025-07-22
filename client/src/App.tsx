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

const CLIENT_ID = 'e4435ec6b82f42189d94e6229acad817'; // Vibecheck app
const REDIRECT_URI = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://vibecheck-phi.vercel.app';

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
                console.log('🔄 Stored token is expired, will refresh on first API call');
            }
            setUser(JSON.parse(userData));
            setAccessToken(token);
        }

        // Check for OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        console.log('🔍 OAUTH CALLBACK CHECK:');
        console.log('- Current URL:', window.location.href);
        console.log('- Has code param:', !!code);
        console.log('- Has error param:', !!error);

        if (error) {
            console.error('❌ OAuth error:', error);
            console.error('- Error description:', urlParams.get('error_description'));
            setLoading(false);
            return;
        }

        if (code) {
            console.log('🔄 Processing OAuth code:', code.substring(0, 20) + '...');
            handleOAuthCallback(code);
        } else {
            setLoading(false);
        }
    }, []);

    const handleOAuthCallback = async (code: string) => {
        try {
            const codeVerifier = localStorage.getItem('code_verifier');

            console.log('🔄 TOKEN EXCHANGE STARTING:');
            console.log('- Code verifier found:', !!codeVerifier);
            console.log('- Code verifier length:', codeVerifier?.length);
            console.log('- Client ID:', CLIENT_ID);
            console.log('- Redirect URI:', REDIRECT_URI);

            if (!codeVerifier) {
                console.error('❌ Code verifier not found in localStorage');
                throw new Error('Code verifier not found');
            }

            const tokenData = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                code_verifier: codeVerifier,
            };

            console.log('📤 TOKEN REQUEST DATA:');
            console.log('- Grant type:', tokenData.grant_type);
            console.log('- Code:', tokenData.code.substring(0, 20) + '...');
            console.log('- Redirect URI:', tokenData.redirect_uri);
            console.log('- Client ID:', tokenData.client_id);
            console.log('- Code verifier:', tokenData.code_verifier.substring(0, 20) + '...');

            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(tokenData),
            });

            console.log('�� TOKEN RESPONSE:');
            console.log('- Status:', response.status);
            console.log('- Status text:', response.statusText);
            console.log('- Headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();

            console.log('📄 TOKEN RESPONSE DATA:');
            console.log('- Success:', !!data.access_token);
            console.log('- Has refresh token:', !!data.refresh_token);
            console.log('- Token type:', data.token_type);
            console.log('- Expires in:', data.expires_in);
            console.log('- Scope:', data.scope);

            if (data.error) {
                console.error('❌ TOKEN ERROR:', data.error);
                console.error('- Error description:', data.error_description);
                throw new Error(data.error_description || data.error);
            }

            if (!data.access_token) {
                console.error('❌ No access token received');
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
            console.log('👤 FETCHING USER PROFILE...');
            const userResponse = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                },
            });

            console.log('📥 USER PROFILE RESPONSE:');
            console.log('- Status:', userResponse.status);
            console.log('- Status text:', userResponse.statusText);

            const userData = await userResponse.json();

            console.log('👤 USER DATA:');
            console.log('- ID:', userData.id);
            console.log('- Display name:', userData.display_name);
            console.log('- Country:', userData.country);
            console.log('- Email:', userData.email);

            if (userData.error) {
                console.error('❌ USER PROFILE ERROR:', userData.error);
                throw new Error(userData.error.message || 'Failed to get user profile');
            }

            const user: User = {
                id: userData.id,
                display_name: userData.display_name,
            };

            localStorage.setItem('user_data', JSON.stringify(user));
            setUser(user);

            console.log('✅ OAuth flow completed successfully');
        } catch (error) {
            console.error('❌ OAuth callback failed:', error);
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen bg-background">
                <Routes>
                    <Route path="/" element={<Home user={user} setUser={setUser} accessToken={accessToken} />} />
                    <Route path="/user/:userId" element={<UserProfile user={user} accessToken={accessToken} setUser={setUser} />} />
                </Routes>
            </div>
        </Router>
    );
}// Force redeploy Sat Jul  5 20:37:19 +08 2025
