// Journal entries and predictions API routes
import { Hono } from 'hono';
import type { Env, JournalEntry, GameLog, Prediction, PredictionStatus } from '../types';
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

// Helper to verify prediction ownership (via journal entry -> game log)
async function verifyPredictionOwnership(c: any, predictionId: string): Promise<{ prediction: Prediction; entry: JournalEntry; log: GameLog } | null> {
  const userId = c.get('userId');
  const result = await c.env.DB.prepare(`
    SELECT p.*, gl.user_id as log_user_id
    FROM predictions p
    JOIN journal_entries je ON p.journal_entry_id = je.id
    JOIN game_logs gl ON je.game_log_id = gl.id
    WHERE p.id = ? AND gl.user_id = ?
  `).bind(predictionId, userId).first() as (Prediction & { log_user_id: string }) | null;

  if (!result) return null;

  const { log_user_id, ...prediction } = result;
  const entry = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE id = ?'
  ).bind(prediction.journal_entry_id).first() as JournalEntry | null;

  if (!entry) return null;

  const log = await c.env.DB.prepare(
    'SELECT * FROM game_logs WHERE id = ?'
  ).bind(entry.game_log_id).first() as GameLog | null;

  return log ? { prediction: prediction as Prediction, entry, log } : null;
}

// GET /api/journal/logs/:logId - List journal entries for a game log with predictions
journal.get('/logs/:logId', async (c) => {
  const logId = c.req.param('logId');

  const log = await verifyLogOwnership(c, logId);
  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  // Get entries with their predictions
  const entries = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE game_log_id = ? ORDER BY created_at ASC'
  ).bind(logId).all();

  // Get all predictions for these entries
  const entryIds = entries.results.map((e: any) => e.id);
  let predictions: any[] = [];

  if (entryIds.length > 0) {
    const placeholders = entryIds.map(() => '?').join(',');
    predictions = (await c.env.DB.prepare(
      `SELECT * FROM predictions WHERE journal_entry_id IN (${placeholders}) ORDER BY created_at ASC`
    ).bind(...entryIds).all()).results;
  }

  // Attach predictions to their entries
  const entriesWithPredictions = entries.results.map((entry: any) => ({
    ...entry,
    predictions: predictions.filter((p: any) => p.journal_entry_id === entry.id)
  }));

  return c.json({ data: entriesWithPredictions, error: null });
});

// GET /api/journal/logs/:logId/predictions - Get all open predictions for a game
journal.get('/logs/:logId/predictions', async (c) => {
  const logId = c.req.param('logId');
  const status = c.req.query('status'); // optional filter

  const log = await verifyLogOwnership(c, logId);
  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  let query = `
    SELECT p.*, je.title as entry_title, je.progress as entry_progress
    FROM predictions p
    JOIN journal_entries je ON p.journal_entry_id = je.id
    WHERE je.game_log_id = ?
  `;
  const params: any[] = [logId];

  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }

  query += ' ORDER BY p.created_at ASC';

  const predictions = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ data: predictions.results, error: null });
});

