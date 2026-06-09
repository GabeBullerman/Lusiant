'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  opacity?: number
  /** Reveal duration in ms. Default 5500. */
  duration?: number
  /** Extra zoom on top of cover-fill. 1 = just cover the section. Default 1. */
  scale?: number
  className?: string
}

// Diagonal sweep: the region left of a slanted leading edge is revealed.
// Points: topLeft, topLead, bottomLead, bottomLeft (kept in the same order so
// the browser interpolates each vertex smoothly between the two states).
const HIDDEN = 'polygon(-50% 0%, -20% 0%, -50% 100%, -50% 100%)'
const SHOWN = 'polygon(-50% 0%, 150% 0%, 120% 100%, -50% 100%)'

/**
 * Faithful porcelain floral (black-on-transparent raster, fills and all) that
 * wipes itself in diagonally on scroll into view. The art is generated from the
 * source .ai by scripts/gen-porcelain-art.mjs.
 */
export function PorcelainBackdrop({
  opacity = 1,
  duration = 5500,
  scale = 1,
  className = '',
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const drawnRef = useRef(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setReduced(true)
      return
    }

    const draw = () => {
      if (drawnRef.current) return
      drawnRef.current = true
      // setTimeout (not rAF) so it still fires in a backgrounded tab; the short
      // delay lets the primed HIDDEN clip commit before the transition starts.
      setTimeout(() => {
        img.style.transition = `clip-path ${duration}ms cubic-bezier(0.33, 0, 0.2, 1)`
        img.style.clipPath = SHOWN
      }, 60)
    }

    const inView = () => {
      const r = img.getBoundingClientRect()
      const vh = window.innerHeight
      const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
      return r.height > 0 && visible / r.height > 0.55
    }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting && inView()) {
            draw()
            io.disconnect()
            break
          }
        }
      },
      { threshold: [0.25, 0.55, 0.75] }
    )
    io.observe(img)

    // Safety net for backgrounded tabs / layout quirks where IO never fires.
    const poll = window.setInterval(() => {
      if (drawnRef.current) return window.clearInterval(poll)
      if (inView()) draw()
    }, 400)
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 60000)

    return () => {
      io.disconnect()
      window.clearInterval(poll)
      window.clearTimeout(stopPoll)
    }
  }, [duration])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/porcelain-art.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          clipPath: reduced ? SHOWN : HIDDEN,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
        }}
      />
    </div>
  )
}
