import { useState } from 'react';
import axios from 'axios';
import { Music } from 'lucide-react';

interface User {
  id: string;
  display_name: string;
  playlistId?: string;
}

interface HomeProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

export default function Home({ user }: HomeProps) {
    const [loading, setLoading] = useState(false);

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

    if (user) {
        window.location.href = `/user/${user.id}`;
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                <div className="flex items-center justify-center mb-8">
                    <Music className="h-16 w-16 text-primary mr-4" />
                    <h1 className="text-5xl font-bold text-foreground">Vibecheck</h1>
                </div>

                <p className="text-xl text-muted-foreground mb-12">
                    Your ultimate playlist from Spotify top tracks
                </p>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-[#1DB954] text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-[#1DB954]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Music className="h-6 w-6" />
                            Connect Spotify
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}