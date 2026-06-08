'use client'

import dynamic from 'next/dynamic'
import { PorcelainDraw } from '@/components/lab/PorcelainDraw'

// Three.js is browser-only — load without SSR.
const InkField = dynamic(() => import('@/components/lab/InkField'), { ssr: false })

export default function LabPage() {
  return (
    <main className="bg-white text-black">
      {/* 1 — SVG line-draw (the porcelain design) spanning the whole section */}
      <section className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-6 bg-white">
        <p className="absolute top-8 left-8 z-10 text-[11px] tracking-widest uppercase text-gray-300">
          01 — Line draw (SVG)
        </p>
        <PorcelainDraw />
        <div className="relative z-10 text-center pointer-events-none">
          <h1 className="text-sm md:text-base tracking-[0.4em] font-medium uppercase">
            Shattered Porcelain
          </h1>
          <p className="mt-3 text-[11px] tracking-widest uppercase text-gray-400">
            Placeholder — swap in the real artwork
          </p>
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
