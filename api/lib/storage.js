// Simple file-based storage for user data
// In production, this should use a database like Vercel KV, Upstash Redis, or Firebase
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_FILE = '/tmp/users.json';

class UserStorage {
    constructor() {
        this.users = this.loadUsers();
    }

    loadUsers() {
        try {
            if (existsSync(DATA_FILE)) {
                const data = readFileSync(DATA_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
        return {};
    }

    saveUsers() {
        try {
            writeFileSync(DATA_FILE, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    }

    getUser(id) {
        return this.users[id] || null;
    }

    setUser(id, userData) {
        this.users[id] = {
            ...this.users[id], // Preserve existing data
            ...userData,       // Update with new data
            lastUpdated: new Date().toISOString()
        };
        this.saveUsers();
        return this.users[id];
    }

    getAllUsers() {
        return Object.values(this.users).map(user => ({
            id: user.id,
            display_name: user.display_name,
            lastUpdated: user.lastUpdated,
            playlistId: user.playlistId,
            // Don't expose sensitive data like tokens
        }));
    }

    clearAllUsers() {
        const count = Object.keys(this.users).length;
        this.users = {};
        this.saveUsers();
        return count;
    }
}

// Export a singleton instance
const storage = new UserStorage();
export default storage;