import { searchPrehrajto } from '@/lib/services/prehrajto'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = await request.nextUrl.searchParams
  const query = searchParams.get('query')
  const year = searchParams.get('year')
  const refresh = searchParams.get('refresh') === 'true'

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  console.log('Searching Prehraj.to with:', { query, year, refresh });

  try {
    const results = await searchPrehrajto(query, year ? parseInt(year) : undefined)
    console.log('Prehraj.to search results:', results);
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
} 