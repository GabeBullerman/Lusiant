'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  images: string[]
  title?: string
}

export function LookbookCarousel({ images, title }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [canScroll, setCanScroll] = useState(false)
  // Timestamp of the last user interaction. Autoplay resumes a few seconds
  // after the user stops touching the carousel — this can never get stuck
  // "paused" the way pointerenter/leave handlers can.
  const lastInteractRef = useRef(0)
  const RESUME_DELAY = 3000

  const markInteract = useCallback(() => {
    lastInteractRef.current = Date.now()
  }, [])

  // Detect whether the track actually overflows (more than fits in one view)
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 4)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [images.length])

  const updateProgress = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? el.scrollLeft / max : 0)
  }, [])

  const slideWidth = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return 0
    const first = el.querySelector<HTMLElement>('[data-slide]')
    const gap = parseFloat(getComputedStyle(el).columnGap || '16') || 16
    return (first?.offsetWidth ?? el.clientWidth / 3) + gap
  }, [])

  const advance = useCallback(
    (dir: 1 | -1) => {
      const el = scrollerRef.current
      if (!el) return
      const max = el.scrollWidth - el.clientWidth
      if (dir === 1 && el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: dir * slideWidth(), behavior: 'smooth' })
      }
    },
    [slideWidth]
  )

  // Auto-advance (only when scrollable; respects reduced-motion).
  // Skips a tick only if the user interacted within RESUME_DELAY.
  useEffect(() => {
    if (!canScroll) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (Date.now() - lastInteractRef.current > RESUME_DELAY) advance(1)
    }, 3500)
    return () => clearInterval(id)
  }, [advance, canScroll])

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = scrollerRef.current
    if (!el) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.scrollTo({ left: frac * (el.scrollWidth - el.clientWidth), behavior: 'smooth' })
    markInteract()
  }

  return (
    <section className="group/carousel" onPointerMove={markInteract}>
      {title && <h2 className="text-sm tracking-widest font-medium uppercase mb-6">{title}</h2>}

      <div className="relative">
        {/* Track */}
        <div
          ref={scrollerRef}
          onScroll={updateProgress}
          onPointerDown={markInteract}
          onTouchStart={markInteract}
          onWheel={markInteract}
          className="flex gap-3 lg:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, i) => (
            <div
              key={i}
              data-slide
              className="snap-start shrink-0 w-[88%] sm:w-[60%] lg:w-[40.5%]"
            >
              <div className="relative aspect-[3/4] bg-gray-50">
                <Image
                  src={url}
                  alt={title ? `${title} ${i + 1}` : `Lookbook ${i + 1}`}
                  fill
                  quality={60}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 60vw, 41vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        {canScroll && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => {
                advance(-1)
                markInteract()
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-black w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-opacity opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => {
                advance(1)
                markInteract()
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-black w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-opacity opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Progress bar (click to seek) — only when there is more to scroll */}
      {canScroll && (
        <div
          onClick={seek}
          className="mt-4 h-1 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
        >
          <div
            className="h-full bg-black rounded-full transition-[width] duration-150 ease-out"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      )}
    </section>
  )
}
