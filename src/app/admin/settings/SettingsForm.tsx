'use client'

import { createClient } from '@/lib/supabase/client'
import { HeroSetting, AnnouncementSetting, ShippingSetting } from '@/lib/types'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  hero: HeroSetting
  announcement: AnnouncementSetting
  ordersEnabled: boolean
  shipping: ShippingSetting
}

export function SettingsForm({ hero: initialHero, announcement: initialAnnouncement, ordersEnabled: initialOrders, shipping: initialShipping }: Props) {
  const [hero, setHero] = useState<HeroSetting>(initialHero)
  const [announcement, setAnnouncement] = useState<AnnouncementSetting>(initialAnnouncement)
  const [ordersEnabled, setOrdersEnabled] = useState<boolean>(initialOrders)
  const [shipping, setShipping] = useState<ShippingSetting>(initialShipping)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'hero', value: hero, updated_at: new Date().toISOString() }),
      supabase.from('site_settings').upsert({ key: 'announcement', value: announcement, updated_at: new Date().toISOString() }),
      supabase.from('site_settings').upsert({ key: 'store_mode', value: { orders_enabled: ordersEnabled }, updated_at: new Date().toISOString() }),
      supabase.from('site_settings').upsert({ key: 'shipping', value: shipping, updated_at: new Date().toISOString() }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Checkout / orders */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <h2 className="text-sm font-medium tracking-wide">Checkout</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ordersEnabled}
            onChange={e => setOrdersEnabled(e.target.checked)}
            className="w-4 h-4 mt-0.5"
          />
          <span className="text-sm">
            Accept live orders
            <span className="block text-xs text-gray-400 mt-0.5">
              Off = checkout is a visual-only demo (form disabled, no payments taken). On = real embedded Stripe checkout.
            </span>
          </span>
        </label>
      </section>

      {/* Shipping */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <h2 className="text-sm font-medium tracking-wide">Shipping</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Free shipping over ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={shipping.free_threshold}
                onChange={e => setShipping(s => ({ ...s, free_threshold: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Standard flat rate ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={shipping.standard_rate}
                onChange={e => setShipping(s => ({ ...s, standard_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Oversize surcharge ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={shipping.oversize_surcharge}
                onChange={e => setShipping(s => ({ ...s, oversize_surcharge: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Added per oversize item</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Mark individual products as &ldquo;Oversize&rdquo; in the product editor to apply the surcharge. Set standard rate to 0 to always offer free shipping.
        </p>
      </section>

      {/* Announcement bar */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <h2 className="text-sm font-medium tracking-wide">Announcement Bar</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={announcement.enabled}
            onChange={e => setAnnouncement(a => ({ ...a, enabled: e.target.checked }))}
            className="w-4 h-4"
          />
          <span className="text-sm">Show announcement bar</span>
        </label>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Message</label>
          <input
            value={announcement.text}
            onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
            placeholder="FREE SHIPPING ON ALL U.S ORDERS"
          />
        </div>
      </section>

      {/* Hero */}
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <h2 className="text-sm font-medium tracking-wide">Hero Banner</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Hero Image</label>
          <ImageUpload
            bucket="site"
            value={hero.image_url ? [hero.image_url] : []}
            onChange={urls => setHero(h => ({ ...h, image_url: urls[0] ?? '' }))}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Title</label>
          <input
            value={hero.title}
            onChange={e => setHero(h => ({ ...h, title: e.target.value }))}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
            placeholder="PORCELAIN INSPIRED DENIM"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Button Text</label>
            <input
              value={hero.button_text}
              onChange={e => setHero(h => ({ ...h, button_text: e.target.value }))}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="SHOP NOW"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Button Link</label>
            <input
              value={hero.button_href}
              onChange={e => setHero(h => ({ ...h, button_href: e.target.value }))}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="/shop"
            />
          </div>
        </div>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
      >
        {saved ? 'SAVED ✓' : saving ? 'SAVING...' : 'SAVE SETTINGS'}
      </button>
    </div>
  )
}
