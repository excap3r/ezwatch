import { getEpisodesFromDb, saveEpisodestoDb } from '@/lib/db';
import { getEpisodes } from '@/lib/services/csfd';
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
      const cachedEpisodes = await getEpisodesFromDb(id);
      if (cachedEpisodes.length > 0) {
        return Response.json(cachedEpisodes);
      }
    }

    // Pokud nemáme v DB nebo máme refresh, načteme z CSFD
    const episodes = await getEpisodes(id);
    
    // Uložíme do DB
    await saveEpisodestoDb(id, episodes);
    
    return Response.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return new Response('Failed to fetch episode details', { status: 500 });
  }
} 