'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { ImageUpload } from './ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Product } from '@/lib/types'
import { Trash2, Plus } from 'lucide-react'

interface FormData {
  name: string
  slug: string
  description: string
  price: string
  compare_at_price: string
  category: string
  sizes: { value: string; qty: string }[]
  images: string[]
  is_active: boolean
  is_featured: boolean
  shipping_class: 'standard' | 'oversize'
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38']

export function ProductForm({ product, collections = [] }: { product?: Product; collections?: string[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    defaultValues: product
      ? {
          ...product,
          description: product.description ?? '',
          price: product.price.toString(),
          compare_at_price: product.compare_at_price?.toString() ?? '',
          shipping_class: product.shipping_class ?? 'standard',
          sizes: product.sizes.map(s => ({
            value: s,
            qty: String((product.size_inventory ?? {})[s] ?? 0),
          })),
        }
      : {
          name: '',
          slug: '',
          description: '',
          price: '',
          compare_at_price: '',
          category: 'uncategorized',
          sizes: [],
          images: [],
          is_active: true,
          is_featured: false,
          shipping_class: 'standard',
        },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'sizes' })
  const images = watch('images')

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function validate(data: FormData): string | null {
    if (!data.name.trim()) return 'Name is required'
    if (!data.slug.trim()) return 'Slug is required'
    if (!/^[a-z0-9-]+$/.test(data.slug)) return 'Slug: only lowercase letters, numbers, hyphens'
    const price = parseFloat(data.price)
    if (isNaN(price) || price <= 0) return 'Valid price is required'
    return null
  }

  async function onSubmit(data: FormData) {
    const err = validate(data)
    if (err) { setError(err); return }

    setSaving(true)
    setError('')

    const sizesList = data.sizes.map(s => s.value).filter(Boolean)
    const sizeInventory = Object.fromEntries(
      data.sizes.filter(s => s.value).map(s => [s.value, parseInt(s.qty) || 0])
    )

    const payload = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description || null,
      price: parseFloat(data.price),
      compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
      category: data.category || 'uncategorized',
      sizes: sizesList,
      size_inventory: sizeInventory,
      images: data.images,
      is_active: data.is_active,
      is_featured: data.is_featured,
      shipping_class: data.shipping_class,
      stock_quantity: Object.values(sizeInventory).reduce((a, b) => a + b, 0),
      updated_at: new Date().toISOString(),
    }

    const supabase = createClient()

    if (product?.id) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
      )}

      {/* Basic info */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-5">
        <h2 className="text-sm font-medium tracking-wide">Product Info</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1.5">Name *</label>
            <input
              {...register('name', {
                onChange: (e) => {
                  if (!product) setValue('slug', autoSlug(e.target.value))
                },
              })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="e.g. Porcelain Denim Pants"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Slug *</label>
            <input
              {...register('slug')}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black font-mono"
              placeholder="porcelain-denim-pants"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Collection</label>
            <input
              {...register('category')}
              list="collection-options"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="Pick or type a collection…"
            />
            <datalist id="collection-options">
              {collections.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="text-xs text-gray-400 mt-1">
              Products sharing a collection appear together under Shop in the nav.
            </p>
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black resize-none"
              placeholder="Product description..."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-5">
        <h2 className="text-sm font-medium tracking-wide">Pricing & Shipping</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price')}
                className="w-full border border-gray-200 rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Compare at price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('compare_at_price')}
                className="w-full border border-gray-200 rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Shipping class</label>
            <select
              {...register('shipping_class')}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
            >
              <option value="standard">Standard</option>
              <option value="oversize">Oversize (+surcharge)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Set in Admin → Settings</p>
          </div>
        </div>
      </section>

      {/* Sizes + Inventory */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium tracking-wide">Sizes & Inventory</h2>
          <p className="text-xs text-gray-400 mt-1">Click a size to add it, then set the stock quantity for each.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map(size => {
            const active = fields.some(f => f.value === size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  if (active) {
                    const idx = fields.findIndex(f => f.value === size)
                    remove(idx)
                  } else {
                    append({ value: size, qty: '0' })
                  }
                }}
                className={`px-3 py-1.5 text-xs border rounded transition-colors ${active ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}
              >
                {size}
              </button>
            )
          })}
        </div>

        {fields.length > 0 && (
          <div className="border border-gray-100 rounded overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_32px] gap-0 text-xs text-gray-400 px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span>Size</span>
              <span>Stock</span>
              <span />
            </div>
            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_80px_32px] gap-0 items-center px-4 py-2 border-b border-gray-50 last:border-0">
                <input
                  {...register(`sizes.${i}.value`)}
                  className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-black w-24"
                />
                <input
                  type="number"
                  min="0"
                  {...register(`sizes.${i}.qty`)}
                  className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-black w-16"
                />
                <button type="button" onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 flex justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => append({ value: '', qty: '0' })}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-black mt-1"
        >
          <Plus size={12} /> Add custom size
        </button>
      </section>

      {/* Images */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <h2 className="text-sm font-medium tracking-wide">Images</h2>
        <p className="text-xs text-gray-400">First image is the main image. Click arrows to reorder.</p>
        <ImageUpload value={images ?? []} onChange={urls => setValue('images', urls)} />
      </section>

      {/* Visibility */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <h2 className="text-sm font-medium tracking-wide">Visibility</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="w-4 h-4" />
            <div>
              <p className="text-sm">Active / In Stock</p>
              <p className="text-xs text-gray-400">Unchecked = shows as &ldquo;Sold Out&rdquo;</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('is_featured')} className="w-4 h-4" />
            <div>
              <p className="text-sm">Featured (Best Sellers)</p>
              <p className="text-xs text-gray-400">Shows on the home page</p>
            </div>
          </label>
        </div>
      </section>

      <div className="flex gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-8 py-3 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {saving ? 'SAVING...' : product ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-8 py-3 text-sm tracking-widest border border-gray-200 hover:border-black transition-colors"
        >
          CANCEL
        </button>
      </div>
    </form>
  )
}
