import { CSFDSeries, EpisodesState, SeriesState } from '@/types/player'
import { useRef, useState } from 'react'

export function useSeriesPlayer(movieId: number) {
  if (!movieId) {
    console.warn('useSeriesPlayer: Invalid movieId provided')
  }

  const [seriesState, setSeriesState] = useState<SeriesState>({
    series: [],
    selectedSeries: null,
    isLoading: false,
    error: null
  })

  const [episodesState, setEpisodesState] = useState<EpisodesState>({
    episodes: [],
    selectedEpisode: null,
    isLoading: false,
    error: null
  })

  const episodesCache = useRef<Record<string, CSFDEpisode[]>>({})

  const fetchSeries = async (refresh = false) => {
    setSeriesState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await fetch(`/api/series/${movieId}${refresh ? '?refresh=true' : ''}`)
      if (!response.ok) throw new Error('Failed to fetch series')
      const data = await response.json()
      setSeriesState(prev => ({ ...prev, series: data }))
    } catch (error) {
      setSeriesState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load series'
      }))
    } finally {
      setSeriesState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const fetchEpisodes = async (seriesId: string, refresh = false) => {
    setEpisodesState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      if (!refresh && episodesCache.current[seriesId]) {
        setEpisodesState(prev => ({ 
          ...prev, 
          episodes: episodesCache.current[seriesId],
          isLoading: false 
        }))
        return
      }

      const response = await fetch(`/api/episodes/${seriesId}${refresh ? '?refresh=true' : ''}`)
      if (!response.ok) throw new Error('Failed to fetch episodes')
      const data = await response.json()
      
      episodesCache.current[seriesId] = data
      setEpisodesState(prev => ({ ...prev, episodes: data }))
    } catch (error) {
      setEpisodesState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load episodes'
      }))
    } finally {
      setEpisodesState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSeriesSelect = async (series: CSFDSeries) => {
    setSeriesState(prev => ({ ...prev, selectedSeries: series }))
    await fetchEpisodes(series.id)
  }

  const initializeFromHistory = async (seriesId?: string, seasonNumber?: number, episodeNumber?: number) => {
    if (!seriesId || !seasonNumber || !episodeNumber) return false

    try {
      // Nejdřív načteme všechny série
      const response = await fetch(`/api/series/${movieId}`)
      if (!response.ok) throw new Error('Failed to fetch series')
      const seriesData = await response.json()
      
      // Nastavíme série a vybereme správnou sérii
      const targetSeries = seriesData.find(s => s.id === seriesId)
      if (!targetSeries) return false

      setSeriesState(prev => ({ 
        ...prev, 
        series: seriesData,
        selectedSeries: targetSeries,
        isLoading: false 
      }))
      
      // Načteme epizody pro tuto sérii
      const episodesResponse = await fetch(`/api/episodes/${seriesId}`)
      if (!episodesResponse.ok) throw new Error('Failed to fetch episodes')
      const episodesData = await episodesResponse.json()
      
      // Najdeme správnou epizodu
      const targetEpisode = episodesData.find(
        e => e.seasonNumber === seasonNumber && e.episodeNumber === episodeNumber
      )
      if (!targetEpisode) return false

      // Nastavíme epizody a vybereme správnou epizodu
      setEpisodesState(prev => ({ 
        ...prev, 
        episodes: episodesData,
        selectedEpisode: targetEpisode,
        isLoading: false 
      }))

      return true
    } catch (error) {
      console.error('Failed to initialize from history:', error)
      return false
    }
  }

  return {
    seriesState,
    episodesState,
    setSeriesState,
    setEpisodesState,
    fetchSeries,
    fetchEpisodes,
    handleSeriesSelect,
    initializeFromHistory
  }
} 