import { Movie, PrehrajtoSearchResult, PrehrajtoVideo } from '@/lib/types'

export interface MoviePlayerProps {
  movie: Movie
  onBack: () => void
  initialVideoSource?: string
  initialTimestamp?: string
}

export interface CSFDSeries {
  id: string
  title: string
  year: number
  episodeCount: number
}

export interface CSFDEpisode {
  id: string
  title: string
  seasonNumber: number
  episodeNumber: number
}

export interface VideoState {
  sources: PrehrajtoSearchResult[]
  selectedVideo: PrehrajtoVideo | null
  selectedSource: PrehrajtoSearchResult | null
  isLoading: boolean
  error: string | null
}

export interface SeriesState {
  series: CSFDSeries[]
  selectedSeries: CSFDSeries | null
  isLoading: boolean
  error: string | null
}

export interface EpisodesState {
  episodes: CSFDEpisode[]
  selectedEpisode: CSFDEpisode | null
  isLoading: boolean
  error: string | null
} 