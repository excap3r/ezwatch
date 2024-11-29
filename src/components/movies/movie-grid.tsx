'use client'

import { Button } from '@/components/ui/button'
import { Movie } from '@/lib/types'
import { RefreshCw } from 'lucide-react'
import MovieCard from './movie-card'

interface MovieGridProps {
  movies: Movie[]
  onSelect: (movie: Movie) => void
  onRefresh?: () => void
  onHome?: () => void
  showRefresh?: boolean
  isLoading?: boolean
}

export default function MovieGrid({ 
  movies, 
  onSelect, 
  onRefresh,
  onHome,
  showRefresh = false,
  isLoading = false 
}: MovieGridProps) {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {showRefresh && onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-100"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
