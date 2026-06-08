'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

export function ShopSearch() {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
  }

  function clear() {
    setQuery('')
    router.push('/shop')
  }

  return (
    <form onSubmit={submit} className="relative mb-6 max-w-md">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search products…"
        className="w-full border border-gray-200 rounded-full pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-black"
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </form>
  )
}
