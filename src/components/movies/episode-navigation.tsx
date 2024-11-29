import { Button } from '@/components/ui/button'
import { CSFDEpisode } from '@/types/player'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EpisodeNavigationProps {
  episodes: CSFDEpisode[]
  selectedEpisode: CSFDEpisode
  onSelect: (episode: CSFDEpisode) => void
}

export function EpisodeNavigation({
  episodes,
  selectedEpisode,
  onSelect
}: EpisodeNavigationProps) {
  const sortedEpisodes = [...episodes].sort((a, b) => {
    if (a.seasonNumber !== b.seasonNumber) {
      return a.seasonNumber - b.seasonNumber
    }
    return a.episodeNumber - b.episodeNumber
  })

  const currentIndex = sortedEpisodes.findIndex(
    episode => 
      episode.seasonNumber === selectedEpisode.seasonNumber && 
      episode.episodeNumber === selectedEpisode.episodeNumber
  )

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < sortedEpisodes.length - 1

  return (
    <div className="flex space-x-2 mb-4">
      {hasPrevious && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onSelect(sortedEpisodes[currentIndex - 1])}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
      )}
      
      {hasNext && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onSelect(sortedEpisodes[currentIndex + 1])}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  )
} 