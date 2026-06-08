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
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateProgress = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? el.scrollLeft / max : 0)
  }, [])

  const pause = useCallback(() => {
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }, [])

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false
    }, 4000)
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

  // Auto-advance (respects reduced-motion + pause-on-interaction)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (!pausedRef.current) advance(1)
    }, 3500)
    return () => clearInterval(id)
  }, [advance])

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = scrollerRef.current
    if (!el) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.scrollTo({ left: frac * (el.scrollWidth - el.clientWidth), behavior: 'smooth' })
    pause()
    scheduleResume()
  }

  return (
    <section
      className="group/carousel"
      onPointerEnter={pause}
      onPointerLeave={() => {
        pausedRef.current = false
      }}
    >
      {title && <h2 className="text-sm tracking-widest font-medium uppercase mb-6">{title}</h2>}

      <div className="relative">
        {/* Track */}
        <div
          ref={scrollerRef}
          onScroll={updateProgress}
          onPointerDown={pause}
          onWheel={() => {
            pause()
            scheduleResume()
          }}
          className="flex gap-3 lg:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, i) => (
            <div
              key={i}
              data-slide
              className="snap-start shrink-0 w-[82%] sm:w-[47%] lg:w-[31.5%]"
            >
              <div className="relative aspect-[3/4] bg-gray-50">
                <Image
                  src={url}
                  alt={title ? `${title} ${i + 1}` : `Lookbook ${i + 1}`}
                  fill
                  quality={60}
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 47vw, 32vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => {
            advance(-1)
            pause()
            scheduleResume()
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-black w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-opacity opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => {
            advance(1)
            pause()
            scheduleResume()
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-black w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-opacity opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Progress bar (click to seek) */}
      <div
        onClick={seek}
        className="mt-4 h-1 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
      >
        <div
          className="h-full bg-black rounded-full transition-[width] duration-150 ease-out"
          style={{ width: `${Math.max(8, progress * 100)}%` }}
        />
      </div>
    </section>
  )
}
