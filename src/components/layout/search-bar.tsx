'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear: () => void
}

export default function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    onSearch('')
    onClear()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search movies and series..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          if (!e.target.value) {
            handleClear()
          }
        }}
        onKeyUp={handleKeyPress}
        className="pl-10 pr-20 py-6 w-full bg-gray-700 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-20 top-1/2 transform -translate-y-1/2"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      <Button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
      >
        Search
      </Button>
    </div>
  )
}
