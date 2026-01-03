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

// GET /api/u/:username/journal/:slug - Get public game log with journal entries
publicTimeline.get('/:username/journal/:slug', async (c) => {
  const username = c.req.param('username').toLowerCase();
  const slug = c.req.param('slug');

  // Find user by username
  const user = await c.env.DB.prepare(
    'SELECT id, username, display_name, avatar_url FROM users WHERE username = ?'
  ).bind(username).first<User>();

  if (!user) {
    return c.json({
      data: null,
      error: { message: 'User not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Fetch the game log and check if it's public (lookup by slug)
  const log = await c.env.DB.prepare(`
    SELECT
      gl.id,
      gl.game_id,
      gl.game_name,
      gl.slug,
      gl.start_date,
      gl.end_date,
      gl.rating,
      gl.notes,
      gl.is_public,
      g.cover_url,
      g.release_date,
      g.metacritic,
      g.website,
      g.genres,
      g.developers,
      g.publishers
    FROM game_logs gl
    LEFT JOIN games g ON gl.game_id = g.id
    WHERE gl.slug = ? AND gl.user_id = ?
  `).bind(slug, user.id).first<any>();

  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Check if this specific journal is public
  if (!log.is_public) {
    return c.json({
      data: null,
      error: { message: 'This journal is private', code: 'PRIVATE' }
    }, 403);
  }

  // Fetch journal entries with all fields
  const entries = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE game_log_id = ? ORDER BY created_at ASC'
  ).bind(log.id).all();

  // Get predictions for all entries
  const entryIds = entries.results.map((e: any) => e.id);
  let predictions: any[] = [];

  if (entryIds.length > 0) {
    const placeholders = entryIds.map(() => '?').join(',');
    predictions = (await c.env.DB.prepare(
      `SELECT * FROM predictions WHERE journal_entry_id IN (${placeholders}) ORDER BY created_at ASC`
    ).bind(...entryIds).all()).results;
  }

  // Attach predictions to entries
  const entriesWithPredictions = entries.results.map((entry: any) => ({
    ...entry,
    predictions: predictions.filter((p: any) => p.journal_entry_id === entry.id)
  }));

  return c.json({
    data: {
      user: {
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
      log,
      entries: entriesWithPredictions,
    },
    error: null
  });
});

export default publicTimeline;
