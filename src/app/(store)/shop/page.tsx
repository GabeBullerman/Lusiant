import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Product } from '@/lib/types'

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    return (data as Product[]) ?? []
  } catch {
    return []
  }
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-10">Shop</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase py-20">No products yet</p>
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
