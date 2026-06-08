import { CartProvider } from '@/components/store/CartContext'
import { CartSlider } from '@/components/store/CartSlider'
import { ClubTab } from '@/components/store/ClubTab'
import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import { createClient } from '@/lib/supabase/server'
import { getCollections } from '@/lib/collections'
import { AnnouncementSetting } from '@/lib/types'

async function getAnnouncement(): Promise<AnnouncementSetting | undefined> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement')
      .single()
    return data?.value as AnnouncementSetting | undefined
  } catch {
    return undefined
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [announcement, collections] = await Promise.all([getAnnouncement(), getCollections()])

  return (
    <CartProvider>
      {announcement?.enabled && (
        <div className="bg-black text-white text-center text-xs py-2 tracking-widest font-medium">
          {announcement.text}
        </div>
      )}

      {/* Positioning context so the homepage nav can float over the hero */}
      <div className="relative">
        <Navbar collections={collections} />
        <main className="flex-1">{children}</main>
      </div>

      <CartSlider />
      <ClubTab />

      <Footer />
    </CartProvider>
  )
}
