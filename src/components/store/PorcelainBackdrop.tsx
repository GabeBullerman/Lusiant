'use client'

import { useEffect, useRef } from 'react'
import { PORCELAIN_PATH, PORCELAIN_VIEWBOX } from './porcelainPath'

interface Props {
  /** 0–1 opacity of the line art. Default 0.12 (faint, sits behind content). */
  opacity?: number
  /** Stroke color. Default cobalt porcelain blue. */
  color?: string
  /** Draw duration in ms. Default 4200. */
  duration?: number
  className?: string
}

/**
 * Faint "self-drawing" porcelain floral line art, traced from the brand's
 * shattered-porcelain denim pattern. Draws itself in (strokeDashoffset) the
 * first time it scrolls into view. Purely decorative: pointer-events none,
 * aria-hidden, and respects prefers-reduced-motion.
 */
export function PorcelainBackdrop({
  opacity = 0.12,
  color = '#1b3a8f',
  duration = 4200,
  className = '',
}: Props) {
  const pathRef = useRef<SVGPathElement>(null)
  const drawnRef = useRef(false)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const len = path.getTotalLength()

    // Prime the dash so the line starts fully "undrawn".
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = reduced ? '0' : String(len)
    if (reduced) return

    const draw = () => {
      if (drawnRef.current) return
      drawnRef.current = true
      // Double rAF so the primed offset is committed before transitioning.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.33, 0, 0.2, 1)`
          path.style.strokeDashoffset = '0'
        })
      )
    }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            draw()
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.15 }
    )
    io.observe(path)
    return () => io.disconnect()
  }, [duration])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox={PORCELAIN_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className="absolute left-1/2 top-1/2 h-[125%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ opacity }}
        fill="none"
      >
        <path
          ref={pathRef}
          d={PORCELAIN_PATH}
          stroke={color}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
