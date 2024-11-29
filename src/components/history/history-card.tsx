'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { WatchHistory } from '@/lib/types'
import { Play } from 'lucide-react'

interface HistoryCardProps {
  item: WatchHistory
  onContinue: (item: WatchHistory) => void
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  // Získáme den, měsíc a rok
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  // Získáme hodiny a minuty
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

export default function HistoryCard({ item, onContinue }: HistoryCardProps) {
  return (
    <Card className="bg-gray-800 hover:bg-gray-700 transition-colors duration-200 h-full">
      <div className="flex flex-col h-full">
        <CardContent className="p-4 flex-grow">
          <h3 className="text-xl font-semibold mb-2 text-gray-100">{item.title}</h3>
          {item.seasonNumber && item.episodeNumber && (
            <p className="text-gray-400 mb-2">
              Season {item.seasonNumber}, Episode {item.episodeNumber}
            </p>
          )}
          <p className="text-gray-400 mb-2">
            Left off at {formatTime(parseFloat(item.timestamp))}
          </p>
          <p className="text-gray-500 text-sm">
            Last played: {formatDate(item.lastPlayed)}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button onClick={() => onContinue(item)} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Continue Watching
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}
