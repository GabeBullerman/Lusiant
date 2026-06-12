import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { LookbookCarousel } from '@/components/store/LookbookCarousel'
import { Reveal } from '@/components/store/Reveal'
import { PorcelainBackdrop } from '@/components/store/PorcelainBackdrop'
import { getCommunity } from '@/lib/site-content'
import { HeroSetting, Product } from '@/lib/types'
import Image from 'next/image'
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
  const [hero, featured, community] = await Promise.all([
    getHero(),
    getFeaturedProducts(),
    getCommunity(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-end pb-12 px-8 overflow-hidden bg-[#111]">
        {hero.image_url && (
          <Image
            src={hero.image_url}
            alt={hero.title}
            fill
            priority
            sizes="100vw"
            quality={70}
            className="object-cover"
          />
        )}
        <div className="relative z-10">
          <h1 className="text-white text-sm md:text-base tracking-widest font-medium uppercase">
            {hero.title}
          </h1>
        </div>
      </section>

      {/* Porcelain pattern showcase (always shown; independent of catalog) */}
      {(
        <section className="relative isolate w-full h-[70vh] min-h-[460px] overflow-hidden bg-white">
          <PorcelainBackdrop />
          {/* Text over the drawing. mix-blend-difference inverts the text
              against whatever's beneath it: black on white, white over a line. */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center mix-blend-difference pointer-events-none">
            <h2 className="text-white text-3xl md:text-6xl tracking-[0.2em] font-medium uppercase">
              Shattered Porcelain
            </h2>
            <Link
              href="/shop"
              className="pointer-events-auto mt-6 text-white text-xs md:text-sm tracking-[0.3em] uppercase border-b border-white pb-1 hover:opacity-70 transition-opacity"
            >
              Shop Now
            </Link>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {featured.length > 0 && (
        <Reveal>
          <section className="max-w-[1800px] mx-auto px-4 md:px-8 pt-4 pb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Empty state */}
      {featured.length === 0 && (
        <section className="max-w-screen-xl mx-auto px-6 py-16 text-center">
          <p className="text-xs tracking-widest text-gray-400 uppercase">New arrivals coming soon</p>
        </section>
      )}

      {/* Community */}
      {community.length > 0 && (
        <Reveal>
          <section className="max-w-[1800px] mx-auto px-4 md:px-8 pb-14">
            <LookbookCarousel title="Community" images={community} aspectRatio="4/3" />
          </section>
        </Reveal>
      )}
    </>
  )
}
