'use client'

import HistoryGrid from '@/components/history/history-grid'
import Navbar from '@/components/layout/navbar'
import SearchBar from '@/components/layout/search-bar'
import MovieGrid from '@/components/movies/movie-grid'
import MoviePlayer from '@/components/movies/movie-player'
import { Movie, WatchHistory } from '@/lib/types'
import { Suspense, useEffect, useState } from 'react'
import { searchMovies } from './actions/search'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearched, setIsSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([])

  const resetState = () => {
    setSearchQuery('')
    setIsSearched(false)
    setIsLoading(false)
    setMovies([])
    setSelectedMovie(null)
  }

  // Fetch watch history when component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history')
        if (response.ok) {
          const data = await response.json()
          setWatchHistory(data)
        }
      } catch (error) {
        console.error('Failed to fetch watch history:', error)
      }
    }

    fetchHistory()
  }, [selectedMovie]) // Přidáme selectedMovie jako dependency, aby se historie aktualizovala po přehrání

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setIsSearched(!!query.trim())
    
    if (query.trim()) {
      setIsLoading(true)
      setMovies([])
      try {
        const results = await searchMovies(query)
        setMovies(results)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setMovies([])
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setIsSearched(false)
  }

  const handleRefresh = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true)
      setMovies([])
      try {
        const results = await searchMovies(searchQuery, true)
        setMovies(results)
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie)
  }

  const handleContinueWatching = async (item: WatchHistory) => {
    try {
      // Použijeme movieId místo id
      const response = await fetch(`/api/movies/${item.movieId}`)
      if (response.ok) {
        const movie = await response.json()
        setSelectedMovie(movie)
      }
    } catch (error) {
      console.error('Failed to load movie:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbar 
        onClear={() => setSearchQuery('')} 
        onReset={resetState}
      />
      
      <div className="container mx-auto p-4">
        {!selectedMovie ? (
          <>
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} onClear={handleClear} />
            </div>

            {isSearched ? (
              <div className="mb-8">
                <MovieGrid 
                  movies={movies}
                  onSelect={handleSelectMovie}
                  showRefresh={true}
                  onRefresh={handleRefresh}
                  onHome={handleClear}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="mb-8">
                <HistoryGrid 
                  items={watchHistory}
                  onContinue={handleContinueWatching}
                />
              </div>
            )}
          </>
        ) : (
          <Suspense fallback={<div>Loading...</div>}>
            <MoviePlayer 
              movie={selectedMovie}
              onBack={() => setSelectedMovie(null)}
              initialVideoSource={selectedMovie.type === 'series' && !isSearched 
                ? watchHistory.find(h => h.movieId === selectedMovie.id)?.videoSource 
                : undefined}
              initialTimestamp={selectedMovie.type === 'series' && !isSearched 
                ? watchHistory.find(h => h.movieId === selectedMovie.id)?.timestamp 
                : undefined}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}
