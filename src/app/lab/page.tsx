'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { PorcelainBackdrop } from '@/components/store/PorcelainBackdrop'

// Three.js is browser-only — load without SSR.
const InkField = dynamic(() => import('@/components/lab/InkField'), { ssr: false })

export default function LabPage() {
  // Bump the key to remount PorcelainBackdrop and replay the draw from scratch.
  const [replay, setReplay] = useState(0)

  return (
    <main className="bg-white text-black">
      {/* 1 — Self-drawing porcelain floral: outlines trace on (center-out), then
          the shaded fills reveal behind. */}
      <section className="relative isolate min-h-screen w-full overflow-hidden bg-white">
        <p className="absolute top-8 left-8 z-20 text-[11px] tracking-widest uppercase text-gray-300">
          01 — Self-drawing line art (SVG)
        </p>
        <PorcelainBackdrop key={replay} />
        {/* mix-blend-difference: text auto-inverts against the artwork beneath. */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center mix-blend-difference pointer-events-none">
          <h1 className="text-white text-3xl md:text-6xl tracking-[0.2em] font-medium uppercase">
            Gabe Bullerman
          </h1>
          <button
            onClick={() => setReplay(n => n + 1)}
            className="pointer-events-auto mt-6 text-white text-xs md:text-sm tracking-[0.3em] uppercase border-b border-white pb-1 hover:opacity-70 transition-opacity"
          >
            Replay
          </button>
        </div>
      </section>

      {/* 2 — Three.js shader showpiece */}
      <section className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <InkField />
        <div className="relative z-10 text-center mix-blend-difference text-white pointer-events-none">
          <p className="text-[11px] tracking-widest uppercase opacity-70 mb-4">02 — WebGL (Three.js)</p>
          <h2 className="text-3xl md:text-5xl tracking-[0.3em] font-medium uppercase">Lusiant</h2>
          <p className="mt-4 text-[11px] tracking-widest uppercase opacity-70">Move your cursor</p>
        </div>
      </section>
    </main>
  )
}
