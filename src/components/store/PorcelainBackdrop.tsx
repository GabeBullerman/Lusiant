'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  opacity?: number
  /** Total animation duration in ms. Default 7000. */
  duration?: number
  /** Outline stroke width, in viewBox units (scales with the art). Default 3. */
  strokeWidth?: number
  className?: string
}

interface Art {
  vb: string
  subs: string[]
}

const HIDDEN = 'inset(0 100% 0 0)'
const SHOWN = 'inset(0 0 0 0)'
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

/**
 * Porcelain floral: first TRACES the outline contours, then REVEALS the solid
 * filled/shaded areas behind them.
 *
 * The trace is built from many short, left-to-right ordered contour chunks (each
 * its own <path>, since a dash pattern restarts per subpath). A rAF loop walks a
 * "drawn length" through the chunks in order, so the pen genuinely traces along
 * each line. The fills then wipe in behind via clip-path, keeping the outlines at
 * their drawn thickness (the fill reveal never thickens the lines).
 *
 * Assets from scripts/gen-porcelain-{art,layers}.mjs:
 *   /porcelain-trace.svg  - outline contours
 *   /porcelain-fills.png  - solid fills only
 */
export function PorcelainBackdrop({
  opacity = 1,
  duration = 7000,
  strokeWidth = 3,
  className = '',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fillsRef = useRef<HTMLImageElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const drawnRef = useRef(false)
  const rafRef = useRef(0)
  const [art, setArt] = useState<Art | null>(null)

  useEffect(() => {
    fetch('/porcelain-trace.svg')
      .then(r => r.text())
      .then(text => {
        const vb = text.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 2200 1182'
        const d = text.match(/ d="([^"]+)"/)?.[1] ?? ''
        const subs = d.split(/(?=M)/).filter(Boolean)
        setArt({ vb, subs })
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!art) return
    const root = rootRef.current
    const fills = fillsRef.current
    const group = groupRef.current
    if (!root || !fills || !group) return

    const paths = Array.from(group.querySelectorAll('path')) as SVGPathElement[]
    const lens = paths.map(p => p.getTotalLength())
    const cum: number[] = []
    let total = 0
    for (const l of lens) { cum.push(total); total += l }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const showAll = () => paths.forEach(p => { p.style.visibility = 'visible'; p.style.strokeDashoffset = '0' })
    paths.forEach((p, i) => {
      p.style.strokeDasharray = String(lens[i])
      p.style.strokeDashoffset = reduced ? '0' : String(lens[i])
      // Hidden until the pen reaches it, so un-started chunks don't show a
      // round line-cap dot ahead of the trace.
      p.style.visibility = reduced ? 'visible' : 'hidden'
    })
    fills.style.clipPath = reduced ? SHOWN : HIDDEN
    if (reduced) return

    const drawMs = duration * 0.72

    const draw = () => {
      if (drawnRef.current) return
      drawnRef.current = true

      // Fill reveal trails the trace and finishes with it (clip-path animates
      // reliably; it only adds interior shading, never thickening the lines).
      setTimeout(() => {
        const revealMs = Math.round(duration * 0.5)
        const revealDelay = Math.round(duration * 0.5)
        fills.style.transition = `clip-path ${revealMs}ms ${EASE} ${revealDelay}ms`
        fills.style.clipPath = SHOWN
      }, 60)

      // Trace: walk a "drawn length" through the chunks in order.
      let active = 0
      const start = performance.now()
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / drawMs)
        // ease-out so it settles softly
        const eased = 1 - Math.pow(1 - t, 3)
        const drawn = eased * total
        while (active < paths.length && cum[active] + lens[active] <= drawn) {
          paths[active].style.visibility = 'visible'
          paths[active].style.strokeDashoffset = '0'
          active++
        }
        if (active < paths.length && drawn > cum[active]) {
          const p = paths[active]
          p.style.visibility = 'visible'
          const off = lens[active] - (drawn - cum[active])
          p.style.strokeDashoffset = String(off > 0 ? off : 0)
        }
        if (t < 1) rafRef.current = requestAnimationFrame(frame)
        else showAll()
      }
      rafRef.current = requestAnimationFrame(frame)
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
          if (e.isIntersecting && inView()) { draw(); io.disconnect(); break }
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
      cancelAnimationFrame(rafRef.current)
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
      {/* Solid fills / shading, revealed behind the outlines. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={fillsRef}
        src="/porcelain-fills.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: HIDDEN }}
      />
      {/* Outline contours, traced on top. */}
      <svg
        viewBox={art.vb}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g ref={groupRef}>
          {art.subs.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    </div>
  )
}
