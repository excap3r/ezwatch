import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { PrehrajtoSearchResult } from '@/lib/types'
import { RefreshCw } from 'lucide-react'

interface VideoSourceSelectorProps {
  sources: PrehrajtoSearchResult[]
  isLoading: boolean
  onSelect: (source: PrehrajtoSearchResult) => void
  onRefresh: () => void
}

export function VideoSourceSelector({
  sources,
  isLoading,
  onSelect,
  onRefresh
}: VideoSourceSelectorProps) {
  return (
    <div className="flex justify-end items-center mb-4 space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Video Source'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
          {sources.map((source) => (
            <DropdownMenuItem 
              key={source.id}
              onClick={() => onSelect(source)}
            >
              {source.title} ({source.quality || 'Unknown quality'}) • {source.size || 'Unknown size'}
            </DropdownMenuItem>
          ))}
          {sources.length === 0 && (
            <DropdownMenuItem disabled>
              No sources available
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
} 