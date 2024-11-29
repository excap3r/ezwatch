export interface Movie {
  id: number
  title: string
  year: number
  type: 'movie' | 'series'
  genre: string
  director: string
  poster: string
  actors?: string[]
  origin?: string
  additionalInfo?: string
  seriesId?: string;
  currentSeries?: number;
  currentEpisode?: number;
}

export interface WatchHistory {
  id: number
  movieId: number
  title: string
  timestamp: string
  lastPlayed: string
  season?: number
  episode?: number
  videoSource?: string
  videoTitle?: string
}

export interface PrehrajtoVideo {
  id: string;
  title: string;
  streamUrl: string;
  thumbnail?: string;
  duration?: string;
  size?: string;
  quality?: string;
}

export interface PrehrajtoSearchResult {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  duration: string;
  size: string;
  quality?: string;
  relevanceScore: number;
}