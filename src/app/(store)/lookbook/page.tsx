import { createClient } from '@/lib/supabase/server'
import { LookbookSection, normalizeLookbook } from '@/lib/types'
import { LookbookCarousel } from '@/components/store/LookbookCarousel'

async function getLookbookSections(): Promise<LookbookSection[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'lookbook')
      .single()
    return normalizeLookbook(data?.value)
  } catch {
    return []
  }
}

export default async function LookbookPage() {
  const sections = await getLookbookSections()
  const isEmpty = sections.every(s => s.images.length === 0)

  return (
    <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-6">Lookbook</h1>
      {isEmpty ? (
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase py-20">Lookbook coming soon</p>
      ) : (
        <div className="space-y-14">
          {sections
            .filter(s => s.images.length > 0)
            .map((section, si) => (
              <LookbookCarousel key={si} title={section.title} images={section.images} />
            ))}
        </div>
      )}
    </div>
  )
}
