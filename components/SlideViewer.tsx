'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Slide } from '@/types'

interface SlideViewerProps {
  slide: Slide
  totalSlides: number
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
  isFullscreen: boolean
  onFullscreenToggle: () => void
}

export default function SlideViewer({
  slide,
  totalSlides,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isFullscreen,
  onFullscreenToggle,
}: SlideViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setIsLoaded(false)
    const img = new Image()
    img.src = slide.full
    if (img.complete) {
      setIsLoaded(true)
    }
  }, [slide.id, slide.full])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext()
      } else if (e.key === 'Escape' && isFullscreen) {
        onFullscreenToggle()
      } else if (e.key === 'f' || e.key === 'F') {
        onFullscreenToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasPrevious, hasNext, onPrevious, onNext, onFullscreenToggle, isFullscreen])

  // Touch gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0 && hasNext) {
        onNext()
      } else if (diff < 0 && hasPrevious) {
        onPrevious()
      }
    }

    setTouchStart(null)
  }, [touchStart, hasNext, hasPrevious, onNext, onPrevious])

  // Fullscreen click navigation
  const handleFullscreenClick = useCallback((e: React.MouseEvent) => {
    if (!isFullscreen) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    
    if (clickX < rect.width * 0.3 && hasPrevious) {
      onPrevious()
    } else if (hasNext) {
      onNext()
    }
  }, [isFullscreen, hasPrevious, hasNext, onPrevious, onNext])

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 bg-black cursor-pointer z-[9999]"
        onClick={handleFullscreenClick}
      >
        <img
          ref={imageRef}
          src={slide.full}
          alt={`Slide ${slide.id}`}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="relative max-w-full">
        {!isLoaded && (
          <div className="absolute inset-0 bg-primary/5 animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        <img
          ref={imageRef}
          src={slide.full}
          alt={`Slide ${slide.id}`}
          className={`
            w-auto h-auto max-w-full max-h-[70vh]
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ boxShadow: '0 0 30px rgba(24, 48, 89, 0.25)' }}
          onLoad={() => setIsLoaded(true)}
          draggable={false}
        />
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 text-primary/60">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`p-1 transition-colors ${
            hasPrevious ? 'hover:text-primary' : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-xs">
          {slide.id} / {totalSlides}
        </span>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`p-1 transition-colors ${
            hasNext ? 'hover:text-primary' : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={onFullscreenToggle}
          className="p-1 hover:text-primary transition-colors"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
