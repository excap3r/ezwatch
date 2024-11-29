import { Movie, WatchHistory } from '@/lib/types'

export const movies: Movie[] = [
  {
    id: 1,
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    type: 'movie',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 2,
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    director: 'Christopher Nolan',
    type: 'movie',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 3,
    title: 'Pulp Fiction',
    year: 1994,
    genre: 'Crime',
    director: 'Quentin Tarantino',
    type: 'movie',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 4,
    title: 'The Matrix',
    year: 1999,
    genre: 'Sci-Fi',
    director: 'The Wachowskis',
    type: 'movie',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 5,
    title: 'Breaking Bad',
    year: 2008,
    genre: 'Drama',
    director: 'Vince Gilligan',
    type: 'series',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 6,
    title: 'Stranger Things',
    year: 2016,
    genre: 'Sci-Fi',
    director: 'The Duffer Brothers',
    type: 'series',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 7,
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    type: 'movie',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 8,
    title: 'The Mandalorian',
    year: 2019,
    genre: 'Sci-Fi',
    director: 'Jon Favreau',
    type: 'series',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 9,
    title: 'Fight Club',
    year: 1999,
    genre: 'Drama',
    director: 'David Fincher',
    type: 'movie',
    poster: '/placeholder.svg?height=400&width=300'
  },
  {
    id: 10,
    title: 'The Office',
    year: 2005,
    genre: 'Comedy',
    director: 'Greg Daniels',
    type: 'series',
    poster: '/placeholder.svg?height=400&width=300'
  }
]

export const recentlyWatched: WatchHistory[] = [
  {
    id: 1,
    title: 'Inception',
    timestamp: '1:23:45',
    lastPlayed: '2024-03-15 20:30'
  },
  {
    id: 5,
    title: 'Breaking Bad',
    timestamp: '45:12',
    lastPlayed: '2024-03-14 19:15',
    season: 1,
    episode: 5
  },
  {
    id: 8,
    title: 'The Mandalorian',
    timestamp: '32:10',
    lastPlayed: '2024-03-13 21:45',
    season: 2,
    episode: 3
  }
]