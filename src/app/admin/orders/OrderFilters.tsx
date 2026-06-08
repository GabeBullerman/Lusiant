'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const sel =
  'border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-black'

export function OrderFilters() {
  const router = useRouter()
  const params = useSearchParams()

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    const qs = p.toString()
    router.push(`/admin/orders${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        className={sel}
        value={params.get('status') ?? ''}
        onChange={e => setParam('status', e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select
        className={sel}
        value={params.get('sort') ?? ''}
        onChange={e => setParam('sort', e.target.value)}
      >
        <option value="">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="total_desc">Total: high → low</option>
        <option value="total_asc">Total: low → high</option>
      </select>

      {[...params.keys()].some(k => ['status', 'sort'].includes(k)) && (
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
