'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, ChevronDown, Search, User } from 'lucide-react'
import { useCart } from './CartContext'
import { useState } from 'react'

interface NavbarProps {
  collections: string[]
}

function collectionHref(c: string) {
  return `/shop?collection=${encodeURIComponent(c)}`
}

export function Navbar({ collections }: NavbarProps) {
  const { totalItems, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileShopOpen, setMobileShopOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    setSearchOpen(false)
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`)
  }

  // On the homepage the nav floats over the hero image (white text, no bar,
  // does not stick on scroll). Everywhere else it's a normal sticky white bar.
  const overlay = pathname === '/'

  const navClass = overlay
    ? 'absolute top-0 inset-x-0 z-30 text-white'
    : 'sticky top-0 inset-x-0 z-30 bg-white border-b border-gray-100 text-black'

  const badgeClass = overlay ? 'bg-white text-black' : 'bg-black text-white'

  function closeMenu() {
    setMenuOpen(false)
    setMobileShopOpen(false)
  }

  return (
    <nav className={navClass}>
      {/* Subtle gradient for legibility when floating over the hero */}
      {overlay && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />
      )}

      <div className="relative w-full px-5 md:px-10 flex items-center justify-between h-14">
        {/* Left nav (desktop) */}
        <div className="hidden md:flex items-center gap-8 text-xs tracking-widest font-medium uppercase">
          <Link href="/" className="hover:opacity-60 transition-opacity">Home</Link>

          {/* Shop dropdown */}
          <div className="relative group">
            <Link href="/shop" className="flex items-center gap-1 hover:opacity-60 transition-opacity">
              Shop <ChevronDown size={12} className="mt-px" />
            </Link>
            <div className="absolute left-0 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150">
              <div className="bg-white text-black min-w-48 py-2 shadow-lg border border-gray-100">
                <Link href="/shop" className="block px-4 py-2 text-xs tracking-widest hover:bg-gray-50">All</Link>
                {collections.map(c => (
                  <Link
                    key={c}
                    href={collectionHref(c)}
                    className="block px-4 py-2 text-xs tracking-widest hover:bg-gray-50 uppercase"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/lookbook" className="hover:opacity-60 transition-opacity">Lookbook</Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-bold text-xl tracking-[0.3em]">
          LS&NT
        </Link>

        {/* Right */}
        <div className="flex items-center gap-5 text-xs tracking-widest font-medium uppercase">
          <button onClick={() => setSearchOpen(o => !o)} aria-label="Search" className="hover:opacity-60 transition-opacity">
            <Search size={18} />
          </button>
          <Link href="/account" aria-label="Account" className="hover:opacity-60 transition-opacity">
            <User size={18} />
          </Link>
          <Link href="/contact" className="hidden md:block hover:opacity-60 transition-opacity">Contact Us</Link>
          <button onClick={openCart} className="relative flex items-center gap-1 hover:opacity-60 transition-opacity">
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className={`absolute -top-2 -right-2 ${badgeClass} text-[10px] rounded-full w-4 h-4 flex items-center justify-center`}>
                {totalItems}
              </span>
            )}
            <span className="hidden md:inline">Cart ({totalItems})</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="relative bg-white text-black border-t border-gray-100 px-5 md:px-10 py-3">
          <form onSubmit={submitSearch} className="max-w-screen-xl mx-auto flex items-center gap-3">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-sm focus:outline-none py-1 tracking-wide"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-gray-400 hover:text-black transition-colors">
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden relative bg-white text-black border-t border-gray-100 px-6 py-4 flex flex-col gap-1 text-sm tracking-widest uppercase">
          <Link href="/" onClick={closeMenu} className="py-2">Home</Link>

          <button
            onClick={() => setMobileShopOpen(v => !v)}
            className="py-2 flex items-center justify-between"
          >
            Shop <ChevronDown size={14} className={`transition-transform ${mobileShopOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileShopOpen && (
            <div className="pl-4 flex flex-col gap-1 text-xs">
              <Link href="/shop" onClick={closeMenu} className="py-1.5">All</Link>
              {collections.map(c => (
                <Link key={c} href={collectionHref(c)} onClick={closeMenu} className="py-1.5">{c}</Link>
              ))}
            </div>
          )}

          <Link href="/lookbook" onClick={closeMenu} className="py-2">Lookbook</Link>
          <Link href="/contact" onClick={closeMenu} className="py-2">Contact Us</Link>
        </div>
      )}
    </nav>
  )
}
