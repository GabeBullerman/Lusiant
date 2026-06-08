'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

const sel =
  'border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-black'
const dateInput =
  'border border-gray-200 rounded px-2 py-2 text-sm bg-white text-gray-600 focus:outline-none focus:border-black'

export function OrderFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')

  function pushWith(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(params.toString())
    mutate(p)
    const qs = p.toString()
    router.push(`/admin/orders${qs ? `?${qs}` : ''}`)
  }

  function setParam(key: string, value: string) {
    pushWith(p => (value ? p.set(key, value) : p.delete(key)))
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    pushWith(p => (search.trim() ? p.set('q', search.trim()) : p.delete('q')))
  }

  const keys = ['status', 'sort', 'q', 'from', 'to']
  const hasFilters = [...params.keys()].some(k => keys.includes(k))

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <form onSubmit={submitSearch} className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customer…"
          className="border border-gray-200 rounded pl-8 pr-3 py-2 text-sm w-56 focus:outline-none focus:border-black"
        />
      </form>

      <select className={sel} value={params.get('status') ?? ''} onChange={e => setParam('status', e.target.value)}>
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <div className="flex items-center gap-2">
        <input
          type="date"
          aria-label="From date"
          className={dateInput}
          value={params.get('from') ?? ''}
          onChange={e => setParam('from', e.target.value)}
        />
        <span className="text-xs text-gray-400">to</span>
        <input
          type="date"
          aria-label="To date"
          className={dateInput}
          value={params.get('to') ?? ''}
          onChange={e => setParam('to', e.target.value)}
        />
      </div>

      <select className={sel} value={params.get('sort') ?? ''} onChange={e => setParam('sort', e.target.value)}>
        <option value="">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="total_desc">Total: high → low</option>
        <option value="total_asc">Total: low → high</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => {
            setSearch('')
            router.push('/admin/orders')
          }}
          className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
