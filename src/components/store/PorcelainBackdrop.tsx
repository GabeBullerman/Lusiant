'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  opacity?: number
  /** Draw duration in ms. Default 6500. */
  duration?: number
  className?: string
}

interface Art {
  vb: string
  w: number
  h: number
  d: string
}

const HIDDEN = 'inset(0 100% 0 0)'
const SHOWN = 'inset(0 0 0 0)'
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

/**
 * Porcelain floral that DRAWS itself in: a visible centerline "pen" (the
 * skeleton path, aligned to the raster) strokes on left-to-right, and the
 * faithful filled art (fills + shading) wipes in right behind the pen via
 * clip-path. The pen fades out at the end, leaving the clean filled art.
 *
 * Pen path + raster are produced by scripts/gen-porcelain-{skeleton,art}.mjs.
 */
export function PorcelainBackdrop({
  opacity = 1,
  duration = 6500,
  className = '',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const penRef = useRef<SVGPathElement>(null)
  const drawnRef = useRef(false)
  const [art, setArt] = useState<Art | null>(null)

  // Load the pen path + viewBox from the generated skeleton SVG.
  useEffect(() => {
    fetch('/porcelain-skeleton.svg')
      .then(r => r.text())
      .then(text => {
        const vb = text.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 2200 1182'
        const d = text.match(/ d="([^"]+)"/)?.[1] ?? ''
        const [, , w, h] = vb.split(/\s+/).map(Number)
        setArt({ vb, w, h, d })
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!art) return
    const root = rootRef.current
    const img = imgRef.current
    const pen = penRef.current
    if (!root || !img || !pen) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const len = pen.getTotalLength()
    pen.style.strokeDasharray = String(len)
    pen.style.strokeDashoffset = reduced ? '0' : String(len)
    if (reduced) {
      img.style.clipPath = SHOWN
      pen.style.opacity = '0'
      return
    }
    img.style.clipPath = HIDDEN

    const draw = () => {
      if (drawnRef.current) return
      drawnRef.current = true
      // setTimeout (not rAF) so it still fires in a backgrounded tab; the short
      // delay lets the primed start states commit before the transitions begin.
      setTimeout(() => {
        // Fill wipes in (slightly trails the pen's leading ink edge).
        img.style.transition = `clip-path ${duration}ms ${EASE}`
        img.style.clipPath = SHOWN
        // Pen draws across, then fades out over the final stretch so the
        // finished frame is just the clean filled art.
        const fade = Math.round(duration * 0.18)
        const fadeDelay = Math.round(duration * 0.85)
        pen.style.transition = `stroke-dashoffset ${duration}ms ${EASE}, opacity ${fade}ms linear ${fadeDelay}ms`
        pen.style.strokeDashoffset = '0'
        pen.style.opacity = '0'
      }, 60)
    }

    const inView = () => {
      const r = root.getBoundingClientRect()
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
    io.observe(root)

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
  }, [art, duration])

  if (!art) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      {/* Filled art (fills + shading), wiped in behind the pen. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/porcelain-art.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: HIDDEN }}
      />
      {/* Visible pen: the centerline being drawn. */}
      <svg
        viewBox={art.vb}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <path
          ref={penRef}
          d={art.d}
          stroke="#0a0a0a"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
