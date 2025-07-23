import { spotifyApiGet } from './spotify-api';

export interface AudioFeatures {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    liveness: number;
    loudness: number;
    speechiness: number;
    tempo: number;
    valence: number;
    key: number;
    mode: number;
    time_signature: number;
}

export interface TrackWithFeatures {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    uri: string;
    audio_features: AudioFeatures;
}

export interface VibeProfile {
    userId: string;
    displayName: string;
    tracks: TrackWithFeatures[];
    averageFeatures: AudioFeatures;
    topGenres: string[];
    createdAt: Date;
}

/**
 * Fetches audio features for a list of tracks
 */
export async function getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    try {
        // Spotify API allows up to 100 track IDs per request
        const batches: string[][] = [];
        for (let i = 0; i < trackIds.length; i += 100) {
            batches.push(trackIds.slice(i, i + 100));
        }

        const allFeatures: AudioFeatures[] = [];
        
        for (const batch of batches) {
            const response = await spotifyApiGet(
                `https://api.spotify.com/v1/audio-features?ids=${batch.join(',')}`
            );
            if (response.audio_features) {
                allFeatures.push(...response.audio_features.filter(Boolean));
            }
        }

        return allFeatures;
    } catch (error) {
        console.error('Error fetching audio features:', error);
        return [];
    }
}

/**
 * Creates a comprehensive vibe profile from user's tracks
 */
export async function createVibeProfile(
    userId: string, 
    displayName: string, 
    tracks: any[]
): Promise<VibeProfile> {
    console.log('🧠 Creating vibe profile for', displayName);
    
    // Extract track IDs
    const trackIds = tracks.map(track => track.id).filter(Boolean);
    
    // Get audio features
    const audioFeatures = await getAudioFeatures(trackIds);
    
    // Combine tracks with their audio features
    const tracksWithFeatures: TrackWithFeatures[] = tracks.map((track, index) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        uri: track.uri,
        audio_features: audioFeatures[index] || getDefaultAudioFeatures()
    })).filter(track => track.audio_features);

    // Calculate average audio features (the "vibe vector")
    const averageFeatures = calculateAverageFeatures(
        tracksWithFeatures.map(t => t.audio_features)
    );

    // Extract top genres
    const genres = tracks.flatMap(track => 
        track.artists.flatMap(artist => artist.genres || [])
    );
    const topGenres = getTopGenres(genres);

    const profile: VibeProfile = {
        userId,
        displayName,
        tracks: tracksWithFeatures,
        averageFeatures,
        topGenres,
        createdAt: new Date()
    };

    console.log('✅ Vibe profile created:', {
        tracks: profile.tracks.length,
        topGenres: profile.topGenres,
        averageEnergy: profile.averageFeatures.energy.toFixed(2),
        averageValence: profile.averageFeatures.valence.toFixed(2)
    });

    return profile;
}

/**
 * Calculates compatibility score between two vibe profiles
 */
export function calculateCompatibilityScore(
    profile1: VibeProfile, 
    profile2: VibeProfile
): number {
    console.log(`🤝 Calculating compatibility: ${profile1.displayName} ↔ ${profile2.displayName}`);

    // 1. Audio Features Similarity (70% weight)
    const audioSimilarity = calculateCosineSimilarity(
        profile1.averageFeatures,
        profile2.averageFeatures
    );

    // 2. Genre Overlap (20% weight)
    const genreSimilarity = calculateGenreSimilarity(
        profile1.topGenres,
        profile2.topGenres
    );

    // 3. Common Tracks Bonus (10% weight)
    const trackSimilarity = calculateTrackSimilarity(
        profile1.tracks,
        profile2.tracks
    );

    // Weighted final score
    const finalScore = (
        audioSimilarity * 0.7 +
        genreSimilarity * 0.2 +
        trackSimilarity * 0.1
    ) * 100;

    console.log(`📊 Compatibility breakdown:`, {
        audioSimilarity: (audioSimilarity * 100).toFixed(1) + '%',
        genreSimilarity: (genreSimilarity * 100).toFixed(1) + '%',
        trackSimilarity: (trackSimilarity * 100).toFixed(1) + '%',
        finalScore: finalScore.toFixed(1) + '%'
    });

    return Math.round(finalScore);
}

/**
 * Calculates cosine similarity between two audio feature vectors
 */
function calculateCosineSimilarity(features1: AudioFeatures, features2: AudioFeatures): number {
    // Convert audio features to normalized vectors
    const vector1 = audioFeaturesToVector(features1);
    const vector2 = audioFeaturesToVector(features2);

    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
    }

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    // Return cosine similarity
    return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Converts audio features to a normalized vector for comparison
 */
