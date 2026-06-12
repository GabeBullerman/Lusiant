import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { blurURL } from '@/lib/blur'

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0]
  const secondImage = product.images[1]

  const inv = product.size_inventory ?? {}
  const hasInventory = Object.keys(inv).length > 0
  const availableSizes = product.sizes.filter(s =>
    hasInventory ? (inv[s] ?? 0) > 0 : product.is_active
  )

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {image ? (
          <>
            <Image
              src={image}
              alt={product.name}
              fill
              placeholder="blur"
              blurDataURL={blurURL()}
              className={`object-cover transition-opacity duration-500 ${secondImage ? 'group-hover:opacity-0' : ''}`}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {secondImage && (
              <Image
                src={secondImage}
                alt={product.name}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
        {!product.is_active && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] tracking-widest px-2 py-1">
            SOLD OUT
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        <p className="text-sm tracking-wide font-medium">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm">${product.price.toFixed(2)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-400 line-through">${product.compare_at_price.toFixed(2)}</span>
          )}
        </div>
        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availableSizes.map(s => (
              <span key={s} className="text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 leading-none">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
