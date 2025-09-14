# Serverless Migration Guide

Your app has been converted from a traditional MERN stack to a **serverless architecture** optimized for Vercel deployment.

## What Changed

### Before (MERN Stack):
- `server.js` ran 24/7 on a server
- Express routes handled API calls
- In-memory sessions for user data
- Required persistent server infrastructure

### After (Serverless):
- Individual API functions in `/api` folder
- Functions only run when called (pay-per-request)
- File-based storage for user data
- Auto-scaling and zero-config deployment

## New Architecture

```
/api/
├── users/
│   ├── index.js        # GET /api/users (list all), DELETE /api/users (clear all)
│   └── [id].js         # GET/POST /api/users/{id} (get/update user)
├── lib/
│   └── storage.js      # Simple file-based storage
└── package.json        # API dependencies
```

## API Endpoints

### Get All Users
```bash
GET /api/users
# Returns: { users: [...], count: number }
```

### Get/Update User by ID
```bash
GET /api/users/{userId}
POST /api/users/{userId}
# Body: { id, display_name, playlistId, ... }
```

### Admin: Clear All Users
```bash
DELETE /api/users?secret=vibecheck_admin_clear
# Returns: { message, deletedCount }
```

## Client-Side Changes

1. **Dashboard**: Now fetches real users from API
2. **Admin Panel**: Added refresh/clear functions
3. **UserProfile**: Saves user data to API after playlist creation
4. **User Directory**: Shows last updated times

## Testing Locally

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Run dev server:
```bash
vercel dev
```

3. Test endpoints:
```bash
# List users
curl http://localhost:3000/api/users

# Add a user
curl -X POST http://localhost:3000/api/users/test123 \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","display_name":"Test User"}'

# Clear all users (admin)
curl -X DELETE "http://localhost:3000/api/users?secret=vibecheck_admin_clear"
```

## Deployment

Your `vercel.json` is configured for serverless deployment:

```json
{
  "functions": {
    "api/**/*.js": { "runtime": "nodejs18.x" }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Storage Notes

Currently uses **file-based storage** (`/tmp/users.json`) which works for testing but has limitations:
- Files may be deleted between function calls
- Not suitable for production scale

**For production**, consider upgrading to:
- **Vercel KV** (Redis-compatible)
- **Upstash Redis** 
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)

## Environment Variables

Set these in Vercel dashboard:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET` 
- `SPOTIFY_REDIRECT_URI`

## Benefits

✅ **Zero server maintenance**
✅ **Auto-scaling**
✅ **Pay only for usage**
✅ **Global edge deployment**
✅ **Better performance**
✅ **Easier debugging** (individual function logs)