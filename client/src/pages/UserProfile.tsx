import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Music, ArrowLeft, ExternalLink } from 'lucide-react';

interface User {
    id: string;
    display_name: string;
    email: string;
    playlistId?: string;
}

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;

            try {
                const response = await axios.get(`/api/user/${id}`);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
                setError('User not found');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        The user profile you're looking for doesn't exist or hasn't been created yet.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </button>
                        <div className="flex items-center gap-2">
                            <Music className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold">Vibecheck.me</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="text-center mb-8">
                        <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <Music className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{user.display_name}'s Vibecheck</h1>
                        <p className="text-muted-foreground">
                            Your ultimate playlist crafted from your top tracks across all time periods
                        </p>
                    </div>

                    {/* Playlist Section */}
                    <div className="bg-card border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Ultimate Playlist</h2>
                            {user.playlistId && (
                                <a
                                    href={`https://open.spotify.com/playlist/${user.playlistId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Open in Spotify
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                        </div>

                        {user.playlistId ? (
                            <div className="flex justify-center">
                                <iframe
                                    src={`https://open.spotify.com/embed/playlist/${user.playlistId}?utm_source=generator&theme=0`}
                                    width="100%"
                                    height="480"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    className="rounded-lg max-w-md mx-auto"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">
                                    Your ultimate playlist is being created...
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This may take a few moments while we analyze your top tracks
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-card border rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-primary mb-2">3</div>
                            <p className="text-sm text-muted-foreground">Time Periods Analyzed</p>
                        </div>
                        <div className="bg-card border rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-primary mb-2">~60</div>
                            <p className="text-sm text-muted-foreground">Max Tracks Considered</p>
                        </div>
                        <div className="bg-card border rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-primary mb-2">1</div>
                            <p className="text-sm text-muted-foreground">Ultimate Playlist</p>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-card border rounded-lg p-6 mt-8">
                        <h3 className="text-lg font-semibold mb-4">How Your Playlist Was Created</h3>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                <strong>Short Term:</strong> Your top tracks from the last 4 weeks
                            </p>
                            <p>
                                <strong>Medium Term:</strong> Your top tracks from the last 6 months
                            </p>
                            <p>
                                <strong>Long Term:</strong> Your top tracks from all time
                            </p>
                            <p className="mt-4">
                                We combined up to 20 tracks from each time period, removed duplicates,
                                and created your ultimate playlist that represents your musical taste across different periods.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}