// POST /api/journal/logs/:logId - Add journal entry
journal.post('/logs/:logId', async (c) => {
  const logId = c.req.param('logId');
  const body = await c.req.json();

  const log = await verifyLogOwnership(c, logId);
  if (!log) {
    return c.json({
      data: null,
      error: { message: 'Game log not found', code: 'NOT_FOUND' }
    }, 404);
  }

  const { title, content, progress, rating, entry_date, predictions: newPredictions } = body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return c.json({
      data: null,
      error: { message: 'content is required', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  // Validate rating if provided
  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return c.json({
        data: null,
        error: { message: 'rating must be a number between 0 and 10', code: 'VALIDATION_ERROR' }
      }, 400);
    }
  }

  // Parse entry_date or default to now
  // Append T12:00:00 to avoid timezone issues when parsing date-only strings
  let createdAt: number;
  if (entry_date) {
    createdAt = Math.floor(new Date(entry_date + 'T12:00:00').getTime() / 1000);
  } else {
    createdAt = Math.floor(Date.now() / 1000);
  }

  const entryId = generateId();

  await c.env.DB.prepare(`
    INSERT INTO journal_entries (id, game_log_id, title, content, progress, rating, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    entryId,
    logId,
    title?.trim() || null,
    content.trim(),
    progress?.trim() || null,
    rating ?? null,
    createdAt
  ).run();

  // Create predictions if provided
  const createdPredictions: Prediction[] = [];
  if (newPredictions && Array.isArray(newPredictions)) {
    for (const pred of newPredictions) {
      if (pred.content && typeof pred.content === 'string' && pred.content.trim().length > 0) {
        const predId = generateId();
        await c.env.DB.prepare(`
          INSERT INTO predictions (id, journal_entry_id, content)
          VALUES (?, ?, ?)
        `).bind(predId, entryId, pred.content.trim()).run();

        const created = await c.env.DB.prepare(
          'SELECT * FROM predictions WHERE id = ?'
        ).bind(predId).first() as Prediction;
        createdPredictions.push(created);
      }
    }
  }

  // Update game log's updated_at
  await c.env.DB.prepare(
    'UPDATE game_logs SET updated_at = unixepoch() WHERE id = ?'
  ).bind(logId).run();

  const entry = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE id = ?'
  ).bind(entryId).first();

  return c.json({
    data: { ...entry, predictions: createdPredictions },
    error: null
  }, 201);
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

  const { title, content, progress, rating, entry_date } = body;
  const updates: string[] = [];
  const params: any[] = [];

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title?.trim() || null);
  }

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      return c.json({
        data: null,
        error: { message: 'content cannot be empty', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('content = ?');
    params.push(content.trim());
  }

  if (progress !== undefined) {
    updates.push('progress = ?');
    params.push(progress?.trim() || null);
  }

  if (rating !== undefined) {
    if (rating !== null && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return c.json({
        data: null,
        error: { message: 'rating must be a number between 0 and 10', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('rating = ?');
    params.push(rating);
  }

  if (entry_date !== undefined) {
    // Append T12:00:00 to avoid timezone issues when parsing date-only strings
    const createdAt = Math.floor(new Date(entry_date + 'T12:00:00').getTime() / 1000);
    updates.push('created_at = ?');
    params.push(createdAt);
  }

  if (updates.length > 0) {
    updates.push('updated_at = unixepoch()');
    params.push(entryId);

    await c.env.DB.prepare(
      `UPDATE journal_entries SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();

    // Update game log's updated_at
    await c.env.DB.prepare(
      'UPDATE game_logs SET updated_at = unixepoch() WHERE id = ?'
    ).bind(ownership.log.id).run();
  }

  const updated = await c.env.DB.prepare(
    'SELECT * FROM journal_entries WHERE id = ?'
  ).bind(entryId).first();

  // Get predictions for this entry
  const predictions = await c.env.DB.prepare(
    'SELECT * FROM predictions WHERE journal_entry_id = ? ORDER BY created_at ASC'
  ).bind(entryId).all();

  return c.json({ data: { ...updated, predictions: predictions.results }, error: null });
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

  // Predictions will be cascade deleted
  await c.env.DB.prepare(
    'DELETE FROM journal_entries WHERE id = ?'
  ).bind(entryId).run();

  // Update game log's updated_at
  await c.env.DB.prepare(
    'UPDATE game_logs SET updated_at = unixepoch() WHERE id = ?'
  ).bind(ownership.log.id).run();

  return c.json({ data: { success: true }, error: null });
});

// --- Prediction Routes ---

// POST /api/journal/:entryId/predictions - Add prediction to an entry
journal.post('/:entryId/predictions', async (c) => {
  const entryId = c.req.param('entryId');
  const body = await c.req.json();

  const ownership = await verifyEntryOwnership(c, entryId);
  if (!ownership) {
    return c.json({
      data: null,
      error: { message: 'Journal entry not found', code: 'NOT_FOUND' }
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
    INSERT INTO predictions (id, journal_entry_id, content)
    VALUES (?, ?, ?)
  `).bind(id, entryId, content.trim()).run();

  const prediction = await c.env.DB.prepare(
    'SELECT * FROM predictions WHERE id = ?'
  ).bind(id).first();

  return c.json({ data: prediction, error: null }, 201);
});

// PATCH /api/journal/predictions/:id - Update prediction (including resolution)
journal.patch('/predictions/:id', async (c) => {
  const predictionId = c.req.param('id');
  const body = await c.req.json();

  const ownership = await verifyPredictionOwnership(c, predictionId);
  if (!ownership) {
    return c.json({
      data: null,
      error: { message: 'Prediction not found', code: 'NOT_FOUND' }
    }, 404);
  }

  const { content, status, resolution_notes, resolved_in_entry_id } = body;
  const updates: string[] = [];
  const params: any[] = [];

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      return c.json({
        data: null,
        error: { message: 'content cannot be empty', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('content = ?');
    params.push(content.trim());
  }

  if (status !== undefined) {
    const validStatuses: PredictionStatus[] = ['open', 'correct', 'incorrect', 'partially_correct'];
    if (!validStatuses.includes(status)) {
      return c.json({
        data: null,
        error: { message: 'Invalid status. Must be: open, correct, incorrect, or partially_correct', code: 'VALIDATION_ERROR' }
      }, 400);
    }
    updates.push('status = ?');
    params.push(status);

    // Set resolved_at when status changes from open
    if (status !== 'open' && ownership.prediction.status === 'open') {
      updates.push('resolved_at = unixepoch()');
    } else if (status === 'open') {
      updates.push('resolved_at = NULL');
    }
  }

  if (resolution_notes !== undefined) {
    updates.push('resolution_notes = ?');
    params.push(resolution_notes?.trim() || null);
  }

  if (resolved_in_entry_id !== undefined) {
    // Verify the entry belongs to the same game if provided
    if (resolved_in_entry_id !== null) {
      const resolvingEntry = await verifyEntryOwnership(c, resolved_in_entry_id);
      if (!resolvingEntry || resolvingEntry.log.id !== ownership.log.id) {
        return c.json({
          data: null,
          error: { message: 'resolved_in_entry_id must reference an entry from the same game', code: 'VALIDATION_ERROR' }
        }, 400);
      }
    }
    updates.push('resolved_in_entry_id = ?');
    params.push(resolved_in_entry_id);
  }

  if (updates.length > 0) {
    updates.push('updated_at = unixepoch()');
    params.push(predictionId);

    await c.env.DB.prepare(
      `UPDATE predictions SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();
  }

  const updated = await c.env.DB.prepare(
    'SELECT * FROM predictions WHERE id = ?'
  ).bind(predictionId).first();

  return c.json({ data: updated, error: null });
});

// DELETE /api/journal/predictions/:id - Delete prediction
journal.delete('/predictions/:id', async (c) => {
  const predictionId = c.req.param('id');

  const ownership = await verifyPredictionOwnership(c, predictionId);
  if (!ownership) {
    return c.json({
      data: null,
      error: { message: 'Prediction not found', code: 'NOT_FOUND' }
    }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM predictions WHERE id = ?'
  ).bind(predictionId).run();

  return c.json({ data: { success: true }, error: null });
});

export default journal;
