import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

interface LookbookImage {
  url: string
  caption?: string
}

async function getLookbookImages(): Promise<LookbookImage[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'lookbook')
      .single()
    return (data?.value as LookbookImage[]) ?? []
  } catch {
    return []
  }
}

export default async function LookbookPage() {
  const images = await getLookbookImages()

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-10">Lookbook</h1>
      {images.length === 0 ? (
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase py-20">Lookbook coming soon</p>
      ) : (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <div key={i} className="break-inside-avoid">
              <div className="relative bg-gray-50">
                <Image
                  src={img.url}
                  alt={img.caption ?? `Lookbook ${i + 1}`}
                  width={800}
                  height={1000}
                  className="w-full object-cover"
                />
              </div>
              {img.caption && (
                <p className="text-xs text-gray-500 mt-2 tracking-wide">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
