export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        // In serverless, we don't have sessions to destroy
        // The client should handle clearing localStorage
        return res.json({ success: true, message: 'Logged out successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
}