'use client'

import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CommunityForm({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('site_settings').upsert({
      key: 'community',
      value: images,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-100 rounded p-6 space-y-4">
        <ImageUpload bucket="site" value={images} onChange={setImages} />
        <p className="text-xs text-gray-400">
          {images.length} photo{images.length === 1 ? '' : 's'} — hover an image to reorder or remove
        </p>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
      >
        {saved ? 'SAVED ✓' : saving ? 'SAVING...' : 'SAVE COMMUNITY'}
      </button>
    </div>
  )
}
