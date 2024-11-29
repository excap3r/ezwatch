import { getMovie } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const { id } = params
    
    const movie = getMovie(parseInt(id))
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Failed to fetch movie:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    )
  }
} 