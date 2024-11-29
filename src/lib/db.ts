import { Movie, WatchHistory } from '@/lib/types';
import Database, { RunResult } from 'better-sqlite3';

// Exportujeme instanci databáze
export const db = new Database('database.sqlite')

// Inicializace databáze
db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    year INTEGER,
    genre TEXT,
    director TEXT,
    type TEXT,
    poster TEXT
  );

  CREATE TABLE IF NOT EXISTS watch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movieId INTEGER,
    timestamp TEXT,
    lastPlayed TEXT,
    videoSource TEXT,
    videoTitle TEXT,
    seriesId TEXT,
    seasonNumber INTEGER,
    episodeNumber INTEGER,
    FOREIGN KEY(movieId) REFERENCES movies(id)
  );

  CREATE TABLE IF NOT EXISTS search_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    results TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS series (
    id TEXT PRIMARY KEY,
    movieId INTEGER,
    title TEXT NOT NULL,
    year INTEGER,
    episodeCount INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(movieId) REFERENCES movies(id)
  );

  CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    seriesId TEXT,
    title TEXT NOT NULL,
    seasonNumber INTEGER,
    episodeNumber INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seriesId) REFERENCES series(id)
  );
`)

// Přidání sloupce videoSource, pokud neexistuje
try {
  db.prepare('SELECT videoSource FROM watch_history LIMIT 1').get()
} catch (error) {
  // Sloupec neexistuje, přidáme ho
  db.prepare('ALTER TABLE watch_history ADD COLUMN videoSource TEXT').run()
}

// Přidáme nové sloupce, pokud neexistují
try {
  db.prepare('SELECT seriesId FROM watch_history LIMIT 1').get()
} catch (error) {
  db.prepare('ALTER TABLE watch_history ADD COLUMN seriesId TEXT').run()
}

try {
  db.prepare('SELECT seasonNumber FROM watch_history LIMIT 1').get()
} catch (error) {
  db.prepare('ALTER TABLE watch_history ADD COLUMN seasonNumber INTEGER').run()
}

try {
  db.prepare('SELECT episodeNumber FROM watch_history LIMIT 1').get()
} catch (error) {
  db.prepare('ALTER TABLE watch_history ADD COLUMN episodeNumber INTEGER').run()
}

// Add videoTitle column if it doesn't exist
try {
  db.prepare('SELECT videoTitle FROM watch_history LIMIT 1').get()
} catch (error) {
  // Column doesn't exist, add it
  db.prepare('ALTER TABLE watch_history ADD COLUMN videoTitle TEXT').run()
}

// Interface pro raw data z databáze
interface MovieRow {
  id: number
  title: string
  year: number
  genre: string
  director: string
  type: string
  poster: string
}

interface WatchHistoryRow {
  id: number
  title: string
  timestamp: string
  lastPlayed: string
  season?: number
  episode?: number
}

export function getMovies(): Movie[] {
  const results = db.prepare('SELECT * FROM movies').all() as MovieRow[];
  
  return results.map((row): Movie => ({
    id: row.id,
    title: row.title,
    year: row.year,
    genre: row.genre,
    director: row.director,
    type: row.type as 'movie' | 'series',
    poster: row.poster
  }));
}

export function getMovie(id: number): Movie | undefined {
  const result = db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as MovieRow | undefined;
  
  if (!result) return undefined;
  
  return {
    id: result.id,
    title: result.title,
    year: result.year,
    genre: result.genre,
    director: result.director,
    type: result.type as 'movie' | 'series',
    poster: result.poster
  };
}

export function getWatchHistory(): WatchHistory[] {
  const results = db.prepare(`
    SELECT 
      wh.id,
      wh.movieId,
      m.title,
      wh.timestamp,
      wh.lastPlayed,
      m.type,
      CASE 
        WHEN m.type = 'series' THEN NULL
      END as season,
      CASE 
        WHEN m.type = 'series' THEN NULL
      END as episode
    FROM watch_history wh
    JOIN movies m ON m.id = wh.movieId
    ORDER BY wh.lastPlayed DESC
    LIMIT 10
  `).all() as (WatchHistoryRow & { movieId: number })[];
  
  return results.map((row): WatchHistory => ({
    id: row.id,
    movieId: row.movieId,
    title: row.title,
    timestamp: row.timestamp,
    lastPlayed: row.lastPlayed,
    ...(row.season && { season: row.season }),
    ...(row.episode && { episode: row.episode })
  }));
}

export function addToWatchHistory(movieId: number, timestamp: string, lastPlayed: string): RunResult {
  return db.prepare(`
    INSERT INTO watch_history (movieId, timestamp, lastPlayed)
    VALUES (?, ?, ?)
  `).run(movieId, timestamp, lastPlayed)
}

export async function getSearchResults(query: string) {
  const result = db.prepare(
    'SELECT results FROM search_results WHERE query = ? COLLATE NOCASE ORDER BY timestamp DESC LIMIT 1'
  ).get(query.trim());
  
  if (result) {
    const sourcesData = JSON.parse(result.results);
    
    // Apply the same sorting logic as in useVideoPlayer
    return sourcesData.sort((a, b) => {
      // Helper function to convert size string to bytes
      const getSizeInBytes = (sizeStr: string = ''): number => {
        const value = parseFloat(sizeStr.replace(/[^0-9.]/g, '') || '0')
        const unit = sizeStr.toUpperCase()
        if (unit.includes('GB')) return value * 1024 * 1024 * 1024
        if (unit.includes('MB')) return value * 1024 * 1024
        if (unit.includes('KB')) return value * 1024
        return value
      }

      const sizeA = getSizeInBytes(a.size)
      const sizeB = getSizeInBytes(b.size)
      
      // Sort by size in descending order (largest first)
      return sizeB - sizeA
    });
  }
  return null;
}

export async function saveSearchResults(query: string, results: any[]) {
  db.prepare(
    'INSERT INTO search_results (query, results) VALUES (?, ?)'
  ).run(query, JSON.stringify(results));
}

export async function clearSearchResults(query: string) {
  db.prepare('DELETE FROM search_results WHERE query = ?').run(query);
}

export function ensureMovieExists(movie: Movie): number {
  const existing = db.prepare('SELECT id FROM movies WHERE id = ?').get(movie.id);
  
  if (!existing) {
    const result = db.prepare(`
      INSERT INTO movies (id, title, year, genre, director, type, poster)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      movie.id,
      movie.title,
      movie.year,
      movie.genre,
      movie.director,
      movie.type,
      movie.poster
    );
    return result.lastInsertRowid as number;
  }
  
  return existing.id;
}

