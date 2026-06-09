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
  duration = 11000,
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
      // setTimeout (not rAF) so it still fires in a backgrounded tab, and a
      // short delay lets the primed offset commit before the transition.
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.33, 0, 0.2, 1)`
        path.style.strokeDashoffset = '0'
      }, 60)
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

    // Safety net: if the observer never fires (backgrounded tab, layout quirk),
    // poll visibility and draw once the section is actually on screen — so it
    // still animates on scroll rather than completing off-screen.
    const inView = () => {
      const r = svg.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    }
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
