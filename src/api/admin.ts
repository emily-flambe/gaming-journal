// Admin API routes
import { Hono } from 'hono';
import type { Env, User } from '../types';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  createToken,
  createSessionCookie,
  createAdminSessionCookie,
  clearAdminSessionCookie,
  getSessionFromCookie,
  getAdminSessionFromCookie,
  verifyToken,
} from '../lib/auth';

const admin = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
admin.use('*', authMiddleware);

// GET /api/admin/users - List all users (admin only)
admin.get('/users', adminMiddleware, async (c) => {
  const users = await c.env.DB.prepare(
    'SELECT id, username, display_name, email, avatar_url FROM users ORDER BY username'
  ).all<Pick<User, 'id' | 'username' | 'display_name' | 'email' | 'avatar_url'>>();

  return c.json({
    data: users.results,
    error: null,
  });
});

// POST /api/admin/impersonate/:userId - Impersonate a user (admin only)
admin.post('/impersonate/:userId', adminMiddleware, async (c) => {
  const targetUserId = c.req.param('userId');
  const cookieHeader = c.req.header('Cookie');
  const currentToken = getSessionFromCookie(cookieHeader);

  if (!currentToken) {
    return c.json({
      data: null,
      error: { message: 'No session found', code: 'NO_SESSION' },
    }, 400);
  }

  // Get target user
  const targetUser = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(targetUserId).first<User>();

  if (!targetUser) {
    return c.json({
      data: null,
      error: { message: 'User not found', code: 'USER_NOT_FOUND' },
    }, 404);
  }

  // Create token for target user
  const newToken = await createToken(targetUserId, c.env.JWT_SECRET);
  const isSecure = c.req.url.startsWith('https');

  // Set the new session cookie and preserve admin session
  c.header('Set-Cookie', createSessionCookie(newToken, isSecure), { append: true });
  c.header('Set-Cookie', createAdminSessionCookie(currentToken, isSecure), { append: true });

  return c.json({
    data: {
      success: true,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        display_name: targetUser.display_name,
        avatar_url: targetUser.avatar_url,
      },
    },
    error: null,
  });
});

// POST /api/admin/stop-impersonation - Stop impersonating and return to admin session
admin.post('/stop-impersonation', async (c) => {
  const cookieHeader = c.req.header('Cookie');
  const adminToken = getAdminSessionFromCookie(cookieHeader);

  if (!adminToken) {
    return c.json({
      data: null,
      error: { message: 'No admin session found', code: 'NO_ADMIN_SESSION' },
    }, 400);
  }

  // Verify the admin token is still valid
  const payload = await verifyToken(adminToken, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({
      data: null,
      error: { message: 'Admin session expired', code: 'SESSION_EXPIRED' },
    }, 401);
  }

  const isSecure = c.req.url.startsWith('https');

  // Restore session cookie from admin_session and clear admin_session
  c.header('Set-Cookie', createSessionCookie(adminToken, isSecure), { append: true });
  c.header('Set-Cookie', clearAdminSessionCookie(isSecure), { append: true });

  return c.json({
    data: { success: true },
    error: null,
  });
});

export default admin;
