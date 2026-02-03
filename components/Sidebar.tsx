'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Section, Slide } from '@/types'

interface SidebarProps {
  sections: Section[]
  slides: Slide[]
  currentSlide: number
  onSlideSelect: (slideId: number) => void
  onSearchClick?: () => void
}

export default function Sidebar({ sections, slides, currentSlide, onSlideSelect, onSearchClick }: SidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement>(null)
  
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(() => {
    const collapsed = new Set<number>()
    sections.forEach((section, index) => {
      if (section.level === 1) {
        collapsed.add(index)
      }
    })
    return collapsed
  })

  // Auto-scroll to active item
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const item = activeItemRef.current
      const containerRect = container.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()

      if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentSlide])

  const toggleSection = useCallback((index: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }, [])

  const getChildSections = useCallback((parentIndex: number, parentLevel: number) => {
    const children: Section[] = []
    for (let i = parentIndex + 1; i < sections.length; i++) {
      const section = sections[i]
      if (!section || section.level <= parentLevel) break
      if (section.level === parentLevel + 1) {
        children.push(section)
      }
    }
    return children
  }, [sections])

  const isSlideInSection = useCallback((sectionIndex: number) => {
    const section = sections[sectionIndex]
    if (!section) return false

    let endSlide = slides.length
    for (let i = sectionIndex + 1; i < sections.length; i++) {
      const nextSection = sections[i]
      if (!nextSection) break
      if (nextSection.level <= section.level) {
        endSlide = nextSection.startSlide - 1
        break
      }
    }

    return currentSlide >= section.startSlide && currentSlide <= endSlide
  }, [sections, slides.length, currentSlide])

  const getCurrentSection = useCallback((slideNumber: number) => {
    for (let i = sections.length - 1; i >= 0; i--) {
      if (slideNumber >= sections[i].startSlide) {
        return sections[i]
      }
    }
    return sections[0] || null
  }, [sections])

  const currentSection = getCurrentSection(currentSlide)

  // Auto-expand parent sections of current slide
  useEffect(() => {
    if (!currentSection) return

    let parentSectionIndex = -1
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].level === 1 && sections[i].startSlide <= currentSlide) {
        parentSectionIndex = i
        break
      }
    }

    if (parentSectionIndex !== -1) {
      setCollapsedSections(prev => {
        if (prev.has(parentSectionIndex)) {
          const newSet = new Set(prev)
          newSet.delete(parentSectionIndex)
          return newSet
        }
        return prev
      })
    }
  }, [currentSlide, sections, currentSection])

  const renderSection = (section: Section, sectionIndex: number): JSX.Element => {
    const children = getChildSections(sectionIndex, section.level)
    const hasChildren = children.length > 0
    const isCollapsed = collapsedSections.has(sectionIndex)
    const isActive = currentSection?.startSlide === section.startSlide
    const isInSection = isSlideInSection(sectionIndex)

    return (
      <div key={`${section.title}-${section.startSlide}`}>
        <div className={`flex items-center ${section.level === 0 ? 'mt-1.5 first:mt-0' : ''}`}>
          {hasChildren && (
            <button
              onClick={() => toggleSection(sectionIndex)}
              className="w-4 h-4 flex items-center justify-center text-primary/50 hover:text-primary mr-0.5 flex-shrink-0"
            >
              <svg
                className={`w-2.5 h-2.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          <button
            ref={isActive ? activeItemRef : null}
            onClick={() => onSlideSelect(section.startSlide)}
            className={`
              flex-1 text-left py-0.5 px-1.5 rounded
              transition-all duration-200
              group leading-tight
              ${!hasChildren ? 'ml-[18px]' : ''}
              ${
                isActive
                  ? 'bg-primary text-background'
                  : isInSection
                  ? 'text-primary hover:bg-primary/10'
                  : 'text-primary/70 hover:text-primary hover:bg-primary/10'
              }
            `}
          >
            <span
              className={`
                text-[13px]
                ${section.level === 0 ? 'font-semibold' : ''}
                ${section.level === 1 ? 'font-medium' : ''}
              `}
            >
              {section.title}
            </span>
            <span
              className={`
                ml-1.5 text-[11px]
                ${isActive ? 'text-background/60' : 'text-primary/40 group-hover:text-primary/60'}
              `}
            >
              {section.startSlide}
            </span>
          </button>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="flex ml-1">
            <button
              onClick={() => toggleSection(sectionIndex)}
              className="w-4 flex justify-center py-0.5 group flex-shrink-0"
            >
              <div className="w-px h-full bg-primary/30 group-hover:bg-primary/50 transition-colors" />
            </button>
            <div className="flex-1">
              {children.map(childSection => {
                const childIndex = sections.findIndex(
                  s => s.startSlide === childSection.startSlide
                )
                return renderSection(childSection, childIndex)
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const progress = ((currentSlide - 1) / (slides.length - 1)) * 100

  return (
    <aside className="fixed left-0 top-0 h-full z-50 w-72 flex flex-col bg-accent">
      <div className="px-3 pt-5 pb-2">
        <button
          onClick={() => onSlideSelect(1)}
          className="text-left hover:opacity-80 transition-opacity w-full"
        >
          <h1 className="text-2xl font-bold text-primary">TALINT Tracker</h1>
          <p className="text-sm text-primary/60 mt-1">The Technology Policy Accelerator at the Hoover Institution</p>
        </button>
      </div>

      <nav className="flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto py-1 px-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {sections.map((section, index) => 
            section.level !== 0 ? null : renderSection(section, index)
          )}
        </div>
      </nav>

      <div className="h-px bg-primary/15" />

      {onSearchClick && (
        <div className="px-3 py-3">
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-2 px-3 py-2 bg-primary/5 hover:bg-primary/10 rounded-lg text-primary/50 hover:text-primary/70 transition-colors text-left"
          >
            <svg
              className="w-4 h-4"
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
            <span className="text-sm">Search slides...</span>
          </button>
        </div>
      )}

      <div className="h-px bg-primary/15" />

      <div className="h-0.5 bg-primary/15">
        <div
          className="h-full bg-primary/50 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-3 py-4">
        <p className="text-[11px] text-primary/50 tracking-wider uppercase mb-2">
          Created by:
        </p>
        <div className="flex items-center gap-2">
          <img
            src="/headshot.jpeg"
            alt="Emerson Victoria Johnston Headshot"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] text-primary font-medium">Emerson Victoria Johnston</p>
            <p className="text-[13px] text-primary/60">Junior Research Associate</p>
          </div>
        </div>
      </div>
    </aside>
  )
}