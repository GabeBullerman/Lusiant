'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, ChevronDown, User, Search } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  const overlay = pathname === '/'

  const navClass = overlay
    ? 'absolute top-0 inset-x-0 z-30 text-white'
    : 'sticky top-0 inset-x-0 z-30 bg-white border-b border-gray-100 text-black'

  const badgeClass = overlay ? 'bg-white text-black' : 'bg-black text-white'

  function closeMenu() {
    setMenuOpen(false)
    setMobileShopOpen(false)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    setSearchQuery('')
    setMenuOpen(false)
    router.push(`/shop?q=${encodeURIComponent(q)}`)
  }

  return (
    <nav className={navClass}>
      {overlay && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />
      )}

      <div className="relative w-full px-5 md:px-10 flex items-center justify-between h-14">
        {/* Left nav (desktop) */}
        <div className="hidden md:flex items-center gap-8 text-xs tracking-widest font-medium uppercase">
          <Link href="/" className="hover:opacity-60 transition-opacity">Home</Link>

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

        {/* Mobile: hamburger */}
        <button className="md:hidden" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }} aria-label="Menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link
          href="/"
          aria-label="Lusiant — home"
          className="absolute left-1/2 -translate-x-1/2 hover:opacity-70 transition-opacity"
        >
          <span
            aria-hidden
            className="block h-7 w-[100px] md:h-9 md:w-[120px] bg-current"
            style={{
              WebkitMask: 'url(/logo-wordmark.png) center / contain no-repeat',
              mask: 'url(/logo-wordmark.png) center / contain no-repeat',
            }}
          />
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4 md:gap-5 text-xs tracking-widest font-medium uppercase">
          {/* Mobile search toggle */}
          <button
            className="md:hidden hover:opacity-60 transition-opacity"
            onClick={() => { setSearchOpen(v => !v); setMenuOpen(false) }}
            aria-label="Search"
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
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

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 py-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 text-black"
            />
            {searchQuery && (
              <button type="submit" className="text-xs tracking-widest uppercase text-black">
                Go
              </button>
            )}
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
