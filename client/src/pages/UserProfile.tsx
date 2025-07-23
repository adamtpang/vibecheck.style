import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Music } from 'lucide-react';
import StoryGenerator from '../components/StoryGenerator';
import { spotifyApiGet, spotifyApiPost } from '../utils/spotify-api';
import { createVibeProfile, VibeProfile } from '../utils/vibe-analysis';

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
    const [showStoryGenerator, setShowStoryGenerator] = useState(false);
    const [topTracks, setTopTracks] = useState<any[]>([]);
    const [vibeProfile, setVibeProfile] = useState<VibeProfile | null>(null);

    useEffect(() => {
        // If we have a user and no playlist yet, create one
        if (user && !user.playlistId && user.id === userId) {
            createUltimatePlaylist();
        }
    }, [user, userId]);

    const createUltimatePlaylist = async () => {
        if (!user) return;

        setLoading(true);
        try {
            console.log('🎵 Creating Ultimate Playlist...');

            // Get top tracks from all time periods
            const [shortTerm, mediumTerm, longTerm] = await Promise.all([
                spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20'),
                spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=20'),
                spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=20')
            ]);

            console.log('📊 Track data:', {
                shortTerm: shortTerm.items?.length || 0,
                mediumTerm: mediumTerm.items?.length || 0,
                longTerm: longTerm.items?.length || 0
            });

            // Combine tracks with priority to recent tracks, dedupe by track URI
            const allTracks = new Set();
            const trackDetails = [];

            // Add short term first (most recent), then medium, then long term
            const timeRanges = [
                { tracks: shortTerm.items || [], label: 'short_term' },
                { tracks: mediumTerm.items || [], label: 'medium_term' },
                { tracks: longTerm.items || [], label: 'long_term' }
            ];

            timeRanges.forEach(({ tracks, label }) => {
                tracks.forEach(track => {
                    if (!allTracks.has(track.uri)) {
                        allTracks.add(track.uri);
                        trackDetails.push({ ...track, timeRange: label });
                    }
                });
            });

            const trackUris = trackDetails.map(track => track.uri);
            console.log('🎵 Unique tracks found:', trackUris.length);
            console.log('📈 Track ordering: recent tracks prioritized at top');
            
            // Store top tracks for story generation
            setTopTracks(trackDetails.slice(0, 10));

            // Create vibe profile for compatibility analysis
            try {
                const profile = await createVibeProfile(
                    user.id,
                    user.display_name,
                    trackDetails
                );
                setVibeProfile(profile);
                console.log('🧠 Vibe profile created successfully');
            } catch (error) {
                console.error('❌ Failed to create vibe profile:', error);
            }

            // Create playlist
            const playlist = await spotifyApiPost(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
                name: 'vibecheck.style',
                description: `${user.display_name}'s music vibe`,
                public: false,
            });
            console.log('📝 Playlist created:', playlist.id);

            // Add tracks to playlist (max 100 at a time)
            if (trackUris.length > 0) {
                const tracksToAdd = trackUris.slice(0, 100); // Spotify API limit
                await spotifyApiPost(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                    uris: tracksToAdd
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-black">User not found</h1>
                    <a href="/" className="text-gray-600 hover:text-black font-medium border-b border-gray-300 hover:border-black transition-colors">Go home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto text-center">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center mb-6">
                            <Music className="h-10 w-10 text-black mr-3" />
                            <h1 className="text-4xl font-bold text-black">
                                {user.display_name}
                            </h1>
                        </div>
                        <p className="text-gray-600 text-lg font-light">Your Music Vibe</p>
                        
                        {/* Vibe Profile Stats */}
                        {vibeProfile && (
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="border border-gray-200 p-6 text-center">
                                    <div className="text-3xl font-light text-black mb-2">
                                        {Math.round(vibeProfile.averageFeatures.energy * 100)}%
                                    </div>
                                    <div className="text-gray-500 text-sm uppercase tracking-wide">Energy</div>
                                </div>
                                <div className="border border-gray-200 p-6 text-center">
                                    <div className="text-3xl font-light text-black mb-2">
                                        {Math.round(vibeProfile.averageFeatures.valence * 100)}%
                                    </div>
                                    <div className="text-gray-500 text-sm uppercase tracking-wide">Positivity</div>
                                </div>
                                <div className="border border-gray-200 p-6 text-center">
                                    <div className="text-3xl font-light text-black mb-2">
                                        {Math.round(vibeProfile.averageFeatures.danceability * 100)}%
                                    </div>
                                    <div className="text-gray-500 text-sm uppercase tracking-wide">Danceability</div>
                                </div>
                                <div className="border border-gray-200 p-6 text-center">
                                    <div className="text-3xl font-light text-black mb-2">
                                        {Math.round(vibeProfile.averageFeatures.acousticness * 100)}%
                                    </div>
                                    <div className="text-gray-500 text-sm uppercase tracking-wide">Acoustic</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Share Button */}
                        <div className="mt-6">
                            <button
                                onClick={() => navigator.clipboard.writeText(window.location.href)}
                                className="border border-black text-black px-6 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
                            >
                                Share Your Vibe
                            </button>
                        </div>
                    </div>

                    {/* Playlist */}
                    <div className="border border-gray-200 p-8">
                        {loading ? (
                            <div className="py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-6"></div>
                                <p className="text-black text-xl font-light mb-2">Creating your ultimate vibe...</p>
                                <p className="text-gray-500 text-sm">
                                    Analyzing your top tracks from all time periods
                                </p>
                                <div className="mt-4 flex justify-center space-x-2">
                                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        ) : user.playlistId ? (
                            <div className="relative">
                                <iframe
                                    src={`https://open.spotify.com/embed/playlist/${user.playlistId}?utm_source=generator&theme=0`}
                                    width="100%"
                                    height="500"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    className="border border-gray-200"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-6"></div>
                                <p className="text-black text-xl font-light">Creating your ultimate vibe...</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-12 space-y-6">
                        {user.playlistId && (
                            <div className="flex gap-4 justify-center flex-wrap">
                                <a
                                    href={`https://open.spotify.com/playlist/${user.playlistId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors duration-200"
                                >
                                    Open in Spotify
                                </a>
                                <button
                                    onClick={createUltimatePlaylist}
                                    disabled={loading}
                                    className="border border-black text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors duration-200 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Refresh Vibe'}
                                </button>
                                
                                <button
                                    onClick={() => setShowStoryGenerator(true)}
                                    className="border border-gray-300 text-gray-600 px-8 py-3 font-medium hover:border-black hover:text-black transition-colors duration-200"
                                >
                                    Share Story
                                </button>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                            <div className="flex flex-col md:flex-row gap-6 justify-center">
                                <a
                                    href="/discover"
                                    className="text-gray-600 hover:text-black font-medium text-lg transition-colors duration-200 border-b border-gray-300 hover:border-black pb-1"
                                >
                                    Discover Other Vibes
                                </a>
                                <a
                                    href="/"
                                    className="text-gray-600 hover:text-black font-medium text-lg transition-colors duration-200 border-b border-gray-300 hover:border-black pb-1"
                                >
                                    Create Your Own Vibecheck
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Story Generator Modal */}
            {showStoryGenerator && user && (
                <StoryGenerator
                    user={user}
                    topTracks={topTracks}
                    onClose={() => setShowStoryGenerator(false)}
                />
            )}
        </div>
    );
}