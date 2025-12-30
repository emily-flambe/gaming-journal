// Auth API routes
import { Hono } from 'hono';
import type { Env, User } from '../types';
import {
  createToken,
  generateId,
  generateStateToken,
  createSessionCookie,
  clearSessionCookie,
  getSessionFromCookie,
  verifyToken,
} from '../lib/auth';
import {
  getGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
  GoogleOAuthConfig,
} from '../lib/oauth/google';
import {
  getDiscordAuthUrl,
  exchangeDiscordCode,
  getDiscordUserInfo,
  getDiscordAvatarUrl,
  DiscordOAuthConfig,
} from '../lib/oauth/discord';

const auth = new Hono<{ Bindings: Env }>();

// Store state tokens temporarily (in production, use KV or D1)
const stateTokens = new Map<string, { provider: string; expires: number }>();

// Clean up expired state tokens
function cleanupStateTokens() {
  const now = Date.now();
  for (const [key, value] of stateTokens.entries()) {
    if (value.expires < now) {
      stateTokens.delete(key);
    }
  }
}

// Helper to get base URL from request
function getBaseUrl(c: any): string {
  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}`;
}

// Generate username from email
function generateUsername(email: string): string {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

// GET /api/auth/google - Initiate Google OAuth
auth.get('/google', (c) => {
  cleanupStateTokens();

  const state = generateStateToken();
  stateTokens.set(state, { provider: 'google', expires: Date.now() + 10 * 60 * 1000 }); // 10 min

  const config: GoogleOAuthConfig = {
    clientId: c.env.GOOGLE_CLIENT_ID,
    clientSecret: c.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${getBaseUrl(c)}/api/auth/google/callback`,
  };

  const authUrl = getGoogleAuthUrl(config, state);
  return c.redirect(authUrl);
});

// GET /api/auth/google/callback - Handle Google OAuth callback
auth.get('/google/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code || !state) {
    return c.redirect('/login?error=missing_params');
  }

  const stateData = stateTokens.get(state);
  if (!stateData || stateData.provider !== 'google' || stateData.expires < Date.now()) {
    return c.redirect('/login?error=invalid_state');
  }
  stateTokens.delete(state);

  try {
    const config: GoogleOAuthConfig = {
      clientId: c.env.GOOGLE_CLIENT_ID,
      clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${getBaseUrl(c)}/api/auth/google/callback`,
    };

    const tokens = await exchangeGoogleCode(code, config);
    const userInfo = await getGoogleUserInfo(tokens.access_token);

    if (!userInfo.email_verified) {
      return c.redirect('/login?error=email_not_verified');
    }

    // Check if user exists by Google ID or email
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE google_id = ? OR email = ?'
    ).bind(userInfo.sub, userInfo.email).first<User>();

    if (user) {
      // Update Google ID if not set (account linking)
      if (!user.google_id) {
        await c.env.DB.prepare(
          'UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), updated_at = unixepoch() WHERE id = ?'
        ).bind(userInfo.sub, userInfo.picture, user.id).run();
      }
    } else {
      // Create new user
      const userId = generateId();
      const username = generateUsername(userInfo.email);

      await c.env.DB.prepare(`
        INSERT INTO users (id, username, email, display_name, avatar_url, google_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(userId, username, userInfo.email, userInfo.name, userInfo.picture, userInfo.sub).run();

      user = { id: userId, username, email: userInfo.email } as User;
    }

    // Create session token
    const token = await createToken(user.id, c.env.JWT_SECRET);

    // Set cookie and redirect
    c.header('Set-Cookie', createSessionCookie(token));

    // Redirect to settings if username looks auto-generated
    if (user.username.includes('-') && user.username.length < 20) {
      return c.redirect('/settings?setup=true');
    }

    return c.redirect('/timeline');
  } catch (error) {
    console.error('Google OAuth error:', error);
    return c.redirect('/login?error=oauth_failed');
  }
});

// GET /api/auth/discord - Initiate Discord OAuth
auth.get('/discord', (c) => {
  cleanupStateTokens();

  const state = generateStateToken();
  stateTokens.set(state, { provider: 'discord', expires: Date.now() + 10 * 60 * 1000 });

  const config: DiscordOAuthConfig = {
    clientId: c.env.DISCORD_CLIENT_ID,
    clientSecret: c.env.DISCORD_CLIENT_SECRET,
    redirectUri: `${getBaseUrl(c)}/api/auth/discord/callback`,
  };

  const authUrl = getDiscordAuthUrl(config, state);
  return c.redirect(authUrl);
});

// GET /api/auth/discord/callback - Handle Discord OAuth callback
auth.get('/discord/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code || !state) {
    return c.redirect('/login?error=missing_params');
  }

  const stateData = stateTokens.get(state);
  if (!stateData || stateData.provider !== 'discord' || stateData.expires < Date.now()) {
    return c.redirect('/login?error=invalid_state');
  }
  stateTokens.delete(state);

  try {
    const config: DiscordOAuthConfig = {
      clientId: c.env.DISCORD_CLIENT_ID,
      clientSecret: c.env.DISCORD_CLIENT_SECRET,
      redirectUri: `${getBaseUrl(c)}/api/auth/discord/callback`,
    };

    const tokens = await exchangeDiscordCode(code, config);
    const userInfo = await getDiscordUserInfo(tokens.access_token);

    if (!userInfo.verified) {
      return c.redirect('/login?error=email_not_verified');
    }

    // Check if user exists by Discord ID or email
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE discord_id = ? OR email = ?'
    ).bind(userInfo.id, userInfo.email).first<User>();

    const avatarUrl = getDiscordAvatarUrl(userInfo.id, userInfo.avatar);
    const displayName = userInfo.global_name || userInfo.username;

    if (user) {
      // Update Discord ID if not set (account linking)
      if (!user.discord_id) {
        await c.env.DB.prepare(
          'UPDATE users SET discord_id = ?, avatar_url = COALESCE(avatar_url, ?), updated_at = unixepoch() WHERE id = ?'
        ).bind(userInfo.id, avatarUrl, user.id).run();
      }
    } else {
      // Create new user
      const userId = generateId();
      const username = generateUsername(userInfo.email);

      await c.env.DB.prepare(`
        INSERT INTO users (id, username, email, display_name, avatar_url, discord_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(userId, username, userInfo.email, displayName, avatarUrl, userInfo.id).run();

      user = { id: userId, username, email: userInfo.email } as User;
    }

    // Create session token
    const token = await createToken(user.id, c.env.JWT_SECRET);

    // Set cookie and redirect
    c.header('Set-Cookie', createSessionCookie(token));

    // Redirect to settings if username looks auto-generated
    if (user.username.includes('-') && user.username.length < 20) {
      return c.redirect('/settings?setup=true');
    }

    return c.redirect('/timeline');
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return c.redirect('/login?error=oauth_failed');
  }
});

// POST /api/auth/logout - Clear session
auth.post('/logout', (c) => {
  c.header('Set-Cookie', clearSessionCookie());
  return c.json({ data: { success: true }, error: null });
});

// GET /api/auth/me - Get current user
auth.get('/me', async (c) => {
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

  const user = await c.env.DB.prepare(
    'SELECT id, username, email, display_name, avatar_url, is_public, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first();

  if (!user) {
    return c.json({
      data: null,
      error: { message: 'User not found', code: 'USER_NOT_FOUND' }
    }, 401);
  }

  return c.json({ data: user, error: null });
});

export default auth;
