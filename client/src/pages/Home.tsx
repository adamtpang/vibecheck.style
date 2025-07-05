import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Music, PlayCircle, TrendingUp } from 'lucide-react';

interface User {
    id: string;
    display_name: string;
    email: string;
    playlistId?: string;
}

interface HomeProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

export default function Home({ user, setUser }: HomeProps) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/login');
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Login failed:', error);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <Music className="h-12 w-12 text-primary mr-3" />
                        <h1 className="text-4xl font-bold text-foreground">Vibecheck.me</h1>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Create your ultimate playlist from your Spotify top tracks
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Top Tracks Analysis</h3>
                        <p className="text-muted-foreground">
                            We analyze your top tracks from short, medium, and long-term listening history
                        </p>
                    </div>
                    <div className="text-center">
                        <PlayCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ultimate Playlist</h3>
                        <p className="text-muted-foreground">
                            Merge your favorites into one perfect playlist that represents your musical taste
                        </p>
                    </div>
                    <div className="text-center">
                        <Music className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Spotify Integration</h3>
                        <p className="text-muted-foreground">
                            Automatically creates and updates your playlist directly in your Spotify account
                        </p>
                    </div>
                </div>

                {/* User Actions */}
                {user ? (
                    <div className="bg-card border rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Welcome back, {user.display_name}!</h2>
                        <p className="text-muted-foreground mb-6">
                            Your ultimate playlist has been created. Check out your personalized profile!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate(`/user/${user.id}`)}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                View Your Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
                        <p className="text-muted-foreground mb-6">
                            Connect your Spotify account to create your ultimate playlist
                        </p>
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="bg-[#1DB954] text-white px-8 py-3 rounded-lg hover:bg-[#1DB954]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Music className="h-5 w-5" />
                                    Login with Spotify
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* How it works */}
                <div className="mt-16 text-left">
                    <h2 className="text-2xl font-semibold mb-8 text-center">How It Works</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-card border rounded-lg p-4">
                            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mb-3">
                                <span className="text-primary font-bold">1</span>
                            </div>
                            <h3 className="font-semibold mb-2">Login</h3>
                            <p className="text-sm text-muted-foreground">
                                Connect your Spotify account securely
                            </p>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mb-3">
                                <span className="text-primary font-bold">2</span>
                            </div>
                            <h3 className="font-semibold mb-2">Analyze</h3>
                            <p className="text-sm text-muted-foreground">
                                We fetch your top tracks from 3 time periods
                            </p>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mb-3">
                                <span className="text-primary font-bold">3</span>
                            </div>
                            <h3 className="font-semibold mb-2">Create</h3>
                            <p className="text-sm text-muted-foreground">
                                Your ultimate playlist is created automatically
                            </p>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mb-3">
                                <span className="text-primary font-bold">4</span>
                            </div>
                            <h3 className="font-semibold mb-2">Enjoy</h3>
                            <p className="text-sm text-muted-foreground">
                                Listen to your personalized playlist
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}