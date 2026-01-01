// Games API routes (RAWG integration)
import { Hono } from 'hono';
import type { Env, Game } from '../types';
import { authMiddleware } from '../middleware/auth';

const games = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
games.use('*', authMiddleware);

const RAWG_API_URL = 'https://api.rawg.io/api';

interface RAWGGame {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  metacritic: number | null;
  website: string | null;
  genres: Array<{ id: number; name: string; slug: string }> | null;
  developers: Array<{ id: number; name: string; slug: string }> | null;
  publishers: Array<{ id: number; name: string; slug: string }> | null;
}

interface RAWGSearchResponse {
  count: number;
  results: RAWGGame[];
}

// GET /api/games/search - Search RAWG for games
games.get('/search', async (c) => {
  const query = c.req.query('q');

  if (!query || query.trim().length < 2) {
    return c.json({
      data: null,
      error: { message: 'Search query must be at least 2 characters', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  try {
    const params = new URLSearchParams({
      key: c.env.RAWG_API_KEY,
      search: query,
      search_precise: 'true',
      page_size: '20',
    });

    const response = await fetch(`${RAWG_API_URL}/games?${params}`);

    if (!response.ok) {
      console.error('RAWG API error:', await response.text());
      return c.json({
        data: null,
        error: { message: 'Failed to search games', code: 'EXTERNAL_API_ERROR' }
      }, 502);
    }

    const data: RAWGSearchResponse = await response.json();

    // Transform and cache results
    const results = await Promise.all(
      data.results.map(async (game) => {
        const genres = game.genres ? JSON.stringify(game.genres.map(g => g.name)) : null;
        const developers = game.developers ? JSON.stringify(game.developers.map(d => d.name)) : null;
        const publishers = game.publishers ? JSON.stringify(game.publishers.map(p => p.name)) : null;

        // Cache the game
        await c.env.DB.prepare(`
          INSERT INTO games (id, name, slug, cover_url, release_date, metacritic, website, genres, developers, publishers)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            slug = excluded.slug,
            cover_url = excluded.cover_url,
            release_date = excluded.release_date,
            metacritic = COALESCE(excluded.metacritic, games.metacritic),
            website = COALESCE(excluded.website, games.website),
            genres = COALESCE(excluded.genres, games.genres),
            developers = COALESCE(excluded.developers, games.developers),
            publishers = COALESCE(excluded.publishers, games.publishers),
            fetched_at = unixepoch()
        `).bind(
          game.id,
          game.name,
          game.slug,
          game.background_image,
          game.released,
          game.metacritic,
          game.website,
          genres,
          developers,
          publishers
        ).run();

        return {
          id: game.id,
          name: game.name,
          slug: game.slug,
          cover_url: game.background_image,
          release_date: game.released,
          metacritic: game.metacritic,
          genres,
        };
      })
    );

    return c.json({ data: results, error: null });
  } catch (error) {
    console.error('RAWG search error:', error);
    return c.json({
      data: null,
      error: { message: 'Failed to search games', code: 'EXTERNAL_API_ERROR' }
    }, 502);
  }
});

// GET /api/games/:id - Get cached game details
games.get('/:id', async (c) => {
  const gameId = parseInt(c.req.param('id'), 10);

  if (isNaN(gameId)) {
    return c.json({
      data: null,
      error: { message: 'Invalid game ID', code: 'VALIDATION_ERROR' }
    }, 400);
  }

  // Try to get from cache first
  let game = await c.env.DB.prepare(
    'SELECT * FROM games WHERE id = ?'
  ).bind(gameId).first<Game>();

  if (game) {
    return c.json({ data: game, error: null });
  }

  // Fetch from RAWG if not cached
  try {
    const params = new URLSearchParams({
      key: c.env.RAWG_API_KEY,
    });

    const response = await fetch(`${RAWG_API_URL}/games/${gameId}?${params}`);

    if (!response.ok) {
      if (response.status === 404) {
        return c.json({
          data: null,
          error: { message: 'Game not found', code: 'NOT_FOUND' }
        }, 404);
      }
      return c.json({
        data: null,
        error: { message: 'Failed to fetch game', code: 'EXTERNAL_API_ERROR' }
      }, 502);
    }

    const rawgGame: RAWGGame = await response.json();

    const genres = rawgGame.genres ? JSON.stringify(rawgGame.genres.map(g => g.name)) : null;
    const developers = rawgGame.developers ? JSON.stringify(rawgGame.developers.map(d => d.name)) : null;
    const publishers = rawgGame.publishers ? JSON.stringify(rawgGame.publishers.map(p => p.name)) : null;

    // Cache the game
    await c.env.DB.prepare(`
      INSERT INTO games (id, name, slug, cover_url, release_date, metacritic, website, genres, developers, publishers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        slug = excluded.slug,
        cover_url = excluded.cover_url,
        release_date = excluded.release_date,
        metacritic = excluded.metacritic,
        website = excluded.website,
        genres = excluded.genres,
        developers = excluded.developers,
        publishers = excluded.publishers,
        fetched_at = unixepoch()
    `).bind(
      rawgGame.id,
      rawgGame.name,
      rawgGame.slug,
      rawgGame.background_image,
      rawgGame.released,
      rawgGame.metacritic,
      rawgGame.website,
      genres,
      developers,
      publishers
    ).run();

    game = {
      id: rawgGame.id,
      name: rawgGame.name,
      slug: rawgGame.slug,
      cover_url: rawgGame.background_image,
      release_date: rawgGame.released,
      metacritic: rawgGame.metacritic,
      website: rawgGame.website,
      genres,
      developers,
      publishers,
      fetched_at: Math.floor(Date.now() / 1000),
    };

    return c.json({ data: game, error: null });
  } catch (error) {
    console.error('RAWG fetch error:', error);
    return c.json({
      data: null,
      error: { message: 'Failed to fetch game', code: 'EXTERNAL_API_ERROR' }
    }, 502);
  }
});

export default games;
