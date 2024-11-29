import { PrehrajtoSearchResult } from '@/lib/types'

// Pomocná funkce pro normalizaci ID
export const normalizeVideoId = (id: string): string => {
  return id.includes('/') ? id.split('/')[1] : id
}

// Pomocná funkce pro výběr nejlepšího zdroje
export const selectBestSource = (sources: PrehrajtoSearchResult[]): PrehrajtoSearchResult | null => {
  if (!sources.length) return null
  
  return sources.sort((a, b) => {
    // HD má nejvyšší prioritu
    if (a.quality === 'HD' && b.quality !== 'HD') return -1
    if (a.quality !== 'HD' && b.quality === 'HD') return 1
    
    // Pokud mají stejnou kvalitu, porovnáme velikost
    const sizeA = parseFloat(a.size?.replace(/[^0-9.]/g, '') || '0')
    const sizeB = parseFloat(b.size?.replace(/[^0-9.]/g, '') || '0')
    return sizeB - sizeA
  })[0]
} 