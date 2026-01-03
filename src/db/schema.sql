-- Gaming Journal D1 Schema
-- Run with: wrangler d1 execute gaming-journal-db --local --file=./src/db/schema.sql

-- Users (created via OAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  google_id TEXT UNIQUE,
  is_public INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Cached game metadata from RAWG
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY,        -- RAWG's ID directly
  name TEXT NOT NULL,
  slug TEXT,
  cover_url TEXT,
  release_date TEXT,             -- 'YYYY-MM-DD'
  metacritic INTEGER,            -- Metacritic score 0-100
  website TEXT,                  -- Official game website
  genres TEXT,                   -- JSON array of genre names
  developers TEXT,               -- JSON array of developer names
  publishers TEXT,               -- JSON array of publisher names
  fetched_at INTEGER DEFAULT (unixepoch())
);

-- User's game log entries
CREATE TABLE IF NOT EXISTS game_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_id INTEGER,               -- FK to games, NULL if manual entry
  game_name TEXT NOT NULL,       -- Denormalized for display
  start_date TEXT,               -- 'YYYY-MM' format, optional
  end_date TEXT,                 -- 'YYYY-MM' format, optional
  rating INTEGER NOT NULL,       -- 1-10
  notes TEXT,                    -- Final summary
  sort_order INTEGER,
  is_public INTEGER DEFAULT 0,   -- 0 = private, 1 = publicly shareable journal
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Journal entries (written while playing)
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  game_log_id TEXT NOT NULL,
  title TEXT,                      -- Entry title (optional)
  content TEXT NOT NULL,           -- Freeform text
  progress TEXT,                   -- Where in the game (chapter, hours, etc.)
  rating INTEGER,                  -- 0-10 rating at this moment (optional)
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (game_log_id) REFERENCES game_logs(id) ON DELETE CASCADE
);

-- Predictions made during gameplay
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL,  -- Entry where prediction was made
  content TEXT NOT NULL,           -- The prediction text
  status TEXT DEFAULT 'open',      -- 'open', 'correct', 'incorrect', 'partially_correct'
  resolution_notes TEXT,           -- Notes about how it resolved
  resolved_at INTEGER,             -- When it was resolved
  resolved_in_entry_id TEXT,       -- Entry where it was resolved (optional)
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_in_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_game_logs_user ON game_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_game_logs_user_date ON game_logs(user_id, end_date);
CREATE INDEX IF NOT EXISTS idx_journal_game_log ON journal_entries(game_log_id);
CREATE INDEX IF NOT EXISTS idx_predictions_entry ON predictions(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
