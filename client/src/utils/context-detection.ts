/**
 * Utility functions for detecting app context and platform
 */

export type AppContext = 'web' | 'farcaster';

/**
 * Detect if running inside Farcaster mini app context
 */
export function detectAppContext(): AppContext {
    // Check for Farcaster SDK presence
    if (typeof window !== 'undefined') {
        // Check for Farcaster parent window or specific URL patterns
        if (window.parent !== window && window.location !== window.parent.location) {
            // We're in an iframe, possibly Farcaster
            try {
                const parentOrigin = window.parent.location.origin;
                if (parentOrigin.includes('farcaster') || parentOrigin.includes('warpcast')) {
                    return 'farcaster';
                }
            } catch (e) {
                // Cross-origin restrictions, check URL params
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('fc') === '1' || urlParams.get('farcaster') === '1') {
                    return 'farcaster';
                }
            }
        }

        // Check for Farcaster SDK globals
        if ('farcasterSDK' in window || 'miniApp' in window) {
            return 'farcaster';
        }
    }

    return 'web';
}

/**
 * Check if user has reached usage limit for Farcaster context
 */
export function hasReachedUsageLimit(userId: string | null): boolean {
    if (!userId) return false;

    const context = detectAppContext();
    if (context === 'web') return false; // No limits for web version

    const storageKey = `fc_usage_${userId}`;
    const usageData = localStorage.getItem(storageKey);

    if (!usageData) return false;

    try {
        const { count, lastReset } = JSON.parse(usageData);
        const now = Date.now();
        const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

        // Reset counter if it's been more than 30 days
        if (daysSinceReset > 30) {
            localStorage.setItem(storageKey, JSON.stringify({ count: 0, lastReset: now }));
            return false;
        }

        return count >= 5; // 5 free vibecheck analyses per month
    } catch {
        return false;
    }
}

/**
 * Increment usage count for Farcaster users
 */
export function incrementUsageCount(userId: string): void {
    const context = detectAppContext();
    if (context === 'web') return; // No tracking for web version

    const storageKey = `fc_usage_${userId}`;
    const usageData = localStorage.getItem(storageKey);
    const now = Date.now();

    if (!usageData) {
        localStorage.setItem(storageKey, JSON.stringify({ count: 1, lastReset: now }));
        return;
    }

    try {
        const { count, lastReset } = JSON.parse(usageData);
        const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

        // Reset if it's been more than 30 days
        if (daysSinceReset > 30) {
            localStorage.setItem(storageKey, JSON.stringify({ count: 1, lastReset: now }));
        } else {
            localStorage.setItem(storageKey, JSON.stringify({ count: count + 1, lastReset }));
        }
    } catch {
        localStorage.setItem(storageKey, JSON.stringify({ count: 1, lastReset: now }));
    }
}

/**
 * Get usage statistics for current user
 */
export function getUsageStats(userId: string | null): { count: number, remaining: number } {
    if (!userId || detectAppContext() === 'web') {
        return { count: 0, remaining: -1 }; // Unlimited for web
    }

    const storageKey = `fc_usage_${userId}`;
    const usageData = localStorage.getItem(storageKey);

    if (!usageData) {
        return { count: 0, remaining: 5 };
    }

    try {
        const { count, lastReset } = JSON.parse(usageData);
        const now = Date.now();
        const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

        // Reset if it's been more than 30 days
        if (daysSinceReset > 30) {
            return { count: 0, remaining: 5 };
        }

        return { count, remaining: Math.max(0, 5 - count) };
    } catch {
        return { count: 0, remaining: 5 };
    }
}