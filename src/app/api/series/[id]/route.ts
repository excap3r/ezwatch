import { ensureMovieExists, getSeriesFromDb, saveSeriestoDb } from '@/lib/db';
import { getSeriesDetails } from '@/lib/services/csfd';
import { Movie } from '@/lib/types';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const searchParams = request.nextUrl.searchParams;
    const refresh = searchParams.get('refresh') === 'true';

    // Nejdřív zkusíme načíst z DB, pokud nemáme refresh
    if (!refresh) {
      const cachedSeries = await getSeriesFromDb(id);
      if (cachedSeries.length > 0) {
        return Response.json(cachedSeries);
      }
    }

    // Pokud nemáme v DB nebo máme refresh, načteme z CSFD
    const series = await getSeriesDetails(id);
    
    try {
      // Create a temporary movie record if it doesn't exist
      const movieData: Movie = {
        id: parseInt(id),
        title: series[0]?.title || 'Unknown Title',
        year: series[0]?.year || 0,
        type: 'series',
        genre: '',
        director: '',
        poster: ''
      };
      
      // Ensure the movie exists in the database
      await ensureMovieExists(movieData);
      
      // Now we can safely save the series
      await saveSeriestoDb(id, series);
    } catch (error) {
      console.error('Failed to save series to DB:', error);
      // Even if saving fails, return the fetched series
      return Response.json(series);
    }
    
    return Response.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return new Response('Failed to fetch series details', { status: 500 });
  }
} 