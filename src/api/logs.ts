// Game logs API routes
import { Hono } from 'hono';
import type { Env, GameLog } from '../types';
import { authMiddleware } from '../middleware/auth';
import { generateId, generateSlug } from '../lib/auth';

const logs = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
logs.use('*', authMiddleware);

// Validate date has at least year and month (YYYY-MM or YYYY-MM-DD)
function isValidDate(date: string | null | undefined): boolean {
  if (!date) return false;
  const parts = date.split('-');
  if (parts.length < 2) return false;
  const [year, month] = parts;
  if (!/^\d{4}$/.test(year)) return false;
  if (!/^\d{2}$/.test(month)) return false;
  const monthNum = parseInt(month, 10);
  return monthNum >= 1 && monthNum <= 12;
}

// GET /api/logs - List user's game logs
logs.get('/', async (c) => {
  const userId = c.get('userId');
  const year = c.req.query('year');

  let query = `
    SELECT
      gl.*,
      g.cover_url,
      g.metacritic,
      g.website,
      g.genres,
      g.developers,
      g.publishers,
      (SELECT COUNT(*) FROM journal_entries je WHERE je.game_log_id = gl.id) as journal_count,
      (SELECT MAX(created_at) FROM journal_entries je WHERE je.game_log_id = gl.id) as latest_entry_at,
      (SELECT json_group_array(json_object('rating', je.rating, 'created_at', je.created_at))
       FROM journal_entries je WHERE je.game_log_id = gl.id AND je.rating IS NOT NULL
       ORDER BY je.created_at ASC) as ratings_history
    FROM game_logs gl
    LEFT JOIN games g ON gl.game_id = g.id
    WHERE gl.user_id = ?
  `;
  const params: any[] = [userId];

  if (year) {
    query += ` AND (gl.start_date LIKE ? OR (gl.start_date IS NULL AND gl.end_date LIKE ?))`;
    params.push(`${year}-%`, `${year}-%`);
  }

  query += ` ORDER BY COALESCE(gl.start_date, gl.end_date) DESC`;

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ data: result.results, error: null });
});

// POST /api/logs - Create new game log
logs.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const { game_id, game_name, start_date, end_date, rating, notes } = body;

  if (!game_name) {
    return c.json({
      data: null,
      error: { message: 'game_name is required', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  if (rating !== undefined && rating !== null && (rating < 0 || rating > 10)) {
    return c.json({
      data: null,
      error: { message: 'rating must be between 0 and 10', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  // Default to current year-month if no start_date provided
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const finalStartDate = start_date || currentYearMonth;

  // Validate start_date has year and month
  if (!isValidDate(finalStartDate)) {
    return c.json({
      data: null,
      error: { message: 'start_date must have year and month (YYYY-MM or YYYY-MM-DD)', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  // Validate end_date if provided
  if (end_date && !isValidDate(end_date)) {
    return c.json({
      data: null,
      error: { message: 'end_date must have year and month (YYYY-MM or YYYY-MM-DD)', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  const finalEndDate = end_date || null;
  const finalRating = rating ?? 5;

  // Get next sort_order
  const maxOrder = await c.env.DB.prepare(
    'SELECT MAX(sort_order) as max_order FROM game_logs WHERE user_id = ?'
  ).bind(userId).first<{ max_order: number | null }>();

  const sortOrder = (maxOrder?.max_order ?? 0) + 1;
  const id = generateId();
  const slug = generateSlug(game_name);

  await c.env.DB.prepare(`
    INSERT INTO game_logs (id, user_id, game_id, game_name, slug, start_date, end_date, rating, notes, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, userId, game_id || null, game_name, slug, finalStartDate, finalEndDate, finalRating, notes || null, sortOrder).run();

  const log = await c.env.DB.prepare(
    'SELECT * FROM game_logs WHERE id = ?'
  ).bind(id).first();

  return c.json({ data: log, error: null }, 201);
});

// GET /api/logs/:id - Get single game log
logs.get('/:id', async (c) => {
  const userId = c.get('userId');
  const logId = c.req.param('id');

  const log = await c.env.DB.prepare(`
    SELECT
      gl.*,
      g.cover_url,
      g.metacritic,
      g.website,
      g.genres,
      g.developers,
      g.publishers
    FROM game_logs gl
    LEFT JOIN games g ON gl.game_id = g.id
    WHERE gl.id = ? AND gl.user_id = ?
  `).bind(logId, userId).first();

  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  return c.json({ data: log, error: null });
});

// PATCH /api/logs/:id - Update game log
logs.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const logId = c.req.param('id');
  const body = await c.req.json();

  // Verify ownership
  const existing = await c.env.DB.prepare(
    'SELECT * FROM game_logs WHERE id = ? AND user_id = ?'
  ).bind(logId, userId).first<GameLog>();

  if (!existing) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (body.game_name !== undefined) {
    updates.push('game_name = ?');
    values.push(body.game_name);
  }
  if (body.start_date !== undefined) {
    // start_date is required and must have year+month
    if (!body.start_date || !isValidDate(body.start_date)) {
      return c.json({
        data: null,
        error: { message: 'start_date must have year and month (YYYY-MM or YYYY-MM-DD)', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('start_date = ?');
    values.push(body.start_date);
  }
  if (body.end_date !== undefined) {
    // end_date is optional but if provided must have year+month
    if (body.end_date && !isValidDate(body.end_date)) {
      return c.json({
        data: null,
        error: { message: 'end_date must have year and month (YYYY-MM or YYYY-MM-DD)', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('end_date = ?');
    values.push(body.end_date || null);
  }
  if (body.rating !== undefined) {
    if (body.rating < 0 || body.rating > 10) {
      return c.json({
        data: null,
        error: { message: 'rating must be between 0 and 10', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('rating = ?');
    values.push(body.rating);
  }
  if (body.notes !== undefined) {
    updates.push('notes = ?');
    values.push(body.notes || null);
  }
  if (body.is_public !== undefined) {
    updates.push('is_public = ?');
    values.push(body.is_public ? 1 : 0);
  }

  if (updates.length === 0) {
    return c.json({ data: existing, error: null });
  }

  updates.push('updated_at = unixepoch()');
  values.push(logId, userId);

  await c.env.DB.prepare(`
    UPDATE game_logs SET ${updates.join(', ')} WHERE id = ? AND user_id = ?
  `).bind(...values).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM game_logs WHERE id = ?'
  ).bind(logId).first();

  return c.json({ data: updated, error: null });
});

// DELETE /api/logs/:id - Delete game log
logs.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const logId = c.req.param('id');

  // Verify ownership
  const existing = await c.env.DB.prepare(
    'SELECT id FROM game_logs WHERE id = ? AND user_id = ?'
  ).bind(logId, userId).first();

  if (!existing) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Delete will cascade to journal_entries
  await c.env.DB.prepare(
    'DELETE FROM game_logs WHERE id = ?'
  ).bind(logId).run();

  return c.json({ data: { success: true }, error: null });
});

export default logs;
