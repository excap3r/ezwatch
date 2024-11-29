import { Button } from '@/components/ui/button'
import { CSFDEpisode } from '@/types/player'
import { ArrowLeft } from 'lucide-react'

interface EpisodeGridProps {
  episodes: CSFDEpisode[]
  onSelect: (episode: CSFDEpisode) => void
  onBack: () => void
  seriesTitle: string
  isLoading: boolean
  error: string | null
}

export function EpisodeGrid({
  episodes,
  onSelect,
  onBack,
  seriesTitle,
  isLoading,
  error
}: EpisodeGridProps) {
  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-red-500 mb-4">{error}</div>
        <Button variant="outline" onClick={onBack}>
          Go Back
        </Button>
      </div>
    )
  }

  // Seskupení epizod podle sezón
  const episodesBySeason = episodes.reduce((acc, episode) => {
    const season = episode.seasonNumber
    if (!acc[season]) {
      acc[season] = []
    }
    acc[season].push(episode)
    return acc
  }, {} as Record<number, CSFDEpisode[]>)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Series
        </Button>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-gray-100">{seriesTitle}</h2>

      {isLoading ? (
        <div className="text-gray-400">Loading episodes...</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(episodesBySeason).map(([season, seasonEpisodes]) => (
            <div key={season} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200">
                Season {season}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonEpisodes
                  .sort((a, b) => a.episodeNumber - b.episodeNumber)
                  .map((episode) => (
                    <Button
                      key={episode.id}
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start text-left"
                      onClick={() => onSelect(episode)}
                    >
                      <div className="font-semibold mb-1">
                        Episode {episode.episodeNumber}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {episode.title}
                      </div>
                    </Button>
                  ))}
              </div>
            </div>
          ))}
          {episodes.length === 0 && !isLoading && (
            <div className="text-gray-400">No episodes found</div>
          )}
        </div>
      )}
    </div>
  )
} 