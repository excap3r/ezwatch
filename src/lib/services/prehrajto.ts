import * as cheerio from 'cheerio';
import { PrehrajtoSearchResult, PrehrajtoVideo } from '../types';

/**
 * Search for videos on Prehraj.to
 */
export async function searchPrehrajto(query: string, year?: number): Promise<PrehrajtoSearchResult[]> {
  // Split the query if it contains multiple search patterns
  const queries = query.split('|')
  let allResults: PrehrajtoSearchResult[] = []

  // Search for each query pattern
  for (const searchQuery of queries) {
    const results = await searchWithQuery(searchQuery.trim())
    allResults = [...allResults, ...results]
  }

  // Remove duplicates based on link
  const uniqueResults = allResults.filter((result, index, self) =>
    index === self.findIndex((r) => r.link === result.link)
  )

  // Helper function to normalize size to bytes
  const getSizeInBytes = (sizeStr: string): number => {
    const size = sizeStr.trim()
    const value = parseFloat(size.replace(/[^0-9.]/g, '') || '0')
    
    if (size.toUpperCase().includes('GB')) {
      return value * 1024 * 1024 * 1024
    }
    if (size.toUpperCase().includes('MB')) {
      return value * 1024 * 1024
    }
    if (size.toUpperCase().includes('KB')) {
      return value * 1024
    }
    return value
  }

  // Sort by quality and size
  return uniqueResults.sort((a, b) => {
    const sizeA = getSizeInBytes(a.size)
    const sizeB = getSizeInBytes(b.size)
    
    // If both are HD, sort by size
    if (a.quality === 'HD' && b.quality === 'HD') {
      return sizeB - sizeA
    }
    
    // If only one is HD, prioritize HD
    if (a.quality === 'HD' && b.quality !== 'HD') return -1
    if (a.quality !== 'HD' && b.quality === 'HD') return 1
    
    // If neither is HD, sort by size
    return sizeB - sizeA
  })
}

/**
 * Get video stream URL from Prehraj.to
 */
export async function getVideoStreamUrl(videoPath: string): Promise<PrehrajtoVideo | null> {
  try {
    // První request pro získání stránky s videem
    const response = await fetch(`https://prehraj.to/${videoPath}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'cs-CZ,cs;q=0.9',
        'Referer': 'https://prehraj.to/',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Hledáme URL pro stažení videa
    const downloadUrl = $('a[href*="?do=download"]').attr('href')
    
    if (!downloadUrl) {
      console.error('Download URL not found')
      return null
    }

    // Druhý request pro získání přesměrování na skutečné video
    const downloadResponse = await fetch(`https://prehraj.to${downloadUrl}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'cs-CZ,cs;q=0.9',
        'Referer': `https://prehraj.to/${videoPath}`,
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      },
      redirect: 'follow'
    })

    if (!downloadResponse.ok) {
      throw new Error(`Failed to get video URL: ${downloadResponse.status}`)
    }

    // Získáme finální URL po všech přesměrováních
    const videoUrl = downloadResponse.url

    // Získáme metadata
    const title = $('.video__title').text().trim() || $('h1').first().text().trim()
    const quality = $('.video__tag--format').text().trim()
    const size = $('.video__tag--size').text().trim()
    const duration = $('.video__tag--time').text().trim()
    const thumbnail = $('.video__thumb img').attr('src') || $('.thumb img').attr('src')

    return {
      id: videoPath,
      title: title || '',
      streamUrl: videoUrl,
      thumbnail: thumbnail ? (thumbnail.startsWith('http') ? thumbnail : `https://prehraj.to${thumbnail}`) : undefined,
      duration,
      size,
      quality
    }
  } catch (error) {
    console.error('Error fetching video:', error)
    throw error
  }
} 

// Přidáme funkci pro výpočet relevance
function calculateRelevanceScore(title: string, query: string): number {
  const normalizedTitle = title.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  // Přesná shoda
  if (normalizedTitle === normalizedQuery) return 100;
  
  // Začíná stejně
  if (normalizedTitle.startsWith(normalizedQuery)) return 80;
  
  // Obsahuje celý dotaz jako souvislý řetězec
  if (normalizedTitle.includes(normalizedQuery)) return 60;
  
  // Obsahuje všechna slova z dotazu
  const queryWords = normalizedQuery.split(' ');
  const allWordsPresent = queryWords.every(word => normalizedTitle.includes(word));
  if (allWordsPresent) return 40;
  
  // Obsahuje alespoň některá slova
  const matchingWords = queryWords.filter(word => normalizedTitle.includes(word));
  return (matchingWords.length / queryWords.length) * 20;
} 

// Pomocná funkce pro jednotlivé vyhledávání
async function searchWithQuery(searchQuery: string): Promise<PrehrajtoSearchResult[]> {
  const response = await fetch(`https://prehraj.to/hledej/${encodeURIComponent(searchQuery)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    console.warn(`Search failed for query: ${searchQuery}`);
    return [];
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: PrehrajtoSearchResult[] = [];

  $('.video--link').each((_, element) => {
    const $el = $(element);
    const title = $el.find('.video__title').text().trim();
    const link = $el.attr('href') || '';
    const thumbnail = $el.find('.thumb').first().attr('src') || '';
    const duration = $el.find('.video__tag--time').text().trim();
    const size = $el.find('.video__tag--size').text().trim();
    const quality = $el.find('.video__tag--format').length ? 'HD' : '';

    if (!title || !link) return;

    const relevanceScore = calculateRelevanceScore(title, searchQuery);

    // Kontrola, zda již neexistuje výsledek se stejným názvem a velikostí
    const isDuplicate = results.some(
      existingResult => 
        existingResult.title === title && 
        existingResult.size === size
    );

    // Přidáme pouze pokud není duplicitní
    if (!isDuplicate) {
      results.push({
        id: link.split('/').pop() || '',
        title,
        link: link.startsWith('http') ? link : `https://prehraj.to${link}`,
        thumbnail: thumbnail.startsWith('//') ? `https:${thumbnail}` : (
          thumbnail.startsWith('/') ? `https://prehraj.to${thumbnail}` : thumbnail
        ),
        duration,
        size,
        quality,
        relevanceScore
      });
    }
  });

  return results;
} 

// Pomocná funkce pro převod velikosti souboru na byty
function convertSizeToBytes(size: string): number {
  const units = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };

  const match = size.trim().match(/^([\d.]+)\s*([KMGT]?B)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  return value * (units[unit as keyof typeof units] || 0);
} 