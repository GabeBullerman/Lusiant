'use client'

import { Product } from '@/lib/types'
import { useCart } from '@/components/store/CartContext'
import { blurURL } from '@/lib/blur'
import Image from 'next/image'
import { useState } from 'react'

export function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const inv = product.size_inventory ?? {}
  const hasInventory = Object.keys(inv).length > 0

  function sizeInStock(size: string): boolean {
    if (!hasInventory) return product.is_active
    return (inv[size] ?? 0) > 0
  }

  const selectedSizeInStock = selectedSize ? sizeInStock(selectedSize) : true

  function handleAddToCart() {
    if (!selectedSize) return
    if (!selectedSizeInStock) return
    addItem(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const addLabel = added
    ? 'ADDED TO CART ✓'
    : product.sizes.length > 0 && !selectedSize
    ? 'SELECT A SIZE'
    : !selectedSizeInStock
    ? 'OUT OF STOCK'
    : 'ADD TO CART'

  return (
    <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-28 md:pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] bg-gray-50">
            {product.images[activeImage] && (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                priority
                placeholder="blur"
                blurDataURL={blurURL()}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-20 bg-gray-50 border-2 transition-colors ${activeImage === i ? 'border-black' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6 pt-2">
          <div>
            <h1 className="text-lg font-medium tracking-wide">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-base">${product.price.toFixed(2)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-gray-400 line-through">${product.compare_at_price.toFixed(2)}</span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {product.sizes.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => {
                  const inStock = sizeInStock(size)
                  return (
                    <button
                      key={size}
                      onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`px-4 py-2 text-sm border transition-colors ${
                        !inStock
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.sizes.length > 0 && (!selectedSize || !selectedSizeInStock)}
            className="w-full bg-black text-white py-4 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addLabel}
          </button>

          {!product.is_active && (
            <p className="text-sm text-red-500 tracking-wide">This item is sold out</p>
          )}
        </div>
      </div>

      {/* Mobile sticky add-to-cart bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-medium whitespace-nowrap">${product.price.toFixed(2)}</span>
        <button
          onClick={handleAddToCart}
          disabled={product.sizes.length > 0 && (!selectedSize || !selectedSizeInStock)}
          className="flex-1 bg-black text-white py-3 text-xs tracking-widest font-medium disabled:opacity-40"
        >
          {addLabel}
        </button>
      </div>
    </div>
  )
}
