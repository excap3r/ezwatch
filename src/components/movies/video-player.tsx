import { VideoState } from '@/types/player'
import { Film } from 'lucide-react'
import { RefObject, useEffect } from 'react'

interface VideoPlayerProps {
  videoState: VideoState
  videoRef: RefObject<HTMLVideoElement>
  initialTimestamp?: string
  onPlay: () => void
}

export function VideoPlayer({ 
  videoState, 
  videoRef, 
  initialTimestamp,
  onPlay 
}: VideoPlayerProps) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current) {
        saveCurrentTime()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <div className="aspect-w-16 aspect-h-9 mb-4">
      {videoState.selectedVideo?.streamUrl ? (
        <video
          ref={videoRef}
          controls
          className="w-full h-full rounded-lg"
          src={videoState.selectedVideo.streamUrl}
          onPlay={onPlay}
          onLoadedMetadata={() => {
            if (initialTimestamp && videoRef.current) {
              videoRef.current.currentTime = parseFloat(initialTimestamp)
            }
          }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
          <Film className="h-16 w-16 text-gray-500" />
        </div>
      )}
    </div>
  )
} 