# Vibecheck Roadmap & Architecture

## Database Structure

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,  -- Spotify user ID
  display_name VARCHAR(100),
  email VARCHAR(255),
  spotify_id VARCHAR(50) UNIQUE,
  playlist_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location_lat DECIMAL(10, 8) NULL,
  location_lng DECIMAL(11, 8) NULL,
  location_enabled BOOLEAN DEFAULT FALSE,
  profile_public BOOLEAN DEFAULT TRUE
);
```

### Vibes Table (Track Vectors & Analysis)
```sql
CREATE TABLE vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) REFERENCES users(id),
  track_uri VARCHAR(100),
  track_name VARCHAR(255),
  artist_name VARCHAR(255),
  time_range ENUM('short_term', 'medium_term', 'long_term'),
  audio_features JSON,  -- Spotify audio features (danceability, energy, valence, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, track_uri)
);
```

### Compatibility Scores Table
```sql
CREATE TABLE compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id VARCHAR(50) REFERENCES users(id),
  user2_id VARCHAR(50) REFERENCES users(id),
  compatibility_score DECIMAL(5, 2),  -- 0.00 to 100.00
  common_tracks INT,
  total_compared INT,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);
```

### Vibe Shares Table (Tracking shared vibes)
```sql
CREATE TABLE vibe_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) REFERENCES users(id),
  share_url VARCHAR(255),
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  platform VARCHAR(50),  -- 'instagram', 'twitter', 'direct', etc.
  views_count INT DEFAULT 0
);
```

### Notifications/Inbox Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) REFERENCES users(id),
  type VARCHAR(50),  -- 'compatibility_match', 'location_match', 'vibe_share'
  from_user_id VARCHAR(50) REFERENCES users(id),
  message TEXT,
  compatibility_score DECIMAL(5, 2) NULL,
  distance_km DECIMAL(8, 2) NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Structure

### User Management
- `POST /api/users` - Create/update user profile
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id/location` - Update user location
- `PUT /api/users/:id/privacy` - Update privacy settings

### Vibe Analysis
- `POST /api/vibes/analyze/:userId` - Analyze user's tracks and store vectors
- `GET /api/vibes/:userId` - Get user's vibe data
- `POST /api/vibes/compare` - Compare two users' vibes

### Discovery Features
- `GET /api/discovery/nearby` - Find users nearby (if location enabled)
- `GET /api/discovery/compatible` - Find users with high compatibility
- `GET /api/discovery/explore` - Browse public vibes

### Sharing System
- `POST /api/share/create` - Create shareable vibe link
- `GET /api/share/:shareId` - Access shared vibe
- `POST /api/share/track` - Track share views/engagement

## Compatibility Algorithm

### Audio Features Vector Comparison
```javascript
function calculateCompatibility(user1Tracks, user2Tracks) {
  // 1. Extract audio features for each user's tracks
  const user1Features = extractAudioFeatures(user1Tracks);
  const user2Features = extractAudioFeatures(user2Tracks);
  
  // 2. Calculate cosine similarity between feature vectors
  const similarity = cosineSimilarity(user1Features, user2Features);
  
  // 3. Factor in common artists/genres
  const commonArtists = findCommonArtists(user1Tracks, user2Tracks);
  const artistBonus = Math.min(commonArtists * 0.05, 0.2); // Max 20% bonus
  
  // 4. Factor in common tracks
  const commonTracks = findCommonTracks(user1Tracks, user2Tracks);
  const trackBonus = Math.min(commonTracks * 0.1, 0.3); // Max 30% bonus
  
  return Math.min((similarity + artistBonus + trackBonus) * 100, 100);
}
```

## Location-Based Features

### Privacy Controls
- Users opt-in to location sharing
- Configurable radius (1km, 5km, 10km, 25km)
- Ability to pause/resume location visibility

### Matching Logic
```javascript
function findNearbyMatches(userId, radiusKm = 10) {
  return db.query(`
    SELECT u.*, cs.compatibility_score, 
           ST_Distance(u1.location, u2.location) as distance_km
    FROM users u1
    JOIN users u2 ON u2.location_enabled = true 
                  AND u2.id != $1
                  AND ST_DWithin(u1.location, u2.location, $2 * 1000)
    JOIN compatibility_scores cs ON cs.user2_id = u2.id 
                                 AND cs.user1_id = $1
    WHERE u1.id = $1 
      AND cs.compatibility_score > 70
    ORDER BY cs.compatibility_score DESC, distance_km ASC
  `, [userId, radiusKm]);
}
```

## Instagram Story Integration

### Story Template Generation
```javascript
function generateStoryTemplate(user, topTracks) {
  return {
    background: "gradient-to-br from-purple-900 via-pink-900 to-orange-900",
    elements: [
      { type: "title", text: `${user.display_name}'s Vibe`, style: "neon-gradient" },
      { type: "tracks", tracks: topTracks.slice(0, 3) },
      { type: "qr-code", url: `https://vibecheck.style/user/${user.id}` },
      { type: "cta", text: "Check my vibe at vibecheck.style" }
    ]
  };
}
```

## Implementation Phases

### Phase 1: Foundation (Current)
- ✅ OAuth & playlist creation
- ✅ Neon UI design
- ✅ Auto-playlist generation
- ✅ Basic sharing functionality

### Phase 2: Database & Backend
- Set up PostgreSQL database
- Create API endpoints
- Implement user management
- Store vibe data

### Phase 3: Discovery Engine
- Audio feature analysis
- Compatibility algorithm
- User discovery page
- Basic matching system

### Phase 4: Social Features
- Location-based matching
- Notification system
- Enhanced sharing
- Instagram story templates

### Phase 5: Advanced Features
- ML-powered recommendations
- Custom playlist generation
- Social feed
- Premium features

## Tech Stack Recommendations

### Backend
- **Framework**: Node.js with Express or Fastify
- **Database**: PostgreSQL with PostGIS for location features  
- **Auth**: JWT tokens with Spotify OAuth
- **APIs**: Spotify Web API for track analysis

### Frontend Enhancements
- **State Management**: Zustand or Redux Toolkit
- **Maps**: Mapbox for location features
- **Charts**: D3.js for vibe visualizations
- **Sharing**: Web Share API + custom share cards