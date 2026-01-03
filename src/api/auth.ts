// Auth API routes
import { Hono } from 'hono';
import type { Env, User } from '../types';
import {
  createToken,
  generateId,
  generateSlug,
  createSessionCookie,
  clearSessionCookie,
  getSessionFromCookie,
  getAdminSessionFromCookie,
  verifyToken,
} from '../lib/auth';
import {
  getGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
  GoogleOAuthConfig,
} from '../lib/oauth/google';
import { OAuthStateManager } from '../lib/oauth/state';

const auth = new Hono<{ Bindings: Env }>();

// Helper to check if request is over HTTPS (for cookie Secure flag)
// Note: We check the URL protocol, not the Host header, because Wrangler
// dev server rewrites Host header based on custom domain config
function isSecureRequest(c: any): boolean {
  const url = new URL(c.req.url);
  return url.protocol === 'https:';
}

// Generate username from email
function generateUsername(email: string): string {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

// GET /api/auth/google - Initiate Google OAuth
auth.get('/google', async (c) => {
  const stateManager = new OAuthStateManager(c.env.JWT_SECRET);
  const state = await stateManager.createState('google');

  const config: GoogleOAuthConfig = {
    clientId: c.env.GOOGLE_CLIENT_ID,
    clientSecret: c.env.GOOGLE_CLIENT_SECRET,
    redirectUri: c.env.GOOGLE_REDIRECT_URI,
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

  const stateManager = new OAuthStateManager(c.env.JWT_SECRET);
  try {
    await stateManager.verifyState(state, 'google');
  } catch {
    return c.redirect('/login?error=invalid_state');
  }

  try {
    const config: GoogleOAuthConfig = {
      clientId: c.env.GOOGLE_CLIENT_ID,
      clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      redirectUri: c.env.GOOGLE_REDIRECT_URI,
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
    const secure = isSecureRequest(c);
    const cookie = createSessionCookie(token, secure);

    const redirectUrl = '/timeline';

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return c.redirect('/login?error=oauth_failed');
  }
});


// POST /api/auth/logout - Clear session
auth.post('/logout', (c) => {
  const secure = isSecureRequest(c);
  c.header('Set-Cookie', clearSessionCookie(secure));
  return c.json({ data: { success: true }, error: null });
});

// GET /api/auth/dev-login - Development-only login (bypasses OAuth)
// Only available in local development (http) - returns 404 in production (https)
auth.get('/dev-login', async (c) => {
  const url = new URL(c.req.url);
  // In production on Cloudflare, requests are always HTTPS
  // In local wrangler dev, requests are HTTP
  const isLocalDev = url.protocol === 'http:';

  if (!isLocalDev) {
    return c.json({
      data: null,
      error: { message: 'Not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Find or create dev user with seed data
  const devEmail = 'dev@localhost';
  let user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(devEmail).first<User>();

  if (!user) {
    const userId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO users (id, username, email, display_name, is_public)
      VALUES (?, ?, ?, ?, 1)
    `).bind(userId, 'dev-user', devEmail, 'Dev User').run();
    user = { id: userId, username: 'dev-user', email: devEmail } as User;

    // Seed with sample game log and journal entry
    const gameLogId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO game_logs (id, user_id, game_name, slug, start_date, rating, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      gameLogId,
      userId,
      'Final Fantasy XVI',
      'final-fantasy-xvi',
      '2025-01',
      8,
      'Currently playing through the main story.',
      0
    ).run();

    // Add initial journal entry
    const entryId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO journal_entries (id, game_log_id, title, content, progress, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entryId,
      gameLogId,
      'First Impressions',
      'Just started playing. The combat system is really fun and the graphics are stunning. Clive seems like an interesting protagonist.',
      'Prologue',
      8,
      Math.floor(new Date('2025-01-01').getTime() / 1000)
    ).run();

    // Add a prediction
    await c.env.DB.prepare(`
      INSERT INTO predictions (id, journal_entry_id, content)
      VALUES (?, ?, ?)
    `).bind(
      generateId(),
      entryId,
      'I bet Joshua is still alive somehow'
    ).run();

    // Add second FF XVI entry for rating chart
    const entryId2 = generateId();
    await c.env.DB.prepare(`
      INSERT INTO journal_entries (id, game_log_id, title, content, progress, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entryId2,
      gameLogId,
      'Getting Into It',
      'The story is picking up. Combat is still satisfying and I love the Eikon battles.',
      'Chapter 3',
      9,
      Math.floor(new Date('2025-01-15').getTime() / 1000)
    ).run();

    // Seed Clair Obscur: Expedition 33
    const gameLogId2 = generateId();
    await c.env.DB.prepare(`
      INSERT INTO game_logs (id, user_id, game_name, slug, start_date, rating, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      gameLogId2,
      userId,
      'Clair Obscur: Expedition 33',
      'clair-obscur-expedition-33',
      '2025-05',
      9,
      'Beautiful turn-based RPG with real-time elements.',
      1
    ).run();

    const entry3Id = generateId();
    await c.env.DB.prepare(`
      INSERT INTO journal_entries (id, game_log_id, title, content, progress, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entry3Id,
      gameLogId2,
      'Day One',
      'Wow, the art style is incredible. The blend of turn-based and action combat feels fresh.',
      'Tutorial',
      9,
      Math.floor(new Date('2025-05-01').getTime() / 1000)
    ).run();

    await c.env.DB.prepare(`
      INSERT INTO predictions (id, journal_entry_id, content)
      VALUES (?, ?, ?)
    `).bind(
      generateId(),
      entry3Id,
      'The Paintress will turn out to be connected to the main villain'
    ).run();

    // Seed Dispatch
    const gameLogId3 = generateId();
    await c.env.DB.prepare(`
      INSERT INTO game_logs (id, user_id, game_name, slug, start_date, rating, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      gameLogId3,
      userId,
      'Dispatch',
      'dispatch',
      '2025-12',
      7,
      'Interesting puzzle game with a unique communication mechanic.',
      2
    ).run();

    const entry4Id = generateId();
    await c.env.DB.prepare(`
      INSERT INTO journal_entries (id, game_log_id, title, content, progress, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entry4Id,
      gameLogId3,
      'Just Started',
      'The premise is intriguing. Using radio communications to guide explorers through unknown environments.',
      'Mission 1',
      7,
      Math.floor(new Date('2025-12-01').getTime() / 1000)
    ).run();
  }

  // Create session token
  const token = await createToken(user.id, c.env.JWT_SECRET);
  const cookie = createSessionCookie(token, false); // Not secure for localhost

  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/timeline',
      'Set-Cookie': cookie,
    },
  });
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
    'SELECT id, username, email, display_name, avatar_url, is_public, is_admin, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first();

  if (!user) {
    return c.json({
      data: null,
      error: { message: 'User not found', code: 'USER_NOT_FOUND' }
    }, 401);
  }

  // Check if admin is impersonating (admin_session cookie exists)
  const adminToken = getAdminSessionFromCookie(cookieHeader);
  const isImpersonating = !!adminToken;

  return c.json({ data: { ...user, is_impersonating: isImpersonating }, error: null });
});

export default auth;
