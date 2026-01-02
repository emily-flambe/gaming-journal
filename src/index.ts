// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

import auth from './api/auth';
import logs from './api/logs';
import journal from './api/journal';
import games from './api/games';
import profile from './api/profile';
import publicTimeline from './api/public';
import admin from './api/admin';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Gaming Journal API is running'
  });
});

// Mount API routes
app.route('/api/auth', auth);
app.route('/api/logs', logs);
app.route('/api/journal', journal);
app.route('/api/games', games);
app.route('/api/profile', profile);
app.route('/api/u', publicTimeline);
app.route('/api/admin', admin);

// 404 handler for API routes
app.notFound(async (c) => {
  // Only return JSON 404 for /api routes
  if (c.req.path.startsWith('/api')) {
    return c.json({ data: null, error: { message: 'Not found', code: 'NOT_FOUND' } }, 404);
  }
  // Serve static assets for non-API routes
  const assets = c.env.ASSETS;
  if (assets) {
    return assets.fetch(c.req.raw);
  }
  return c.notFound();
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    data: null,
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
  }, 500);
});

export default app;
