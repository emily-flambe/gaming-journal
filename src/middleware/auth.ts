// Auth middleware for protected routes
import { Context, Next } from 'hono';
import type { Env, User } from '../types';
import { verifyToken, getSessionFromCookie } from '../lib/auth';

// Extended context with auth info
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    user: User;
  }
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const cookieHeader = c.req.header('Cookie');
  const token = getSessionFromCookie(cookieHeader);

  if (!token) {
    return c.json({
      data: null,
      error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
    }, 401);
  }

  const payload = await verifyToken(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({
      data: null,
      error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' }
    }, 401);
  }

  // Fetch user from database
  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(payload.userId).first<User>();

  if (!user) {
    return c.json({
      data: null,
      error: { message: 'User not found', code: 'USER_NOT_FOUND' }
    }, 401);
  }

  // Set user info in context
  c.set('userId', payload.userId);
  c.set('user', user);

  await next();
}

// Admin-only middleware - must be used after authMiddleware
export async function adminMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user');

  if (!user || !user.is_admin) {
    return c.json({
      data: null,
      error: { message: 'Admin access required', code: 'FORBIDDEN' }
    }, 403);
  }

  await next();
}

// Optional auth - doesn't fail if not authenticated
export async function optionalAuthMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const cookieHeader = c.req.header('Cookie');
  const token = getSessionFromCookie(cookieHeader);

  if (token) {
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (payload) {
      const user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(payload.userId).first<User>();

      if (user) {
        c.set('userId', payload.userId);
        c.set('user', user);
      }
    }
  }

  await next();
}
