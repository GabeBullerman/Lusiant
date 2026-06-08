'use client'

import { useEffect, useRef, useState } from 'react'

// Placeholder "shattered porcelain" crack pattern spanning the full canvas
// (primary impact centre + two secondary impacts, branching to the edges).
// Swap these for your friend's real artwork — drawing order = trace order.
const CRACKS = [
  // primary radial cracks reaching past the edges
  'M600 350 L500 250 L360 150 L240 30',
  'M600 350 L595 230 L605 110 L598 -30',
  'M600 350 L715 265 L835 175 L980 50',
  'M600 350 L760 358 L930 350 L1240 360',
  'M600 350 L725 450 L845 555 L975 710',
  'M600 350 L606 485 L596 620 L602 740',
  'M600 350 L472 448 L352 558 L214 700',
  'M600 350 L432 345 L262 356 L-40 350',
  // branches off the primary cracks
  'M360 150 L286 214 L196 244',
  'M835 175 L902 244 L876 322',
  'M930 350 L968 268 L1064 248',
  'M845 555 L930 516 L1018 556',
  'M596 620 L520 662 L470 736',
  'M352 558 L292 498 L206 520',
  'M262 356 L242 432 L158 474',
  'M286 214 L214 150 L96 132',
  'M715 265 L778 202 L756 118',
  'M725 450 L800 504 L792 596',
  'M472 448 L400 512 L298 512',
  'M432 345 L420 424 L348 476',
  // secondary impact (lower-right)
  'M940 520 L858 492 L772 520',
  'M940 520 L1022 560 L1108 532',
  'M940 520 L948 624 L916 712',
  'M940 520 L1002 458 L1086 430',
  // secondary impact (upper-left)
  'M300 180 L380 230 L470 250',
  'M300 180 L250 110 L150 80',
]

export function PorcelainDraw() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const paths = Array.from(svg.querySelectorAll('path'))

    // Start hidden.
    paths.forEach(p => {
      const len = p.getTotalLength()
      p.style.transition = 'none'
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len}`
    })

    // Draw on the next two frames (after the hidden state has painted), so the
    // transition reliably animates regardless of scroll position.
    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        paths.forEach((p, i) => {
          p.style.transition = `stroke-dashoffset 1s cubic-bezier(0.65,0,0.35,1) ${i * 0.09}s`
          p.style.strokeDashoffset = '0'
        })
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [key])

  return (
    <>
      <svg
        ref={svgRef}
        key={key}
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="none"
        stroke="black"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {CRACKS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>

      <button
        onClick={() => setKey(k => k + 1)}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
      >
        ↺ Replay
      </button>
    </>
  )
}
