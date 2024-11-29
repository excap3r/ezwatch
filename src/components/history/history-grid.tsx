'use client'

import { WatchHistory } from '@/lib/types'
import HistoryCard from './history-card'

interface HistoryGridProps {
  items: WatchHistory[]
  onContinue: (item: WatchHistory) => void
}

export default function HistoryGrid({ items, onContinue }: HistoryGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">Continue Watching</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <HistoryCard 
            key={item.id} 
            item={item} 
            onContinue={onContinue}
          />
        ))}
      </div>
    </div>
  )
}
