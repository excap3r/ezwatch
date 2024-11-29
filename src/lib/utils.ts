import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateRelevanceScore(title: string, searchQuery: string): number {
  const normalizedTitle = title.toLowerCase();
  const normalizedQuery = searchQuery.toLowerCase();
  
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