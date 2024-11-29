'use client'

import { Button } from "@/components/ui/button"
import { History, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  onClear?: () => void
  onReset?: () => void
}

export default function Navbar({ onClear, onReset }: NavbarProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClear) {
      onClear()
    }
    if (onReset) {
      onReset()
    }
    router.push('/')
  }

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <button 
          onClick={handleClick}
          className="text-2xl font-bold text-gray-100 hover:text-gray-300 transition-colors"
        >
          ezwatch
        </button>
        <div className="flex space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5 text-gray-100" />
          </Button>
          <Button variant="ghost" size="icon">
            <History className="h-5 w-5 text-gray-100" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
