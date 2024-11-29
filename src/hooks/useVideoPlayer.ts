import { Movie, PrehrajtoSearchResult, PrehrajtoVideo } from '@/lib/types'
import { normalizeVideoId, selectBestSource } from '@/lib/video-utils'
import { VideoState } from '@/types/player'
import { useEffect, useRef, useState } from 'react'

export function useVideoPlayer(
  movie: Movie, 
  initialVideoSource?: string,
  episodesState?: EpisodesState,
  seriesState?: SeriesState
) {
  const [state, setState] = useState<VideoState>({
    sources: [],
    selectedVideo: null,
    selectedSource: null,
    isLoading: false,
    error: null
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false)
  const lastSavedTime = useRef(0)

  const fetchVideoSources = async (forceRefresh = false, episodeQuery?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      let searchQuery
      if (episodeQuery) {
        // For series episodes, try a more flexible search pattern
        const match = episodeQuery.match(/^(.*?)\s+S(\d+)E(\d+)/)
        if (match) {
          const [_, title, season, episode] = match
          // Try different search patterns
          searchQuery = [
            episodeQuery, // Original full query
            `${title} ${season}x${episode}`, // Alternative format
            `${title} S${season}E${episode}`, // Standard format
            `${title} ${parseInt(season)}x${parseInt(episode)}`, // Without leading zeros
            `${title} serie ${season} epizoda ${episode}` // Czech format
          ].join('|')
        } else {
          searchQuery = episodeQuery
        }
      } else {
        // If we're refreshing and have a selected episode, use that for the search
        if (forceRefresh && episodesState?.selectedEpisode) {
          const season = episodesState.selectedEpisode.seasonNumber.toString().padStart(2, '0')
          const episode = episodesState.selectedEpisode.episodeNumber.toString().padStart(2, '0')
          searchQuery = `${movie.title} S${season}E${episode}`
        } else {
          searchQuery = movie.title
        }
      }

      const yearParam = movie.type === 'movie' ? `&year=${movie.year}` : ''
      const url = `/api/videos/search?query=${encodeURIComponent(searchQuery)}${yearParam}${forceRefresh ? '&refresh=true' : ''}`
      
      const sourcesResponse = await fetch(url)
      if (!sourcesResponse.ok) {
        throw new Error(`HTTP error! status: ${sourcesResponse.status}`)
      }
      const sourcesData = await sourcesResponse.json()
      
      // Simplified sorting logic - sort only by size
      const sortedSources = sourcesData.sort((a, b) => {
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
      })
      
      setState(prev => ({ ...prev, sources: sortedSources }))
      
      if (initialVideoSource) {
        const initialVideoId = normalizeVideoId(initialVideoSource.split('prehraj.to/')[1])
        const savedSource = sourcesData.find(source => 
          normalizeVideoId(source.link.split('prehraj.to/')[1]) === initialVideoId
        )
        
        if (savedSource) {
          await handleSourceSelect(savedSource, false)
          return
        }
      }
      
      if (!state.selectedVideo && !state.selectedSource) {
        const bestSource = selectBestSource(sourcesData)
        if (bestSource) {
          await handleSourceSelect(bestSource, false)
        }
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load sources'
      }))
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSourceSelect = async (source: PrehrajtoSearchResult, saveToHistoryFlag = true) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const videoId = source.link.split('prehraj.to/')[1]
      if (!videoId) {
        throw new Error('Invalid video source')
      }

      const encodedVideoId = encodeURIComponent(videoId)
      const response = await fetch(`/api/videos/${encodedVideoId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch video stream')
      }

      const videoData = await response.json()
      
      setState(prev => ({ 
        ...prev,
        selectedVideo: videoData,
        selectedSource: source
      }))

      if (saveToHistoryFlag) {
        await saveToHistory(source, videoData)
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load video stream'
      }))
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const initializeFromHistory = async () => {
    try {
      const history = await fetch('/api/history').then(res => res.json())
      const lastWatched = history.find((h: { movieId: number }) => h.movieId === movie.id)
      
      if (lastWatched?.videoSource) {
        const videoId = lastWatched.videoSource.split('prehraj.to/')[1]
        const encodedVideoId = encodeURIComponent(videoId)
        const videoResponse = await fetch(`/api/videos/${encodedVideoId}`)
        
        if (!videoResponse.ok) {
          throw new Error('Failed to fetch video stream')
        }

        const videoData = await videoResponse.json()
        setState(prev => ({ 
          ...prev,
          selectedVideo: videoData
        }))
      }
    } catch (error) {
      console.error('Failed to initialize from history:', error)
    }
  }

  const loadInitialVideo = async () => {
    try {
      const videoId = initialVideoSource?.split('prehraj.to/')[1]
      if (!videoId) return
      
      const encodedVideoId = encodeURIComponent(videoId)
      const videoResponse = await fetch(`/api/videos/${encodedVideoId}`)
      
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video stream')
      }

      const videoData = await videoResponse.json()
      setState(prev => ({ 
        ...prev,
        selectedVideo: videoData
      }))
    } catch (error) {
      console.error('Failed to load initial video:', error)
    }
  }

  const saveToHistory = async (source: PrehrajtoSearchResult, videoData: PrehrajtoVideo) => {
    try {
      const currentTime = videoRef.current?.currentTime || 0
      
      if (hasStartedPlaying) {
        await fetch('/api/history', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieId: movie.id,
            timestamp: currentTime.toString(),
            lastPlayed: new Date().toISOString(),
          }),
        })
      } else {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieId: movie.id,
            videoSource: source.link,
            videoTitle: source.title,
            timestamp: currentTime.toString(),
            lastPlayed: new Date().toISOString(),
            ...(movie.type === 'series' && episodesState?.selectedEpisode && {
              seriesId: seriesState?.selectedSeries?.id,
              seasonNumber: episodesState.selectedEpisode.seasonNumber,
              episodeNumber: episodesState.selectedEpisode.episodeNumber,
            }),
          }),
        })
      }
    } catch (error) {
      console.error('Failed to save to history:', error)
    }
  }

  const saveCurrentTime = async () => {
    if (!videoRef.current || !state.selectedSource) return

    try {
      await fetch('/api/history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id,
          timestamp: videoRef.current.currentTime.toString(),
          videoSource: state.selectedSource.link,
        }),
      })
    } catch (error) {
      console.error('Failed to save current time:', error)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (Math.abs(video.currentTime - lastSavedTime.current) > 5) {
        saveCurrentTime()
        lastSavedTime.current = video.currentTime
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [state.selectedSource])

  return {
    state,
    setState,
    videoRef,
    hasStartedPlaying,
    setHasStartedPlaying,
    fetchVideoSources,
    handleSourceSelect,
    initializeFromHistory,
    loadInitialVideo,
    saveCurrentTime
  }
} 