'use client'

import { createClient } from '@/lib/supabase/client'
import { LookbookSection } from '@/lib/types'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialSections: LookbookSection[]
}

export function LookbookForm({ initialSections }: Props) {
  const [sections, setSections] = useState<LookbookSection[]>(
    initialSections.length ? initialSections : [{ title: '', images: [] }]
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  function updateSection(index: number, patch: Partial<LookbookSection>) {
    setSections(prev => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function addSection() {
    setSections(prev => [...prev, { title: '', images: [] }])
  }

  function removeSection(index: number) {
    setSections(prev => prev.filter((_, i) => i !== index))
  }

  function moveSection(index: number, dir: -1 | 1) {
    setSections(prev => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function save() {
    setSaving(true)
    const cleaned = sections
      .map(s => ({ title: s.title.trim(), images: s.images }))
      .filter(s => s.images.length > 0 || s.title.length > 0)
    const supabase = createClient()
    await supabase.from('site_settings').upsert({
      key: 'lookbook',
      value: cleaned,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <section key={i} className="bg-white border border-gray-100 rounded p-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              value={section.title}
              onChange={e => updateSection(i, { title: e.target.value })}
              className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm font-medium tracking-wide focus:outline-none focus:border-black"
              placeholder="Section title (e.g. F/W 26)"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveSection(i, -1)}
                disabled={i === 0}
                className="p-2 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400"
                title="Move section up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => moveSection(i, 1)}
                disabled={i === sections.length - 1}
                className="p-2 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400"
                title="Move section down"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => removeSection(i)}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Delete section"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <ImageUpload
            bucket="site"
            value={section.images}
            onChange={urls => updateSection(i, { images: urls })}
          />
          <p className="text-xs text-gray-400">
            {section.images.length} image{section.images.length === 1 ? '' : 's'} — hover an image to reorder or remove
          </p>
        </section>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="flex items-center gap-2 border border-dashed border-gray-300 rounded w-full py-4 justify-center text-sm text-gray-500 hover:border-black hover:text-black transition-colors"
      >
        <Plus size={16} />
        Add section
      </button>

      <button
        onClick={save}
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
      >
        {saved ? 'SAVED ✓' : saving ? 'SAVING...' : 'SAVE LOOKBOOK'}
      </button>
    </div>
  )
}
