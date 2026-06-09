'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  opacity?: number
  duration?: number
  className?: string
}

/**
 * Animated porcelain floral backdrop for Best Sellers.
 * SVG draws itself in on scroll into view.
 */
export function PorcelainBackdrop({
  opacity = 0.12,
  duration = 4200,
  className = '',
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const drawnRef = useRef(false)
  const [svgContent, setSvgContent] = useState<string>('')

  // Fetch SVG on mount
  useEffect(() => {
    fetch('/porcelain-pattern.svg')
      .then(r => r.text())
      .then(setSvgContent)
      .catch(console.error)
  }, [])

  // Animate once mounted
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const path = svg.querySelector('path') as SVGPathElement
    if (!path) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const len = path.getTotalLength()

    // Prime dash
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = reduced ? '0' : String(len)
    if (reduced) return

    const draw = () => {
      if (drawnRef.current) return
      drawnRef.current = true
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
    io.observe(svg)
    return () => io.disconnect()
  }, [duration, svgContent])

  if (!svgContent) return null

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1400 1400"
        preserveAspectRatio="xMidYMid meet"
        className="absolute left-1/2 top-1/2 h-[140%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
        fill="none"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  )
}
