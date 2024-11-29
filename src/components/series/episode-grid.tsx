'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface Episode {
  id: string
  title: string
  seasonNumber: number
  episodeNumber: number
}

interface EpisodeGridProps {
  episodes: Episode[]
  onSelect: (episode: Episode) => void
  onBack: () => void
  seriesTitle: string
}

export default function EpisodeGrid({ episodes, onSelect, onBack, seriesTitle }: EpisodeGridProps) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-100">Select Episode</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {episodes.map((episode) => (
          <Card key={episode.id} className="bg-gray-800 hover:bg-gray-700 transition-colors duration-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-100">{episode.title}</h3>
              <p className="text-gray-400">
                Season {episode.seasonNumber}, Episode {episode.episodeNumber}
              </p>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button 
                onClick={() => onSelect(episode)} 
                className="w-full"
              >
                Select Episode
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 