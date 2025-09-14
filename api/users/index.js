import storage from '../lib/storage.js';

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        // Get all users (for directory)
        const userList = storage.getAllUsers();

        return res.json({
            users: userList,
            count: userList.length
        });
    }

    if (req.method === 'DELETE') {
        // Clear all users (admin function)
        const { secret } = req.query;
        
        // Simple admin secret - in production use proper auth
        if (secret !== 'vibecheck_admin_clear') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const deletedCount = storage.clearAllUsers();
        
        return res.json({ 
            message: 'All users deleted', 
            deletedCount 
        });
    }

    res.status(405).json({ error: 'Method not allowed' });
}