// Profile API routes
import { Hono } from 'hono';
import type { Env, User } from '../types';
import { authMiddleware } from '../middleware/auth';

const profile = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
profile.use('*', authMiddleware);

// Username validation
const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;

function isValidUsername(username: string): boolean {
  if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    return false;
  }
  if (!USERNAME_REGEX.test(username)) {
    return false;
  }
  if (username.includes('--')) {
    return false;
  }
  return true;
}

// GET /api/profile - Get current user's profile
profile.get('/', async (c) => {
  const user = c.get('user');

  return c.json({
    data: {
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      is_public: Boolean(user.is_public),
    },
    error: null
  });
});

// PATCH /api/profile - Update profile
profile.patch('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  // Handle username update
  if (body.username !== undefined) {
    const newUsername = body.username.toLowerCase().trim();

    if (!isValidUsername(newUsername)) {
      return c.json({
        data: null,
        error: {
          message: `Username must be ${MIN_USERNAME_LENGTH}-${MAX_USERNAME_LENGTH} characters, lowercase alphanumeric with hyphens (not at start/end)`,
          code: 'INVALID_USERNAME'
        }
      }, 400);
    }

    // Check if username is taken (by another user)
    if (newUsername !== user.username) {
      const existing = await c.env.DB.prepare(
        'SELECT id FROM users WHERE username = ? AND id != ?'
      ).bind(newUsername, user.id).first();

      if (existing) {
        return c.json({
          data: null,
          error: { message: 'Username is already taken', code: 'USERNAME_TAKEN' }
        }, 400);
      }
    }

    updates.push('username = ?');
    values.push(newUsername);
  }

  // Handle display_name update
  if (body.display_name !== undefined) {
    const displayName = body.display_name?.trim() || null;
    if (displayName && displayName.length > 100) {
      return c.json({
        data: null,
        error: { message: 'Display name must be 100 characters or less', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('display_name = ?');
    values.push(displayName);
  }

  // Handle is_public update
  if (body.is_public !== undefined) {
    updates.push('is_public = ?');
    values.push(body.is_public ? 1 : 0);
  }

  if (updates.length === 0) {
    return c.json({
      data: {
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        is_public: Boolean(user.is_public),
      },
      error: null
    });
  }

  updates.push('updated_at = unixepoch()');
  values.push(user.id);

  await c.env.DB.prepare(`
    UPDATE users SET ${updates.join(', ')} WHERE id = ?
  `).bind(...values).run();

  const updated = await c.env.DB.prepare(
    'SELECT username, display_name, avatar_url, is_public FROM users WHERE id = ?'
  ).bind(user.id).first();

  return c.json({
    data: {
      ...updated,
      is_public: Boolean(updated?.is_public),
    },
    error: null
  });
});

export default profile;