function audioFeaturesToVector(features: AudioFeatures): number[] {
    return [
        features.acousticness,
        features.danceability,
        features.energy,
        features.instrumentalness,
        features.liveness,
        features.loudness / 60 + 1, // Normalize loudness (-60 to 0 dB)
        features.speechiness,
        features.tempo / 200, // Normalize tempo (typically 0-200 BPM)
        features.valence,
        features.key / 11, // Normalize key (0-11)
        features.mode, // Already 0 or 1
        features.time_signature / 7 // Normalize time signature (typically 3-7)
    ];
}

/**
 * Calculates genre similarity between two genre lists
 */
function calculateGenreSimilarity(genres1: string[], genres2: string[]): number {
    if (genres1.length === 0 && genres2.length === 0) return 1;
    if (genres1.length === 0 || genres2.length === 0) return 0;

    const set1 = new Set(genres1.map(g => g.toLowerCase()));
    const set2 = new Set(genres2.map(g => g.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size; // Jaccard similarity
}

/**
 * Calculates track similarity (common tracks bonus)
 */
function calculateTrackSimilarity(tracks1: TrackWithFeatures[], tracks2: TrackWithFeatures[]): number {
    const uris1 = new Set(tracks1.map(t => t.uri));
    const uris2 = new Set(tracks2.map(t => t.uri));
    
    const commonTracks = [...uris1].filter(uri => uris2.has(uri)).length;
    const totalTracks = Math.max(tracks1.length, tracks2.length);

    return totalTracks > 0 ? commonTracks / totalTracks : 0;
}

/**
 * Calculates average audio features from an array of features
 */
function calculateAverageFeatures(featuresArray: AudioFeatures[]): AudioFeatures {
    if (featuresArray.length === 0) return getDefaultAudioFeatures();

    const sums = featuresArray.reduce((acc, features) => ({
        acousticness: acc.acousticness + features.acousticness,
        danceability: acc.danceability + features.danceability,
        energy: acc.energy + features.energy,
        instrumentalness: acc.instrumentalness + features.instrumentalness,
        liveness: acc.liveness + features.liveness,
        loudness: acc.loudness + features.loudness,
        speechiness: acc.speechiness + features.speechiness,
        tempo: acc.tempo + features.tempo,
        valence: acc.valence + features.valence,
        key: acc.key + features.key,
        mode: acc.mode + features.mode,
        time_signature: acc.time_signature + features.time_signature
    }), getDefaultAudioFeatures());

    const count = featuresArray.length;
    return {
        acousticness: sums.acousticness / count,
        danceability: sums.danceability / count,
        energy: sums.energy / count,
        instrumentalness: sums.instrumentalness / count,
        liveness: sums.liveness / count,
        loudness: sums.loudness / count,
        speechiness: sums.speechiness / count,
        tempo: sums.tempo / count,
        valence: sums.valence / count,
        key: Math.round(sums.key / count),
        mode: Math.round(sums.mode / count),
        time_signature: Math.round(sums.time_signature / count)
    };
}

/**
 * Extracts top genres from a list with frequency counting
 */
function getTopGenres(genres: string[]): string[] {
    const genreCounts: { [key: string]: number } = {};
    
    genres.forEach(genre => {
        const normalizedGenre = genre.toLowerCase().trim();
        genreCounts[normalizedGenre] = (genreCounts[normalizedGenre] || 0) + 1;
    });

    return Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([genre]) => genre);
}

/**
 * Returns default audio features (neutral values)
 */
function getDefaultAudioFeatures(): AudioFeatures {
    return {
        acousticness: 0.5,
        danceability: 0.5,
        energy: 0.5,
        instrumentalness: 0.5,
        liveness: 0.5,
        loudness: -10,
        speechiness: 0.5,
        tempo: 120,
        valence: 0.5,
        key: 5,
        mode: 1,
        time_signature: 4
    };
}

/**
 * Mock function to simulate finding users with compatible vibes
 */
export function findCompatibleUsers(userProfile: VibeProfile, allProfiles: VibeProfile[]): Array<{
    user: VibeProfile;
    compatibilityScore: number;
}> {
    return allProfiles
        .filter(profile => profile.userId !== userProfile.userId)
        .map(profile => ({
            user: profile,
            compatibilityScore: calculateCompatibilityScore(userProfile, profile)
        }))
        .filter(result => result.compatibilityScore >= 70) // Only show 70%+ matches
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}