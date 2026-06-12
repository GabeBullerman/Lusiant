import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './SettingsForm'
import { getStoreMode, getShippingSettings } from '@/lib/site-content'
import { HeroSetting, AnnouncementSetting } from '@/lib/types'
import { DEFAULT_SHIPPING } from '@/lib/shipping'

async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select('*')
  const map: Record<string, unknown> = {}
  for (const row of data ?? []) map[row.key] = row.value
  return map
}

export default async function SettingsPage() {
  const [settings, storeMode, shippingSettings] = await Promise.all([
    getSettings(),
    getStoreMode(),
    getShippingSettings(),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold tracking-wide mb-8">Site Settings</h1>
      <SettingsForm
        hero={(settings.hero as HeroSetting) ?? {
          title: 'PORCELAIN INSPIRED DENIM',
          subtitle: 'New Collection',
          image_url: '',
          button_text: 'SHOP NOW',
          button_href: '/shop',
        }}
        announcement={(settings.announcement as AnnouncementSetting) ?? { text: 'FREE SHIPPING ON ALL U.S ORDERS', enabled: true }}
        ordersEnabled={storeMode.orders_enabled}
        shipping={shippingSettings ?? DEFAULT_SHIPPING}
      />
    </div>
  )
}
