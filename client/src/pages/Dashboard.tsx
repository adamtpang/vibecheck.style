import { useState, useEffect } from 'react';
import { Music, Users, Heart, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface User {
    id: string;
    display_name: string;
    playlistId?: string;
    compatibilityScore?: number;
    distance?: number;
    topGenres?: string[];
    topTracks?: string[];
}

interface DashboardProps {
    currentUser: User | null;
}

// Mock data for now - will be replaced with API calls
const mockUsers: User[] = [
    {
        id: 'user1',
        display_name: 'Alex Chen',
        playlistId: 'playlist1',
        compatibilityScore: 89,
        distance: 2.3,
        topGenres: ['Electronic', 'Indie Pop', 'Synthwave'],
        topTracks: ['Midnight City', 'Electric Feel', 'Time to Dance']
    },
    {
        id: 'user2',
        display_name: 'Sarah Kim',
        playlistId: 'playlist2',
        compatibilityScore: 76,
        distance: 5.1,
        topGenres: ['Hip Hop', 'R&B', 'Neo Soul'],
        topTracks: ['Good 4 U', 'Levitating', 'Blinding Lights']
    },
    {
        id: 'user3',
        display_name: 'Marcus Johnson',
        playlistId: 'playlist3',
        compatibilityScore: 82,
        topGenres: ['Rock', 'Alternative', 'Grunge'],
        topTracks: ['Smells Like Teen Spirit', 'Black', 'Alive']
    },
    {
        id: 'user4',
        display_name: 'Luna Rodriguez',
        playlistId: 'playlist4',
        compatibilityScore: 94,
        distance: 1.2,
        topGenres: ['Indie Rock', 'Dream Pop', 'Shoegaze'],
        topTracks: ['Breathe Me', 'Skinny Love', 'Holocene']
    }
];

export default function Dashboard({ currentUser }: DashboardProps) {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'compatibility' | 'distance' | 'recent'>('compatibility');
    const [showNearbyOnly, setShowNearbyOnly] = useState(false);

    const filteredUsers = users
        .filter(user => 
            user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!showNearbyOnly || (user.distance && user.distance < 10))
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'compatibility':
                    return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
                case 'distance':
                    return (a.distance || 999) - (b.distance || 999);
                case 'recent':
                default:
                    return 0;
            }
        });

    const getCompatibilityColor = (score: number) => {
        if (score >= 90) return 'bg-black text-white';
        if (score >= 80) return 'bg-gray-800 text-white';
        if (score >= 70) return 'bg-gray-600 text-white';
        return 'bg-gray-400 text-white';
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <Users className="h-12 w-12 text-black mr-3" />
                        <h1 className="text-4xl font-bold text-black">
                            Discover Vibes
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg font-light">
                        Explore music vibes from the Vibecheck community
                    </p>
                </div>

                {/* Controls */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="border border-gray-200 p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                                />
                            </div>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 border border-gray-200 text-black focus:outline-none focus:border-black transition-colors"
                            >
                                <option value="compatibility">By Compatibility</option>
                                <option value="distance">By Distance</option>
                                <option value="recent">Recently Active</option>
                            </select>

                            {/* Nearby Toggle */}
                            <label className="flex items-center space-x-2 text-black">
                                <input
                                    type="checkbox"
                                    checked={showNearbyOnly}
                                    onChange={(e) => setShowNearbyOnly(e.target.checked)}
                                    className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                                />
                                <span className="text-sm">Nearby only</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* User Grid */}
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map(user => (
                            <Link
                                key={user.id}
                                to={`/user/${user.id}`}
                                className="group"
                            >
                                <div className="border border-gray-200 p-6 hover:border-black transition-colors duration-200">
                                    
                                    {/* User Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-3">
                                                <Music className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-black text-lg">{user.display_name}</h3>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    {user.distance && (
                                                        <span className="flex items-center">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {user.distance}km away
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Compatibility Score */}
                                        {user.compatibilityScore && (
                                            <div className="text-center">
                                                <div className={`inline-block ${getCompatibilityColor(user.compatibilityScore)} px-3 py-1 text-sm font-medium`}>
                                                    {user.compatibilityScore}%
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">match</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Top Genres */}
                                    {user.topGenres && (
                                        <div className="mb-4">
                                            <p className="text-gray-600 text-sm mb-2">Top Genres:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {user.topGenres.slice(0, 3).map(genre => (
                                                    <span key={genre} className="border border-gray-200 text-gray-600 px-2 py-1 text-xs">
                                                        {genre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Tracks Preview */}
                                    {user.topTracks && (
                                        <div className="mb-4">
                                            <p className="text-gray-600 text-sm mb-2">Currently Vibing:</p>
                                            <div className="space-y-1">
                                                {user.topTracks.slice(0, 2).map(track => (
                                                    <p key={track} className="text-gray-500 text-xs truncate">
                                                        {track}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* View Button */}
                                    <button className="w-full bg-black text-white py-2 text-sm font-medium hover:bg-gray-800 transition-colors duration-200">
                                        View Vibe
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No vibes found matching your search</p>
                        </div>
                    )}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <Link
                        to="/"
                        className="inline-block bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors duration-200"
                    >
                        Create Your Vibe
                    </Link>
                </div>

            </div>
        </div>
    );
}