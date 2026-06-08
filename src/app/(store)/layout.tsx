import { CartProvider } from '@/components/store/CartContext'
import { CartSlider } from '@/components/store/CartSlider'
import { Navbar } from '@/components/store/Navbar'
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

      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between gap-8 text-xs tracking-widest text-gray-500 uppercase">
          <span className="font-bold text-black text-lg tracking-[0.3em]">LS&NT</span>
          <div className="flex gap-8">
            <a href="https://instagram.com/lusiant" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Instagram</a>
            <a href="/contact" className="hover:text-black transition-colors">Contact Us</a>
          </div>
          <span>© {new Date().getFullYear()} Lusiant. All rights reserved.</span>
        </div>
      </footer>
    </CartProvider>
  )
}
