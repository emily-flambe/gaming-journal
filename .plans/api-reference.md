# Gaming Journal - API Reference

Base URL: `/api`

All responses follow format:
```json
{
  "data": { ... },
  "error": null
}
```
or on error:
```json
{
  "data": null,
  "error": { "message": "Error description", "code": "ERROR_CODE" }
}
```

---

## Authentication

### GET /auth/google
Initiates Google OAuth flow.

**Response:** Redirect to Google

### GET /auth/google/callback
Handles Google OAuth callback.

**Query Params:**
- `code` - Authorization code from Google
- `state` - CSRF token

**Response:** Sets HttpOnly cookie, redirects to `/timeline` or `/settings`

### GET /auth/discord
Initiates Discord OAuth flow.

**Response:** Redirect to Discord

### GET /auth/discord/callback
Handles Discord OAuth callback.

**Query Params:**
- `code` - Authorization code from Discord
- `state` - CSRF token

**Response:** Sets HttpOnly cookie, redirects to `/timeline` or `/settings`

### POST /auth/logout
Clears session.

**Response:**
```json
{ "data": { "success": true } }
```

### GET /auth/me
Returns current authenticated user.

**Response:**
```json
{
  "data": {
    "id": "abc123",
    "username": "bpeterman",
    "email": "bp@example.com",
    "display_name": "Brian Peterman",
    "avatar_url": "https://...",
    "is_public": true
  }
}
```

**Errors:** `401 Unauthorized`

---

## Game Logs

All endpoints require authentication.

### GET /logs
List current user's game logs.

**Query Params:**
- `year` (optional) - Filter by year

**Response:**
```json
{
  "data": [
    {
      "id": "log123",
      "game_id": 3498,
      "game_name": "Grand Theft Auto V",
      "cover_url": "https://...",
      "start_date": "2024-01",
      "end_date": "2024-03",
      "rating": 9,
      "notes": "Amazing open world...",
      "sort_order": 1,
      "created_at": 1704067200,
      "updated_at": 1709251200,
      "journal_count": 5
    }
  ]
}
```

### POST /logs
Create a new game log.

**Body:**
```json
{
  "game_id": 3498,           // optional, null for manual entry
  "game_name": "Grand Theft Auto V",
  "start_date": "2024-01",   // optional
  "end_date": null,          // optional
  "rating": 9,
  "notes": "Starting this classic"
}
```

**Response:** Created game log object

### PATCH /logs/:id
Update a game log.

**Body:** (all fields optional)
```json
{
  "start_date": "2024-01",
  "end_date": "2024-03",
  "rating": 9,
  "notes": "Updated thoughts..."
}
```

**Response:** Updated game log object

### DELETE /logs/:id
Delete a game log and all its journal entries.

**Response:**
```json
{ "data": { "success": true } }
```

### PATCH /logs/reorder
Bulk update sort order.

**Body:**
```json
{
  "updates": [
    { "id": "log123", "sort_order": 1 },
    { "id": "log456", "sort_order": 2 }
  ]
}
```

**Response:**
```json
{ "data": { "success": true } }
```

---

## Journal Entries

All endpoints require authentication.

### GET /logs/:id/journal
List journal entries for a game log.

**Response:**
```json
{
  "data": [
    {
      "id": "entry123",
      "content": "Just finished the first mission...",
      "created_at": 1704067200,
      "updated_at": 1704067200
    }
  ]
}
```

### POST /logs/:id/journal
Add a journal entry.

**Body:**
```json
{
  "content": "Reached Chapter 3 today..."
}
```

**Response:** Created journal entry object

### PATCH /journal/:id
Update a journal entry.

**Body:**
```json
{
  "content": "Updated entry..."
}
```

**Response:** Updated journal entry object

### DELETE /journal/:id
Delete a journal entry.

**Response:**
```json
{ "data": { "success": true } }
```

---

## Game Search

Requires authentication.

### GET /games/search
Search RAWG for games.

**Query Params:**
- `q` - Search query (required)

**Response:**
```json
{
  "data": [
    {
      "id": 3498,
      "name": "Grand Theft Auto V",
      "slug": "grand-theft-auto-v",
      "cover_url": "https://...",
      "release_date": "2013-09-17"
    }
  ]
}
```

### GET /games/:id
Get cached game details.

**Response:**
```json
{
  "data": {
    "id": 3498,
    "name": "Grand Theft Auto V",
    "slug": "grand-theft-auto-v",
    "cover_url": "https://...",
    "release_date": "2013-09-17"
  }
}
```

---

## Profile

Requires authentication.

### GET /profile
Get current user's profile settings.

**Response:**
```json
{
  "data": {
    "username": "bpeterman",
    "display_name": "Brian Peterman",
    "is_public": false
  }
}
```

### PATCH /profile
Update profile settings.

**Body:** (all fields optional)
```json
{
  "username": "newusername",
  "display_name": "New Display Name",
  "is_public": true
}
```

**Response:** Updated profile object

**Errors:**
- `400` - Username already taken
- `400` - Invalid username format (must be alphanumeric + hyphens)

---

## Public Timeline

No authentication required.

### GET /u/:username
Get a user's public timeline.

**Response (if public):**
```json
{
  "data": {
    "user": {
      "username": "bpeterman",
      "display_name": "Brian Peterman",
      "avatar_url": "https://..."
    },
    "logs": [
      {
        "id": "log123",
        "game_name": "Grand Theft Auto V",
        "cover_url": "https://...",
        "start_date": "2024-01",
        "end_date": "2024-03",
        "rating": 9,
        "notes": "Amazing open world..."
      }
    ]
  }
}
```

**Errors:**
- `404` - User not found
- `403` - Timeline is private
