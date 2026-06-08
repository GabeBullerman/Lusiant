'use client'

import { useEffect, useRef, useState } from 'react'

// Placeholder "shattered porcelain" crack pattern (radiating from centre).
// Swap these path strings for your friend's real artwork — drawing order =
// trace order, so reorder the array to control the sequence.
const CRACKS = [
  'M150 18 L146 70 L158 118 L150 150',
  'M150 150 L168 198 L156 250 L172 292',
  'M150 150 L96 172 L44 160 L14 178',
  'M150 150 L208 168 L262 150 L292 168',
  'M150 150 L122 104 L74 78 L40 44',
  'M150 150 L190 108 L236 70 L262 40',
  'M96 172 L66 218 L78 268',
  'M208 168 L250 206 L240 258',
  'M146 70 L102 56 L62 28',
  'M158 118 L206 126 L252 108',
]

export function PorcelainDraw() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const paths = Array.from(svg.querySelectorAll('path'))

    // Start hidden: dash = full length, offset = full length.
    paths.forEach(p => {
      const len = p.getTotalLength()
      p.style.transition = 'none'
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len}`
    })
    void svg.getBoundingClientRect() // force reflow so the start state sticks

    const draw = () => {
      paths.forEach((p, i) => {
        p.style.transition = `stroke-dashoffset 1.1s cubic-bezier(0.65,0,0.35,1) ${i * 0.18}s`
        p.style.strokeDashoffset = '0'
      })
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          draw()
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(svg)
    return () => io.disconnect()
  }, [key])

  return (
    <div className="relative flex flex-col items-center">
      <svg
        ref={svgRef}
        key={key}
        viewBox="0 0 300 300"
        className="w-[min(70vw,460px)] h-auto"
        fill="none"
        stroke="black"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {CRACKS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>

      <button
        onClick={() => setKey(k => k + 1)}
        className="mt-8 text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
      >
        ↺ Replay
      </button>
    </div>
  )
}
