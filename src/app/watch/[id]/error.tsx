'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">
        Něco se pokazilo!
      </h2>
      <Button
        onClick={reset}
        variant="outline"
      >
        Zkusit znovu
      </Button>
    </div>
  )
} 