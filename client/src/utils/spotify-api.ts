const CLIENT_ID = 'e4435ec6b82f42189d94e6229acad817';

interface RefreshTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token?: string;
}

/**
 * Refreshes the Spotify access token using the stored refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
        console.error('No refresh token available');
        return null;
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
            }),
        });

        const data: RefreshTokenResponse = await response.json();

        if (data.access_token) {
            // Store the new access token
            localStorage.setItem('access_token', data.access_token);
            
            // Update refresh token if a new one was provided
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            
            // Update expiration time (current time + expires_in seconds - 5 min buffer)
            if (data.expires_in) {
                const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
                localStorage.setItem('token_expires_at', expiresAt.toString());
            }

            console.log('✅ Token refreshed successfully');
            return data.access_token;
        } else {
            console.error('❌ Token refresh failed:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        return null;
    }
}

/**
 * Checks if the current access token is expired or will expire soon
 */
function isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) {
        return false; // If no expiration info, assume it's still valid
    }
    
    return Date.now() >= parseInt(expiresAt);
}

/**
 * Gets a valid access token, refreshing if necessary
 */
async function getValidAccessToken(): Promise<string | null> {
    let accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
        return null;
    }
    
    // If token is expired or will expire soon, refresh it
    if (isTokenExpired()) {
        console.log('🔄 Token expired, refreshing...');
        accessToken = await refreshAccessToken();
    }
    
    return accessToken;
}

/**
 * Makes a Spotify API request with automatic token refresh on 401 errors
 */
export async function spotifyApiRequest(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    let accessToken = await getValidAccessToken();
    
    if (!accessToken) {
        throw new Error('No valid access token available');
    }

    // Add Authorization header
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
    };

    let response = await fetch(url, {
        ...options,
        headers,
    });

    // If we get a 401, try to refresh the token and retry once
    if (response.status === 401) {
        console.log('🔄 Got 401, attempting token refresh...');
        
        accessToken = await refreshAccessToken();
        if (accessToken) {
            // Retry the request with the new token
            const retryHeaders = {
                'Authorization': `Bearer ${accessToken}`,
                ...options.headers,
            };
            
            response = await fetch(url, {
                ...options,
                headers: retryHeaders,
            });
        } else {
            // Refresh failed, clear all tokens and redirect to login
            console.error('❌ Token refresh failed, clearing session');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token_expires_at');
            localStorage.removeItem('user_data');
            window.location.href = '/';
            throw new Error('Authentication failed - please log in again');
        }
    }

    return response;
}

/**
 * Convenience method for making Spotify API GET requests
 */
export async function spotifyApiGet(url: string): Promise<any> {
    const response = await spotifyApiRequest(url);
    return response.json();
}

/**
 * Convenience method for making Spotify API POST requests
 */
export async function spotifyApiPost(url: string, body: any): Promise<any> {
    const response = await spotifyApiRequest(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return response.json();
}