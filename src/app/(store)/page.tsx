import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { HeroSetting, Product } from '@/lib/types'
import Link from 'next/link'

async function getHero(): Promise<HeroSetting> {
  const defaults: HeroSetting = {
    title: 'PORCELAIN INSPIRED DENIM',
    subtitle: 'New Collection',
    image_url: '',
    button_text: 'SHOP NOW',
    button_href: '/shop',
  }
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero')
      .single()
    return (data?.value as HeroSetting) ?? defaults
  } catch {
    return defaults
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6)
    return (data as Product[]) ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [hero, featured] = await Promise.all([getHero(), getFeaturedProducts()])

  return (
    <>
      {/* Hero */}
      <section
        className="relative h-[85vh] flex items-end pb-12 px-8"
        style={hero.image_url ? { backgroundImage: `url(${hero.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#111' }}
      >
        <div className="relative z-10">
          <h1 className="text-white text-sm md:text-base tracking-widest font-medium mb-4 uppercase">
            {hero.title}
          </h1>
          <Link
            href={hero.button_href}
            className="inline-block border border-white text-white text-xs tracking-widest px-6 py-3 hover:bg-white hover:text-black transition-colors"
          >
            {hero.button_text}
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      {featured.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs tracking-widest font-medium uppercase">Best Sellers</h2>
            <Link href="/shop" className="text-xs tracking-widest text-gray-500 hover:text-black transition-colors uppercase">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {featured.length === 0 && (
        <section className="max-w-screen-xl mx-auto px-6 py-16 text-center">
          <p className="text-xs tracking-widest text-gray-400 uppercase">New arrivals coming soon</p>
        </section>
      )}
    </>
  )
}
