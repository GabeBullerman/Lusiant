'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const sel =
  'border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-black'

export function ProductFilters({ collections }: { collections: string[] }) {
  const router = useRouter()
  const params = useSearchParams()

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    const qs = p.toString()
    router.push(`/admin/products${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        className={sel}
        value={params.get('collection') ?? ''}
        onChange={e => setParam('collection', e.target.value)}
      >
        <option value="">All collections</option>
        {collections.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className={sel}
        value={params.get('status') ?? ''}
        onChange={e => setParam('status', e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="soldout">Sold out</option>
        <option value="featured">Featured</option>
      </select>

      <select
        className={sel}
        value={params.get('sort') ?? ''}
        onChange={e => setParam('sort', e.target.value)}
      >
        <option value="">Newest first</option>
        <option value="name">Name: A–Z</option>
        <option value="price_desc">Price: high → low</option>
        <option value="price_asc">Price: low → high</option>
        <option value="stock">Stock: low → high</option>
      </select>

      {[...params.keys()].some(k => ['collection', 'status', 'sort'].includes(k)) && (
        <button
          onClick={() => router.push('/admin/products')}
          className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
