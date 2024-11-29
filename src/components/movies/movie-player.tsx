'use client'

import { Button } from '@/components/ui/button'
import { useSeriesPlayer } from '@/hooks/useSeriesPlayer'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { MoviePlayerProps } from '@/types/player'
import { useEffect, useState } from 'react'
import { EpisodeGrid } from './episode-grid'
import { EpisodeNavigation } from './episode-navigation'
import { PlayerControls } from './player-controls'
import { SeriesGrid } from './series-grid'
import { VideoPlayer } from './video-player'
import { VideoSourceSelector } from './video-source-selector'

export default function MoviePlayer({ 
  movie, 
  onBack, 
  initialVideoSource, 
  initialTimestamp 
}: MoviePlayerProps) {
  const [isInitializing, setIsInitializing] = useState(true)

  const {
    seriesState,
    episodesState,
    setSeriesState,
    setEpisodesState,
    fetchSeries,
    fetchEpisodes,
    handleSeriesSelect,
    initializeFromHistory: seriesPlayerInitializeFromHistory
  } = useSeriesPlayer(movie.id)

  const {
    state: videoState,
    setState: setVideoState,
    videoRef,
    hasStartedPlaying,
    setHasStartedPlaying,
    fetchVideoSources,
    handleSourceSelect,
    initializeFromHistory,
    loadInitialVideo
  } = useVideoPlayer(movie, initialVideoSource, episodesState, seriesState)

  // Inicializační efekt
  useEffect(() => {
    const initializePlayer = async () => {
      setIsInitializing(true)
      try {
        if (movie.type === 'series') {
          if (initialVideoSource && initialTimestamp) {
            const history = await fetch('/api/history').then(res => res.json())
            const lastWatched = history.find((h: { movieId: number }) => h.movieId === movie.id)
            
            if (lastWatched?.seriesId && lastWatched?.seasonNumber && lastWatched?.episodeNumber) {
              const success = await seriesPlayerInitializeFromHistory(
                lastWatched.seriesId,
                lastWatched.seasonNumber,
                lastWatched.episodeNumber
              )
              if (success) {
                await initializeFromHistory()
                return
              }
            }
          }
          // Pokud inicializace z historie selže nebo nemáme historii, načteme série
          await fetchSeries()
        } else {
          if (initialVideoSource) {
            await loadInitialVideo()
          }
          await fetchVideoSources()
        }
      } catch (error) {
        console.error('Failed to initialize player:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializePlayer()
  }, [movie.id, initialVideoSource, initialTimestamp])

  // Efekt pro načítání zdrojů při změně epizody
  useEffect(() => {
    if (!episodesState.selectedEpisode || movie.type !== 'series') return

    const seasonNumber = episodesState.selectedEpisode.seasonNumber.toString().padStart(2, '0')
    const episodeNumber = episodesState.selectedEpisode.episodeNumber.toString().padStart(2, '0')
    const searchQuery = `${movie.title} S${seasonNumber}E${episodeNumber}`
    
    setVideoState(prev => ({
      ...prev,
      selectedVideo: null,
      selectedSource: null
    }))
    
    fetchVideoSources(false, searchQuery)
  }, [episodesState.selectedEpisode, movie.type, movie.title])

  // Renderovací logika
  const renderContent = () => {
    if (isInitializing) {
      return (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400">Initializing player...</div>
        </div>
      )
    }

    if (videoState.error || seriesState.error || episodesState.error) {
      return (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-red-500 mb-4">
            {videoState.error || seriesState.error || episodesState.error}
          </div>
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        </div>
      )
    }

    if (movie.type === 'series') {
      if (!seriesState.selectedSeries) {
        return <SeriesGrid 
          series={seriesState.series}
          onSelect={handleSeriesSelect}
          onBack={onBack}
          isLoading={seriesState.isLoading}
          error={seriesState.error}
        />
      }

      if (!episodesState.selectedEpisode && seriesState.selectedSeries) {
        return <EpisodeGrid 
          episodes={episodesState.episodes}
          onSelect={episode => setEpisodesState(prev => ({ ...prev, selectedEpisode: episode }))}
          onBack={() => setSeriesState(prev => ({ ...prev, selectedSeries: null }))}
          seriesTitle={seriesState.selectedSeries?.title || ''}
          isLoading={episodesState.isLoading}
          error={episodesState.error}
        />
      }
    }

    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <PlayerControls 
          movie={movie}
          onBack={onBack}
          selectedEpisode={episodesState.selectedEpisode}
          onEpisodeBack={() => {
            setEpisodesState(prev => ({ ...prev, selectedEpisode: null }))
            setVideoState(prev => ({
              ...prev,
              selectedVideo: null,
              selectedSource: null,
              sources: []
            }))
          }}
          onSeriesBack={() => {
            setSeriesState(prev => ({ ...prev, selectedSeries: null }))
            setEpisodesState(prev => ({
              ...prev,
              selectedEpisode: null,
              episodes: []
            }))
            setVideoState(prev => ({
              ...prev,
              selectedVideo: null,
              selectedSource: null,
              sources: []
            }))
          }}
        />
        
        <VideoPlayer 
          videoState={videoState}
          videoRef={videoRef}
          initialTimestamp={initialTimestamp}
          onPlay={() => setHasStartedPlaying(true)}
        />
        
        <VideoSourceSelector 
          sources={videoState.sources}
          isLoading={videoState.isLoading}
          onSelect={source => {
            handleSourceSelect(source, true).catch(error => {
              console.error('Failed to select source:', error)
            })
          }}
          onRefresh={() => fetchVideoSources(true)}
        />
        
        {movie.type === 'series' && episodesState.selectedEpisode && (
          <EpisodeNavigation 
            episodes={episodesState.episodes}
            selectedEpisode={episodesState.selectedEpisode}
            onSelect={episode => {
              setEpisodesState(prev => ({ ...prev, selectedEpisode: episode }))
            }}
          />
        )}
      </div>
    )
  }

  return renderContent()
}
