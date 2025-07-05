import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import './index.css';

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

interface User {
    id: string;
    display_name: string;
    email: string;
    playlistId?: string;
}

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/user');
                setUser(response.data);
            } catch (error) {
                // User not authenticated, that's okay
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen bg-background">
                <Routes>
                    <Route path="/" element={<Home user={user} setUser={setUser} />} />
                    <Route path="/user/:id" element={<UserProfile />} />
                </Routes>
            </div>
        </Router>
    );
}