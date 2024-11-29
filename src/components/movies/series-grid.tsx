import { Button } from '@/components/ui/button'
import { CSFDSeries } from '@/types/player'
import { ArrowLeft } from 'lucide-react'

interface SeriesGridProps {
  series: CSFDSeries[]
  onSelect: (series: CSFDSeries) => void
  onBack: () => void
  isLoading: boolean
  error: string | null
}

export function SeriesGrid({
  series,
  onSelect,
  onBack,
  isLoading,
  error
}: SeriesGridProps) {
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

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading series...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="p-4 h-auto flex flex-col items-start text-left"
              onClick={() => onSelect(item)}
            >
              <div className="font-semibold text-lg mb-1">{item.title}</div>
              <div className="text-gray-400 text-sm">
                {item.year} • {item.episodeCount} episodes
              </div>
            </Button>
          ))}
          {series.length === 0 && !isLoading && (
            <div className="text-gray-400">No series found</div>
          )}
        </div>
      )}
    </div>
  )
} 