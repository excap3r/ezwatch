'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface SeriesGridProps {
  series: {
    id: string
    title: string
    year: number
    episodeCount: number
  }[]
  onSelect: (series: { id: string; title: string; year: number; episodeCount: number }) => void
  onBack: () => void
}

export default function SeriesGrid({ series, onSelect, onBack }: SeriesGridProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-100">Select Series</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <Card key={s.id} className="bg-gray-800 hover:bg-gray-700 transition-colors duration-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-100">{s.title}</h3>
              <p className="text-gray-400">
                Year: {s.year}
              </p>
              <p className="text-gray-400">
                Episodes: {s.episodeCount}
              </p>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button 
                onClick={() => onSelect(s)} 
                className="w-full"
              >
                Select Season
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 