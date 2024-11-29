'use server'

import { clearSearchResults, getSearchResults, saveSearchResults } from '@/lib/db';
import { searchCSFD } from '@/lib/services/csfd';
import { Movie } from '@/lib/types';

export async function searchMovies(query: string, refresh = false): Promise<Movie[]> {
  if (!query.trim()) return [];

  if (refresh) {
    await clearSearchResults(query);
  }

  // Nejprve zkusíme najít v DB
  let results = await getSearchResults(query);
  
  if (!results) {
    // Pokud nemáme v DB, hledáme na ČSFD
    results = await searchCSFD(query);
    // Uložíme výsledky do DB
    await saveSearchResults(query, results);
  }

  // Převedeme na formát Movie
  return results.map((item): Movie => ({
    id: parseInt(item.id),
    title: item.title,
    year: item.year,
    type: item.type,
    genre: item.genre || '',
    director: item.director || '',
    poster: item.poster || ''
  }));
} 