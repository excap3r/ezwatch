'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Movie } from '@/lib/types'
import { Play, Tv } from 'lucide-react'

interface MovieCardProps {
  movie: Movie
  onSelect: (movie: Movie) => void
}

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <Card className="bg-gray-800 hover:bg-gray-700 transition-colors duration-200 h-full flex flex-col">
      <CardContent className="p-4 flex-grow">
        <div className="aspect-[3/4] mb-4">
          <img 
            src={movie.poster} 
            alt={movie.title} 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-100">
          {movie.title} ({movie.year})
        </h3>
        <p className="text-gray-400">
          {movie.genre} • {movie.director}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button onClick={() => onSelect(movie)} className="w-full">
          {movie.type === 'movie' ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play
            </>
          ) : (
            <>
              <Tv className="h-4 w-4 mr-2" />
              Show Episodes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
