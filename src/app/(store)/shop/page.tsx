import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { getCollections } from '@/lib/collections'
import { Product } from '@/lib/types'
import Link from 'next/link'

async function getProducts(collection?: string): Promise<Product[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from('products').select('*').eq('is_active', true)
    if (collection) query = query.ilike('category', collection)
    const { data } = await query.order('created_at', { ascending: false })
    return (data as Product[]) ?? []
  } catch {
    return []
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>
}) {
  const { collection } = await searchParams
  const [products, collections] = await Promise.all([getProducts(collection), getCollections()])

  const activeChip = (target?: string) =>
    (target ?? '').toLowerCase() === (collection ?? '').toLowerCase()

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-6">
        {collection || 'Shop'}
      </h1>

      {/* Collection filter chips */}
      {collections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/shop"
            className={`px-4 py-1.5 text-xs tracking-widest uppercase border rounded-full transition-colors ${
              activeChip(undefined) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'
            }`}
          >
            All
          </Link>
          {collections.map(c => (
            <Link
              key={c}
              href={`/shop?collection=${encodeURIComponent(c)}`}
              className={`px-4 py-1.5 text-xs tracking-widest uppercase border rounded-full transition-colors ${
                activeChip(c) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase py-20">
          {collection ? 'No products in this collection yet' : 'No products yet'}
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
