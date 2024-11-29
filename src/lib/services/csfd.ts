import { load } from 'cheerio';
import { calculateRelevanceScore } from '../utils';

interface CSFDSearchResult {
  id: string;
  title: string;
  year: number;
  type: 'movie' | 'series';
  poster?: string;
  genre?: string;
  director?: string;
  actors?: string[];
  origin?: string;
  additionalInfo?: string;
  relevanceScore?: number;
}

interface CSFDSeries {
  id: string;
  title: string;
  year: number;
  episodeCount: number;
}

interface CSFDEpisode {
  id: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
}

export async function searchCSFD(query: string): Promise<CSFDSearchResult[]> {
  const response = await fetch(`https://www.csfd.cz/hledat/?q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  const html = await response.text();
  const $ = load(html);
  const results: CSFDSearchResult[] = [];
  
  // Parsujeme výsledky vyhledávání
  $('.article.article-poster-50').each((_, element) => {
    const $el = $(element);
    const titleEl = $el.find('.film-title-name');
    const title = titleEl.text().trim();
    
    // Vypočítáme skóre relevance
    const relevanceScore = calculateRelevanceScore(title, query);
    
    // Pokud je skóre příliš nízké, přeskočíme tento výsledek
    if (relevanceScore < 30) return;
    
    const link = titleEl.attr('href');
    
    if (!link) return;
    
    // Základní informace
    const id = link.split('/')[2];
    
    // Rok a typ
    const titleInfo = $el.find('.film-title-info').text();
    const yearMatch = titleInfo.match(/\((\d{4})\)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 0;
    const type = titleInfo.toLowerCase().includes('seriál') ? 'series' : 'movie';
    
    // Obrázek
    const poster = $el.find('img').attr('src');
    const validPoster = poster && !poster.includes('base64') ? 
      poster.startsWith('//') ? 
        `https:${poster.replace(/\/cache\/resized\/.*?\//, '/')}` : 
        poster.replace(/\/cache\/resized\/.*?\//, '/')
      : undefined;
    
    // Žánr a země původu
    const originsAndGenres = $el.find('.film-origins-genres .info').text().split(',');
    const origin = originsAndGenres[0]?.trim();
    const genre = originsAndGenres.slice(1).join(',').trim();
    
    // Režisér a herci
    const creators = $el.find('.film-creators');
    let director = '';
    let actors: string[] = [];
    
    creators.each((_, creatorEl) => {
      const text = $(creatorEl).text();
      if (text.includes('Režie:')) {
        director = text.replace('Režie:', '').trim();
      } else if (text.includes('Hrají:')) {
        actors = text.replace('Hrají:', '')
          .split(',')
          .map(actor => actor.trim())
          .filter(actor => actor.length > 0);
      }
    });
    
    // Dodatečné informace (např. TV film, studentský film, atd.)
    const additionalInfo = titleInfo.replace(/\(\d{4}\)/g, '').trim();
    
    results.push({
      id,
      title,
      year,
      type,
      poster: validPoster,
      genre,
      director,
      actors,
      origin,
      additionalInfo: additionalInfo || undefined,
      relevanceScore
    });
  });
  
  // Seřadíme výsledky podle relevance a vrátíme pouze nejrelevantnější
  return results
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 10); // Omezíme počet výsledků na 10 nejrelevantnějších
}

export async function getSeriesDetails(id: string): Promise<CSFDSeries[]> {
  const response = await fetch(`https://www.csfd.cz/film/${id}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  const html = await response.text();
  const $ = load(html);
  const series: CSFDSeries[] = [];

  // Přidáme console.log pro debugování
  console.log('Fetching series for ID:', id);
  console.log('Found elements:', $('.film-episodes-list ul li').length);

  $('.film-episodes-list ul li').each((_, element) => {
    const $el = $(element);
    const titleEl = $el.find('.film-title-name');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href');
    const yearMatch = $el.find('.film-title-info .info').text().match(/\((\d{4})\)/);
    const episodeCountMatch = $el.find('.film-title-info').text().match(/(\d+)\s+epizod/);
    
    // Přidáme console.log pro každý nalezený element
    console.log('Found series:', {
      title,
      link,
      yearText: $el.find('.film-title-info .info').text(),
      episodeText: $el.find('.film-title-info').text()
    });

    if (link) {
      series.push({
        id: link.split('/').filter(Boolean).pop() || '',
        title,
        year: yearMatch ? parseInt(yearMatch[1]) : 0,
        episodeCount: episodeCountMatch ? parseInt(episodeCountMatch[1]) : 0
      });
    }
  });

  // Pokud nenajdeme žádné série v .film-episodes-list, zkusíme alternativní selektor
  if (series.length === 0) {
    $('.series ul li').each((_, element) => {
      const $el = $(element);
      const titleEl = $el.find('a');
      const title = titleEl.text().trim();
      const link = titleEl.attr('href');
      const yearMatch = $el.text().match(/\((\d{4})\)/);
      const episodeCountMatch = $el.text().match(/(\d+)\s+epizod/);
      
      if (link) {
        series.push({
          id: link.split('/').filter(Boolean).pop() || '',
          title,
          year: yearMatch ? parseInt(yearMatch[1]) : 0,
          episodeCount: episodeCountMatch ? parseInt(episodeCountMatch[1]) : 0
        });
      }
    });
  }

  console.log('Final series array:', series);
  return series;
}

export async function getEpisodes(seriesId: string): Promise<CSFDEpisode[]> {
  const response = await fetch(`https://www.csfd.cz/film/${seriesId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  const html = await response.text();
  const $ = load(html);
  const episodes: CSFDEpisode[] = [];

  $('.film-episodes-list ul li').each((_, element) => {
    const $el = $(element);
    const titleEl = $el.find('.film-title-name');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href');
    const episodeInfo = $el.find('.film-title-info .info').text();
    const episodeMatch = episodeInfo.match(/S(\d+)E(\d+)/);
    
    if (link && episodeMatch) {
      episodes.push({
        id: link.split('/').filter(Boolean).pop() || '',
        title,
        seasonNumber: parseInt(episodeMatch[1]),
        episodeNumber: parseInt(episodeMatch[2])
      });
    }
  });

  return episodes;
} 