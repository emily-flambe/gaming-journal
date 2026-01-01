// Public timeline API routes
import { Hono } from 'hono';
import type { Env, User } from '../types';

const publicTimeline = new Hono<{ Bindings: Env }>();

// GET /api/u/:username - Get public timeline
publicTimeline.get('/:username', async (c) => {
  const username = c.req.param('username').toLowerCase();

  // Find user by username
  const user = await c.env.DB.prepare(
    'SELECT id, username, display_name, avatar_url, is_public FROM users WHERE username = ?'
  ).bind(username).first<User>();

  if (!user) {
    return c.json({
      data: null,
      error: { message: 'User not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Check if timeline is public
  if (!user.is_public) {
    return c.json({
      data: null,
      error: { message: 'This timeline is private', code: 'PRIVATE' }
    }, 403);
  }

  // Fetch game logs with cover art and metadata
  const logs = await c.env.DB.prepare(`
    SELECT
      gl.id,
      gl.game_id,
      gl.game_name,
      gl.start_date,
      gl.end_date,
      gl.rating,
      gl.notes,
      gl.sort_order,
      g.cover_url,
      g.metacritic,
      g.website,
      g.genres,
      g.developers,
      g.publishers
    FROM game_logs gl
    LEFT JOIN games g ON gl.game_id = g.id
    WHERE gl.user_id = ?
    ORDER BY COALESCE(gl.end_date, gl.start_date) DESC, gl.sort_order ASC
  `).bind(user.id).all();

  return c.json({
    data: {
      user: {
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
      logs: logs.results,
    },
    error: null
  });
});

// GET /api/u/:username/:logId - Get public game log with journal entries
publicTimeline.get('/:username/:logId', async (c) => {
  const username = c.req.param('username').toLowerCase();
  const logId = c.req.param('logId');

  // Find user by username
  const user = await c.env.DB.prepare(
    'SELECT id, username, display_name, avatar_url, is_public FROM users WHERE username = ?'
  ).bind(username).first<User>();

  if (!user) {
    return c.json({
      data: null,
      error: { message: 'User not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Check if timeline is public
  if (!user.is_public) {
    return c.json({
      data: null,
      error: { message: 'This timeline is private', code: 'PRIVATE' }
    }, 403);
  }

  // Fetch the game log
  const log = await c.env.DB.prepare(`
    SELECT
      gl.id,
      gl.game_id,
      gl.game_name,
      gl.start_date,
      gl.end_date,
      gl.rating,
      gl.notes,
      g.cover_url,
      g.release_date,
      g.metacritic,
      g.website,
      g.genres,
      g.developers,
      g.publishers
    FROM game_logs gl
    LEFT JOIN games g ON gl.game_id = g.id
    WHERE gl.id = ? AND gl.user_id = ?
  `).bind(logId, user.id).first();

  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Fetch journal entries
  const entries = await c.env.DB.prepare(
    'SELECT id, content, created_at FROM journal_entries WHERE game_log_id = ? ORDER BY created_at ASC'
  ).bind(logId).all();

  return c.json({
    data: {
      user: {
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
      log,
      journal_entries: entries.results,
    },
    error: null
  });
});

export default publicTimeline;
