'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import SlideViewer from '@/components/SlideViewer'
import SearchModal from '@/components/SearchModal'
import { Slide, Section } from '@/types'

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [currentSlide, setCurrentSlide] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    // Load slides data
    fetch('/slides/metadata.json')
      .then(res => res.json())
      .then(data => {
        setSlides(data.slides)
        setSections(data.sections)
      })
      .catch(() => {
        // Fallback: Generate slides dynamically
        const totalSlides = 10 // Change this to your number of slides
        const generatedSlides = Array.from({ length: totalSlides }, (_, i) => ({
          id: i + 1,
          thumbnail: `/slides/thumbnails/slide-${String(i + 1).padStart(4, '0')}.jpg`,
          full: `/slides/full/slide-${String(i + 1).padStart(4, '0')}.jpg`,
          highRes: `/slides/high-res/slide-${String(i + 1).padStart(4, '0')}.jpg`,
        }))
        setSlides(generatedSlides)
        setSections([
          { title: 'Introduction', startSlide: 1, level: 0 }
        ])
      })
  }, [])

  const handleSlideChange = (slideId: number) => {
    setCurrentSlide(slideId)
    setIsFullscreen(false)
  }

  const handleNext = () => {
    if (currentSlide < slides.length) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (slides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary font-medium">Loading slides...</p>
        </div>
      </div>
    )
  }

  const currentSlideData = slides.find(s => s.id === currentSlide)

  return (
    <div className="flex h-screen overflow-hidden">
      {!isFullscreen && (
        <Sidebar
          sections={sections}
          slides={slides}
          currentSlide={currentSlide}
          onSlideSelect={handleSlideChange}
          onSearchClick={() => setIsSearchOpen(true)}
        />
      )}
      
      <main className={`flex-1 flex items-center justify-center p-8 ${!isFullscreen ? 'ml-72' : ''}`}>
        {currentSlideData && (
          <SlideViewer
            slide={currentSlideData}
            totalSlides={slides.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasPrevious={currentSlide > 1}
            hasNext={currentSlide < slides.length}
            isFullscreen={isFullscreen}
            onFullscreenToggle={handleFullscreenToggle}
          />
        )}
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        slides={slides}
        sections={sections}
        onSlideSelect={handleSlideChange}
      />
    </div>
  )
}