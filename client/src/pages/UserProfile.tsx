import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Music } from 'lucide-react';

interface User {
    id: string;
    display_name: string;
    playlistId?: string;
}

interface UserProfileProps {
    user: User | null;
    accessToken: string | null;
    setUser: (user: User | null) => void;
}

export default function UserProfile({ user, accessToken, setUser }: UserProfileProps) {
    const { userId } = useParams<{ userId: string }>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If we have a user and access token, and no playlist yet, create one
        if (user && accessToken && !user.playlistId && user.id === userId) {
            createUltimatePlaylist();
        }
    }, [user, accessToken, userId]);

    const createUltimatePlaylist = async () => {
        if (!accessToken || !user) return;

        setLoading(true);
        try {
            console.log('🎵 Creating Ultimate Playlist...');

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

            console.log('📊 Track data:', {
                shortTerm: shortTerm.items?.length || 0,
                mediumTerm: mediumTerm.items?.length || 0,
                longTerm: longTerm.items?.length || 0
            });

            // Combine tracks and dedupe by track URI
            const allTracks = new Set();
            const trackDetails = [];

            [...(shortTerm.items || []), ...(mediumTerm.items || []), ...(longTerm.items || [])]
                .forEach(track => {
                    if (!allTracks.has(track.uri)) {
                        allTracks.add(track.uri);
                        trackDetails.push(track);
                    }
                });

            const trackUris = Array.from(allTracks) as string[];
            console.log('🎵 Unique tracks found:', trackUris.length);

            // Create playlist
            const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Vibecheck - Ultimate Playlist',
                    description: 'Your ultimate playlist from top tracks across all time periods • Created by Vibecheck.me',
                    public: false,
                }),
            });

            const playlist = await playlistResponse.json();
            console.log('📝 Playlist created:', playlist.id);

            // Add tracks to playlist (max 100 at a time)
            if (trackUris.length > 0) {
                const tracksToAdd = trackUris.slice(0, 100); // Spotify API limit
                await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uris: tracksToAdd
                    }),
                });
                console.log('✅ Added tracks to playlist:', tracksToAdd.length);
            }

            // Update user data with playlist ID
            const updatedUser = { ...user, playlistId: playlist.id };
            setUser(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));

            console.log('🎉 Ultimate playlist created successfully!');
        } catch (error) {
            console.error('❌ Failed to create playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.id !== userId) {
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
                        {loading ? (
                            <div className="py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Creating your ultimate playlist...</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Analyzing your top tracks from all time periods
                                </p>
                            </div>
                        ) : user.playlistId ? (
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

                    {/* Actions */}
                    <div className="mt-6 space-y-4">
                        {user.playlistId && (
                            <div className="flex gap-4 justify-center">
                                <a
                                    href={`https://open.spotify.com/playlist/${user.playlistId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#1DB954] text-white px-6 py-2 rounded-lg hover:bg-[#1DB954]/90 transition-colors"
                                >
                                    Open in Spotify
                                </a>
                                <button
                                    onClick={createUltimatePlaylist}
                                    disabled={loading}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Recreate Playlist'}
                                </button>
                            </div>
                        )}

                        <div>
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
        </div>
    );
}