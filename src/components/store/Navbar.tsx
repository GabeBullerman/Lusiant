'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from './CartContext'
import { useState } from 'react'

interface NavbarProps {
  announcement?: { text: string; enabled: boolean }
}

export function Navbar({ announcement }: NavbarProps) {
  const { totalItems, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {announcement?.enabled && (
        <div className="bg-black text-white text-center text-xs py-2 tracking-widest font-medium">
          {announcement.text}
        </div>
      )}

      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between h-14">
          {/* Left nav */}
          <div className="hidden md:flex items-center gap-8 text-xs tracking-widest font-medium uppercase">
            <Link href="/" className="hover:opacity-60 transition-opacity">Home</Link>
            <Link href="/shop" className="hover:opacity-60 transition-opacity">Shop</Link>
            <Link href="/lookbook" className="hover:opacity-60 transition-opacity">Lookbook</Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-bold text-xl tracking-[0.3em]">
            LS&NT
          </Link>

          {/* Right */}
          <div className="flex items-center gap-6 text-xs tracking-widest font-medium uppercase">
            <Link href="/contact" className="hidden md:block hover:opacity-60 transition-opacity">Contact</Link>
            <button onClick={openCart} className="relative flex items-center gap-1 hover:opacity-60 transition-opacity">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="hidden md:inline">Cart ({totalItems})</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4 text-sm tracking-widest uppercase">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/lookbook" onClick={() => setMenuOpen(false)}>Lookbook</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </nav>
    </>
  )
}
