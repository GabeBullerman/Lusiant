'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  opacity?: number
  duration?: number
  className?: string
}

/**
 * Animated porcelain floral backdrop for Best Sellers.
 * Full-bleed black line-art that draws itself in on scroll into view.
 */
export function PorcelainBackdrop({
  opacity = 1,
  duration = 4200,
  className = '',
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const drawnRef = useRef(false)
  const [viewBox, setViewBox] = useState('0 0 1125 1500')
  const [inner, setInner] = useState('')

  // Fetch SVG on mount, extract its viewBox + inner markup (the path)
  useEffect(() => {
    fetch('/porcelain-pattern.svg')
      .then(r => r.text())
      .then(text => {
        const vb = text.match(/viewBox="([^"]+)"/)?.[1]
        if (vb) setViewBox(vb)
        const innerMarkup = text.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
        setInner(innerMarkup)
      })
      .catch(console.error)
  }, [])

  // Animate once the path is in the DOM
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !inner) return

    const path = svg.querySelector('path') as SVGPathElement | null
    if (!path) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const len = path.getTotalLength()

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
      { threshold: 0.1 }
    )
    io.observe(svg)
    return () => io.disconnect()
  }, [duration, inner])

  if (!inner) return null

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      {/* Centered at natural proportions, fills the section height */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        fill="none"
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    </div>
  )
}
