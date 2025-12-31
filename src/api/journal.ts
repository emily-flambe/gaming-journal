// Journal entries API routes
import { Hono } from 'hono';
import type { Env, JournalEntry, GameLog } from '../types';
import { authMiddleware } from '../middleware/auth';
import { generateId } from '../lib/auth';

const journal = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
journal.use('*', authMiddleware);

// Helper to verify game log ownership
async function verifyLogOwnership(c: any, logId: string): Promise<GameLog | null> {
  const userId = c.get('userId');
  const result = await c.env.DB.prepare(
    'SELECT * FROM game_logs WHERE id = ? AND user_id = ?'
  ).bind(logId, userId).first();
  return result as GameLog | null;
}

// Helper to verify journal entry ownership (via game log)
async function verifyEntryOwnership(c: any, entryId: string): Promise<{ entry: JournalEntry; log: GameLog } | null> {
  const userId = c.get('userId');
  const result = await c.env.DB.prepare(`
    SELECT je.*, gl.user_id as log_user_id
    FROM journal_entries je
    JOIN game_logs gl ON je.game_log_id = gl.id
    WHERE je.id = ? AND gl.user_id = ?
  `).bind(entryId, userId).first() as (JournalEntry & { log_user_id: string }) | null;

  if (!result) return null;

  const { log_user_id, ...entry } = result;
  const log = await c.env.DB.prepare(
    'SELECT * FROM game_logs WHERE id = ?'
  ).bind(entry.game_log_id).first() as GameLog | null;

  return log ? { entry: entry as JournalEntry, log } : null;
}

// GET /api/logs/:logId/journal - List journal entries for a game log
journal.get('/logs/:logId/journal', async (c) => {
  const logId = c.req.param('logId');

  const log = await verifyLogOwnership(c, logId);
  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  const entries = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE game_log_id = ? ORDER BY created_at ASC'
  ).bind(logId).all();

  return c.json({ data: entries.results, error: null });
});

// POST /api/logs/:logId/journal - Add journal entry
journal.post('/logs/:logId/journal', async (c) => {
  const logId = c.req.param('logId');
  const body = await c.req.json();

  const log = await verifyLogOwnership(c, logId);
  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  const { content } = body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return c.json({
      data: null,
      error: { message: 'content is required', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  const id = generateId();

  await c.env.DB.prepare(`
    INSERT INTO journal_entries (id, game_log_id, content)
    VALUES (?, ?, ?)
  `).bind(id, logId, content.trim()).run();

  // Update game log's updated_at
  await c.env.DB.prepare(
    'UPDATE game_logs SET updated_at = unixepoch() WHERE id = ?'
  ).bind(logId).run();

  const entry = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE id = ?'
  ).bind(id).first();

  return c.json({ data: entry, error: null }, 201);
});

// PATCH /api/journal/:id - Update journal entry
journal.patch('/:id', async (c) => {
  const entryId = c.req.param('id');
  const body = await c.req.json();

  const ownership = await verifyEntryOwnership(c, entryId);
  if (!ownership) {
    return c.json({
      data: null,
      error: { message: 'Journal entry not found', code: 'NOT_FOUND' }
    }, 404);
  }

  const { content } = body;

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      return c.json({
        data: null,
        error: { message: 'content cannot be empty', code: 'VALIDATION_ERROR' }
      }, 400);
    }

    await c.env.DB.prepare(
      'UPDATE journal_entries SET content = ?, updated_at = unixepoch() WHERE id = ?'
    ).bind(content.trim(), entryId).run();

    // Update game log's updated_at
    await c.env.DB.prepare(
      'UPDATE game_logs SET updated_at = unixepoch() WHERE id = ?'
    ).bind(ownership.log.id).run();
  }

  const updated = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE id = ?'
  ).bind(entryId).first();

  return c.json({ data: updated, error: null });
});

// DELETE /api/journal/:id - Delete journal entry
journal.delete('/:id', async (c) => {
  const entryId = c.req.param('id');

  const ownership = await verifyEntryOwnership(c, entryId);
  if (!ownership) {
    return c.json({
      data: null,
      error: { message: 'Journal entry not found', code: 'NOT_FOUND' }
    }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM journal_entries WHERE id = ?'
  ).bind(entryId).run();

  // Update game log's updated_at
  await c.env.DB.prepare(
    'UPDATE game_logs SET updated_at = unixepoch() WHERE id = ?'
  ).bind(ownership.log.id).run();

  return c.json({ data: { success: true }, error: null });
});

export default journal;
