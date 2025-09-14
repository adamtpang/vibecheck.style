import storage from '../lib/storage.js';

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    if (req.method === 'GET') {
        // Get user by ID
        const user = storage.getUser(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        // Create or update user
        const userData = req.body;
        
        if (!userData.id || userData.id !== id) {
            return res.status(400).json({ error: 'Invalid user data' });
        }

        const updatedUser = storage.setUser(id, userData);
        return res.json(updatedUser);
    }

    res.status(405).json({ error: 'Method not allowed' });
}