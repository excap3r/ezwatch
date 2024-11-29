'use client'

import MoviePlayer from '@/components/movies/movie-player'
import { movies } from '@/data/mock-data'
import { notFound, useParams, useRouter } from 'next/navigation'

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const movie = movies.find(m => m.id === Number(params.id))
  
  if (!movie) {
    notFound()
  }

  return (
    <MoviePlayer 
      movie={movie} 
      onBack={() => router.back()}
    />
  )
}
