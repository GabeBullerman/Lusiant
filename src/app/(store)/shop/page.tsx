import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { getCollections, getAllCollections } from '@/lib/collections'
import { Product } from '@/lib/types'
import Link from 'next/link'

async function getProducts(
  collection: string | undefined,
  includeSoldOut: boolean,
  search: string | undefined
): Promise<Product[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from('products').select('*')
    if (!includeSoldOut) query = query.eq('is_active', true)
    if (collection) query = query.ilike('category', collection)
    if (search) {
      const term = search.replace(/[,()]/g, '').trim()
      if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`)
    }
    const { data } = await query
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })
    return (data as Product[]) ?? []
  } catch {
    return []
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; soldout?: string; q?: string }>
}) {
  const { collection, soldout, q } = await searchParams
  const includeSoldOut = soldout === '1'

  const [products, collections] = await Promise.all([
    getProducts(collection, includeSoldOut, q),
    includeSoldOut ? getAllCollections() : getCollections(),
  ])

  const activeChip = (target?: string) =>
    (target ?? '').toLowerCase() === (collection ?? '').toLowerCase()

  const buildHref = (col?: string, withSoldOut = includeSoldOut) => {
    const params = new URLSearchParams()
    if (col) params.set('collection', col)
    if (withSoldOut) params.set('soldout', '1')
    if (q) params.set('q', q)
    const qs = params.toString()
    return `/shop${qs ? `?${qs}` : ''}`
  }

  const heading = q ? `Search: “${q}”` : collection || 'Shop'

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-6">{heading}</h1>

      {/* Collection filter chips + sold-out toggle */}
      <div className="flex flex-wrap items-center gap-2 mb-10">
        {collections.length > 0 && (
          <>
            <Link
              href={buildHref(undefined)}
              className={`px-4 py-1.5 text-xs tracking-widest uppercase border rounded-full transition-colors ${
                activeChip(undefined) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'
              }`}
            >
              All
            </Link>
            {collections.map(c => (
              <Link
                key={c}
                href={buildHref(c)}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase border rounded-full transition-colors ${
                  activeChip(c) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'
                }`}
              >
                {c}
              </Link>
            ))}
          </>
        )}

        <Link
          href={buildHref(collection, !includeSoldOut)}
          className={`ml-auto px-4 py-1.5 text-xs tracking-widest uppercase border rounded-full transition-colors ${
            includeSoldOut ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'
          }`}
        >
          {includeSoldOut ? 'Hide sold out' : 'Show sold out'}
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase py-20">
          {q ? `No products match “${q}”` : collection ? 'No products in this collection yet' : 'No products yet'}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
