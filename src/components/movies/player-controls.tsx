import { Button } from '@/components/ui/button'
import { CSFDEpisode, MoviePlayerProps } from '@/types/player'
import { ArrowLeft } from 'lucide-react'

interface PlayerControlsProps {
  movie: MoviePlayerProps['movie']
  onBack: () => void
  selectedEpisode: CSFDEpisode | null
  onEpisodeBack: () => void
  onSeriesBack: () => void
}

export function PlayerControls({
  movie,
  onBack,
  selectedEpisode,
  onEpisodeBack,
  onSeriesBack
}: PlayerControlsProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={() => {
            if (movie.type === 'series') {
              if (selectedEpisode) {
                onEpisodeBack()
              } else {
                onSeriesBack()
              }
            } else {
              onBack()
            }
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {movie.type === 'series' ? (
            selectedEpisode ? 'Back to Episodes' : 'Back to Series'
          ) : (
            'Back'
          )}
        </Button>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">
        {movie.title}
      </h2>
      {movie.type === 'series' && selectedEpisode && (
        <div className="text-lg text-gray-300 mb-4">
          S{String(selectedEpisode.seasonNumber).padStart(2, '0')}
          E{String(selectedEpisode.episodeNumber).padStart(2, '0')} - {selectedEpisode.title}
        </div>
      )}
      <p className="text-gray-400 mb-4">
        {movie.genre} • {movie.director} • {movie.year}
      </p>
    </div>
  )
} 