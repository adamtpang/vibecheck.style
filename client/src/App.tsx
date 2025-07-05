import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import './index.css';

// Use relative URLs for production, localhost for development
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
axios.defaults.baseURL = isProduction ? '' : 'http://localhost:3000';
axios.defaults.withCredentials = true;

interface User {
    id: string;
    display_name: string;
    playlistId?: string;
}

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/user');
                setUser(response.data);
            } catch (error) {
                // Not authenticated
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home user={user} setUser={setUser} />} />
                <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
        </Router>
    );
}