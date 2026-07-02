import { createClient } from '@/lib/supabase/server'
import { Product } from '@/lib/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductDetail } from './ProductDetail'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lusiant.vercel.app'

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  return (data as Product) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product — Lusiant' }

  const description = product.description ?? `${product.name} by Lusiant.`
  const image = product.images[0]

  return {
    title: `${product.name} — Lusiant`,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `${SITE_URL}/shop/${slug}`,
      images: image ? [{ url: image, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const availability = product.is_active
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images,
    url: `${SITE_URL}/shop/${slug}`,
    brand: {
      '@type': 'Brand',
      name: 'Lusiant',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/shop/${slug}`,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Lusiant',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026'),
        }}
      />
      <ProductDetail product={product} />
    </>
  )
}