// Vyčistíme duplicity v historii - necháme jen nejnovější záznam pro každý film
try {
  db.prepare(`
    DELETE FROM watch_history 
    WHERE id NOT IN (
      SELECT id FROM (
        SELECT id, 
        ROW_NUMBER() OVER (
          PARTITION BY movieId 
          ORDER BY lastPlayed DESC
        ) as rn
        FROM watch_history
      ) ranked 
      WHERE rn = 1
    )
  `).run()
} catch (error) {
  console.error('Failed to clean up watch history duplicates:', error)
}

export async function getSeriesFromDb(movieId: string) {
  return db.prepare(`
    SELECT * FROM series 
    WHERE movieId = ? 
    ORDER BY timestamp DESC
  `).all(movieId);
}

export async function saveSeriestoDb(movieId: string, series: any[]) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO series (id, movieId, title, year, episodeCount)
    VALUES (?, ?, ?, ?, ?)
  `);

  const deletePrevious = db.prepare('DELETE FROM series WHERE movieId = ?');
  
  // Add a check for existing movie
  const movieExists = db.prepare('SELECT 1 FROM movies WHERE id = ?').get(movieId);
  if (!movieExists) {
    throw new Error(`Movie with ID ${movieId} does not exist in the database`);
  }

  db.transaction(() => {
    deletePrevious.run(movieId);
    for (const item of series) {
      stmt.run(item.id, movieId, item.title, item.year, item.episodeCount);
    }
  })();
}

export async function getEpisodesFromDb(seriesId: string) {
  return db.prepare(`
    SELECT * FROM episodes 
    WHERE seriesId = ? 
    ORDER BY seasonNumber, episodeNumber
  `).all(seriesId);
}

export async function saveEpisodestoDb(seriesId: string, episodes: any[]) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO episodes (id, seriesId, title, seasonNumber, episodeNumber)
    VALUES (?, ?, ?, ?, ?)
  `);

  const deletePrevious = db.prepare('DELETE FROM episodes WHERE seriesId = ?');
  
  db.transaction(() => {
    deletePrevious.run(seriesId);
    for (const episode of episodes) {
      stmt.run(
        episode.id,
        seriesId,
        episode.title,
        episode.seasonNumber,
        episode.episodeNumber
      );
    }
  })();
}