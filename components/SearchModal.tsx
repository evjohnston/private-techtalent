'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Slide, Section } from '@/types'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  slides: Slide[]
  sections: Section[]
  onSlideSelect: (slideId: number) => void
}

interface SearchIndex {
  [slideId: string]: {
    title: string
    text: string
  }
}

export default function SearchModal({
  isOpen,
  onClose,
  slides,
  sections,
  onSlideSelect,
}: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{
    slideId: number
    title: string
    matchedText: string
  }>>([])
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // Build search index from sections
  useEffect(() => {
    const index: SearchIndex = {}
    
    slides.forEach(slide => {
      // Find the section for this slide
      let sectionTitle = 'Untitled'
      for (let i = sections.length - 1; i >= 0; i--) {
        if (slide.id >= sections[i].startSlide) {
          sectionTitle = sections[i].title
          break
        }
      }
      
      index[slide.id] = {
        title: sectionTitle,
        text: `Slide ${slide.id} ${sectionTitle}`, // You can add more text here if you have slide descriptions
      }
    })
    
    setSearchIndex(index)
    setIsLoading(false)
  }, [slides, sections])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchIndex || searchQuery.length < 2) {
      setResults([])
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    const searchResults: Array<{
      slideId: number
      title: string
      matchedText: string
    }> = []

    Object.entries(searchIndex).forEach(([slideIdStr, data]) => {
      const titleMatch = data.title.toLowerCase().includes(lowerQuery)
      const textMatch = data.text.toLowerCase().includes(lowerQuery)

      if (titleMatch || textMatch) {
        let matchedText = data.title

        // If text matches but not title, show context
        if (textMatch && !titleMatch) {
          const textLower = data.text.toLowerCase()
          const matchIndex = textLower.indexOf(lowerQuery)
          const start = Math.max(0, matchIndex - 30)
          const end = Math.min(data.text.length, matchIndex + searchQuery.length + 50)
          matchedText = 
            (start > 0 ? '...' : '') + 
            data.text.slice(start, end) + 
            (end < data.text.length ? '...' : '')
        }

        searchResults.push({
          slideId: parseInt(slideIdStr),
          title: data.title,
          matchedText,
        })
      }
    })

    // Sort by slide number
    searchResults.sort((a, b) => a.slideId - b.slideId)

    setResults(searchResults.slice(0, 20)) // Limit to 20 results
  }, [searchIndex])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 150)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query || query.length < 2) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-accent/30 text-primary rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-[10%] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input */}
        <div className="p-4 border-b border-primary/10">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search slides..."
              className="w-full pl-10 pr-4 py-3 bg-primary/5 rounded-lg text-primary placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
              >
                <svg
                  className="w-4 h-4 text-primary/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-primary/50">
              Loading search index...
            </div>
          ) : query.length < 2 ? (
            <div className="p-8 text-center text-primary/50">
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-primary/50">
              No slides found matching &quot;{query}&quot;
            </div>
          ) : (
            <div className="divide-y divide-primary/10">
              {results.map((result) => (
                <button
                  key={result.slideId}
                  onClick={() => {
                    onSlideSelect(result.slideId)
                    onClose()
                  }}
                  className="w-full p-4 text-left hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-16 h-9 bg-primary/10 rounded overflow-hidden">
                      <img
                        src={slides[result.slideId - 1]?.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary/50">
                          #{result.slideId}
                        </span>
                        <span className="text-sm font-medium text-primary truncate">
                          {highlightText(result.title, query)}
                        </span>
                      </div>

                      {result.matchedText !== result.title && (
                        <p className="text-xs text-primary/60 mt-1 line-clamp-2">
                          {highlightText(result.matchedText, query)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-primary/10 bg-primary/5">
          <p className="text-xs text-primary/50 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white rounded text-primary/70">Esc</kbd> to
            close
          </p>
        </div>
      </div>
    </div>
  )
}