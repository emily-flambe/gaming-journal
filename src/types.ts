// Environment bindings for Cloudflare Workers
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  RAWG_API_KEY: string;
}

// User model
export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  google_id: string | null;
  is_public: boolean;
  created_at: number;
  updated_at: number;
}

// Game model (cached from RAWG)
export interface Game {
  id: number;
  name: string;
  slug: string | null;
  cover_url: string | null;
  release_date: string | null;
  metacritic: number | null;
  website: string | null;
  genres: string | null;      // JSON array of genre names
  developers: string | null;  // JSON array of developer names
  publishers: string | null;  // JSON array of publisher names
  fetched_at: number;
}

// Game log model
export interface GameLog {
  id: string;
  user_id: string;
  game_id: number | null;
  game_name: string;
  start_date: string | null;
  end_date: string | null;
  rating: number;
  notes: string | null;
  sort_order: number | null;
  created_at: number;
  updated_at: number;
}

// Journal entry model
export interface JournalEntry {
  id: string;
  game_log_id: string;
  content: string;
  created_at: number;
  updated_at: number;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code: string } | null;
}

// Auth context
export interface AuthContext {
  userId: string;
  user?: User;
}
