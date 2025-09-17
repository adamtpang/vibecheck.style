import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Music } from 'lucide-react';
import StoryGenerator from '../components/StoryGenerator';
import PaymentGate from '../components/PaymentGate';
import { spotifyApiGet, spotifyApiPost } from '../utils/spotify-api';
import { createVibeProfile, VibeProfile } from '../utils/vibe-analysis';
import { detectAppContext, hasReachedUsageLimit, incrementUsageCount, getUsageStats } from '../utils/context-detection';

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
    const [showPaymentGate, setShowPaymentGate] = useState(false);
    const [topTracks, setTopTracks] = useState<any[]>([]);
    const [vibeProfile, setVibeProfile] = useState<VibeProfile | null>(null);
    const [appContext] = useState(detectAppContext());

    useEffect(() => {
        // If we have a user and no playlist yet, create one (bypassing payment check for first-time users)
        if (user && !user.playlistId && user.id === userId) {
            createUltimatePlaylist(true);
        }
    }, [user, userId]);

    const createUltimatePlaylist = async (bypassPaymentCheck = false) => {
        if (!user) return;

        // Check usage limits for Farcaster context (unless bypassing)
        if (!bypassPaymentCheck && hasReachedUsageLimit(user.id)) {
            setShowPaymentGate(true);
            return;
        }

        setLoading(true);
        try {

            // Get top tracks from all time periods with higher limits for better data
            const [shortTerm, mediumTerm, longTerm] = await Promise.all([
                spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50'),
                spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50'),
                spotifyApiGet('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50')
            ]);


            // Create weighted scoring system for better aggregation
            const trackScores = new Map();
            const trackDetails = new Map();

            // Scoring weights: Recent listening gets highest priority
            const weights = {
                short_term: 100,  // 4 weeks - highest weight
                medium_term: 50,  // 6 months - medium weight  
                long_term: 25     // All time - lower weight for recency
            };

            // Process each time range with weighted scoring
            const timeRanges = [
                { tracks: shortTerm.items || [], label: 'short_term' },
                { tracks: mediumTerm.items || [], label: 'medium_term' },
                { tracks: longTerm.items || [], label: 'long_term' }
            ];

            timeRanges.forEach(({ tracks, label }) => {
                tracks.forEach((track, index) => {
                    const trackId = track.uri;
                    // Calculate score: higher position (lower index) + time range weight
                    const positionScore = (tracks.length - index) * weights[label];
                    
                    if (trackScores.has(trackId)) {
                        trackScores.set(trackId, trackScores.get(trackId) + positionScore);
                    } else {
                        trackScores.set(trackId, positionScore);
                        trackDetails.set(trackId, { ...track, timeRange: label, appearances: [] });
                    }
                    
                    // Track which time ranges this song appears in
                    trackDetails.get(trackId).appearances.push({ timeRange: label, position: index + 1 });
                });
            });

            // Sort tracks by aggregated score (highest first)
            const sortedTracks = Array.from(trackScores.entries())
                .sort(([,scoreA], [,scoreB]) => scoreB - scoreA)
                .map(([uri, score]) => ({ 
                    ...trackDetails.get(uri), 
                    aggregatedScore: score,
                    uri 
                }));

            const trackUris = sortedTracks.map(track => track.uri);
            
            // Store top tracks for story generation and display
            setTopTracks(sortedTracks.slice(0, 15));

            // Create vibe profile for compatibility analysis
            try {
                const profile = await createVibeProfile(
                    user.id,
                    user.display_name,
                    sortedTracks
                );
                setVibeProfile(profile);
            } catch (error) {
                // Failed to create vibe profile
            }

            // Create playlist
            const playlist = await spotifyApiPost(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
                name: 'vibecheck.style',
                description: `${user.display_name}'s music vibe`,
                public: false,
            });

            // Add tracks to playlist (max 100 at a time)
            if (trackUris.length > 0) {
                const tracksToAdd = trackUris.slice(0, 100); // Spotify API limit
                await spotifyApiPost(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                    uris: tracksToAdd
                });
            }

            // Increment usage count for Farcaster users
            incrementUsageCount(user.id);

            // Update user data with playlist ID
            const updatedUser = { ...user, playlistId: playlist.id };
            setUser(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));

            // Save user data to serverless API
            try {
                const apiUrl = window.location.origin.includes('localhost') 
                    ? 'http://localhost:3000/api/users'
                    : '/api/users';
                    
                await fetch(`${apiUrl}/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                });
            } catch (error) {
                // Failed to save user data to API
            }

        } catch (error) {
            // Failed to create playlist
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

                        {/* Usage Stats for Farcaster */}
                        {appContext === 'farcaster' && user && (
                            <div className="mt-4 text-center">
                                {(() => {
                                    const { count, remaining } = getUsageStats(user.id);
                                    return remaining === -1 ? null : (
                                        <p className="text-sm text-gray-500">
                                            {remaining > 0 ? (
                                                `${remaining} free vibecheck${remaining === 1 ? '' : 's'} remaining this month`
                                            ) : (
                                                'Monthly limit reached - unlock unlimited access'
                                            )}
                                        </p>
                                    );
                                })()}
                            </div>
                        )}
                        
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

                    {/* Music Leaderboard */}
                    {topTracks.length > 0 && (
                        <div className="border border-gray-200 p-8 mb-8">
                            <h2 className="text-2xl font-light text-black mb-8 text-center">Your Music Leaderboard</h2>
                            <div className="space-y-4">
                                {topTracks.slice(0, 10).map((track, index) => {
                                    const timeRangeLabels = {
                                        short_term: '4 weeks',
                                        medium_term: '6 months', 
                                        long_term: 'all time'
                                    };
                                    
                                    return (
                                        <div key={track.uri} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                                            <div className="text-2xl font-light text-gray-400 w-8">
                                                #{index + 1}
                                            </div>
                                            
                                            <div className="w-16 h-16 flex-shrink-0">
                                                <img 
                                                    src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url} 
                                                    alt={track.album?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-black font-medium text-lg truncate">
                                                    {track.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm truncate">
                                                    {track.artists?.map(artist => artist.name).join(', ')}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {track.appearances?.map((appearance, i) => (
                                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1">
                                                            #{appearance.position} in {timeRangeLabels[appearance.timeRange]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="text-lg font-medium text-black">
                                                    {Math.round(track.aggregatedScore)}
                                                </div>
                                                <div className="text-xs text-gray-500">score</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Rankings based on your listening patterns across 4 weeks, 6 months, and all-time data
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Spotify Playlist Embed */}
                    <div className="border border-gray-200 p-8">
                        <h2 className="text-2xl font-light text-black mb-8 text-center">Your Ultimate Vibe Playlist</h2>
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
                                    height="400"
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

            {/* Payment Gate Modal */}
            {showPaymentGate && user && (
                <PaymentGate
                    onSuccess={() => {
                        setShowPaymentGate(false);
                        createUltimatePlaylist(true); // Bypass payment check after successful payment
                    }}
                    onClose={() => setShowPaymentGate(false)}
                    remainingUses={getUsageStats(user.id).remaining}
                />
            )}
        </div>
    );
}