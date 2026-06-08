import { createClient } from '@/lib/supabase/server'
import { LookbookSection, normalizeLookbook } from '@/lib/types'
import Image from 'next/image'

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
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-10">Lookbook</h1>
      {isEmpty ? (
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase py-20">Lookbook coming soon</p>
      ) : (
        <div className="space-y-16">
          {sections
            .filter(s => s.images.length > 0)
            .map((section, si) => (
              <section key={si}>
                {section.title && (
                  <h2 className="text-sm tracking-widest font-medium uppercase mb-6">{section.title}</h2>
                )}
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {section.images.map((url, i) => (
                    <div key={i} className="break-inside-avoid">
                      <div className="relative bg-gray-50">
                        <Image
                          src={url}
                          alt={section.title ? `${section.title} ${i + 1}` : `Lookbook ${i + 1}`}
                          width={800}
                          height={1000}
                          quality={60}
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="w-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  )
}
