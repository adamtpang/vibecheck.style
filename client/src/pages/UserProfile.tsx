import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Music } from 'lucide-react';

interface User {
    id: string;
    display_name: string;
    playlistId?: string;
}

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user_data');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.id === id) {
                setUser(parsedUser);
            }
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">User not found</h1>
                    <a href="/" className="text-primary hover:underline">Go home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto text-center">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Music className="h-8 w-8 text-primary mr-2" />
                            <h1 className="text-3xl font-bold">{user.display_name}</h1>
                        </div>
                        <p className="text-muted-foreground">Ultimate Vibecheck Playlist</p>
                    </div>

                    {/* Playlist */}
                    <div className="bg-card border rounded-lg p-6">
                        {user.playlistId ? (
                            <iframe
                                src={`https://open.spotify.com/embed/playlist/${user.playlistId}?utm_source=generator&theme=0`}
                                width="100%"
                                height="500"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="rounded-lg"
                            ></iframe>
                        ) : (
                            <div className="py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Creating your ultimate playlist...</p>
                            </div>
                        )}
                    </div>

                    {/* Simple home link */}
                    <div className="mt-6">
                        <a
                            href="/"
                            className="text-primary hover:underline"
                        >
                            Create your own Vibecheck
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}