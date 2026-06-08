'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Newsletter } from './Newsletter'

export function ClubTab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-black text-white text-[11px] tracking-widest uppercase px-4 py-2.5 hover:bg-gray-900 transition-colors shadow-lg"
      >
        Club Members
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full max-w-md p-8 text-center shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm tracking-widest font-medium uppercase mb-2">Join the Club</h2>
            <p className="text-[11px] tracking-widest uppercase text-gray-500 mb-6">
              Get early access · Insider information · Special offers
            </p>
            <Newsletter />
          </div>
        </div>
      )}
    </>
  )
}
