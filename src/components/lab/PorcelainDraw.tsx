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
  const ref = useRef<SVGSVGElement>(null)
  const [drawn, setDrawn] = useState(false)
  const [key, setKey] = useState(0)

  // Draw when it scrolls into view
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setDrawn(true),
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  function replay() {
    setDrawn(false)
    setKey(k => k + 1)
    // next frame, draw again
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)))
  }

  return (
    <div className="relative flex flex-col items-center">
      <svg
        ref={ref}
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
          <path
            key={i}
            d={d}
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: drawn ? 0 : 1,
              transition: 'stroke-dashoffset 1.1s cubic-bezier(0.65,0,0.35,1)',
              transitionDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </svg>

      <button
        onClick={replay}
        className="mt-8 text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
      >
        ↺ Replay
      </button>
    </div>
  )
}
