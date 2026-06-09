'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  opacity?: number
  duration?: number
  /** Size relative to the section. >1 bleeds off the edges. Default 1.6. */
  scale?: number
  className?: string
}

/**
 * Animated porcelain floral line-art that draws itself in on scroll into view.
 * Centerline-traced so each line is a single pen-stroke (no outline retrace).
 */
export function PorcelainBackdrop({
  opacity = 1,
  duration = 11000,
  scale = 1.6,
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

    // Require the section to be substantially in view (not just peeking above
    // the fold) so the slow draw plays as the visitor arrives, not on load.
    const inView = () => {
      const r = svg.getBoundingClientRect()
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
    io.observe(svg)

    // Safety net: if the observer never fires (backgrounded tab, layout quirk),
    // poll visibility and draw once the section is actually on screen.
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
      {/* Oversized + centered so the art bleeds off the section edges */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
        fill="none"
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    </div>
  )
}
