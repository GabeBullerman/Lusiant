'use client'

import { createClient } from '@/lib/supabase/client'
import { LookbookSection } from '@/lib/types'
import { ChevronLeft, ChevronRight, Trash2, Plus, Upload, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialSections: LookbookSection[]
}

interface DragSource {
  section: number
  index: number
}

export function LookbookForm({ initialSections }: Props) {
  const [sections, setSections] = useState<LookbookSection[]>(
    initialSections.length ? initialSections : [{ title: '', images: [] }]
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingSection, setUploadingSection] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState<DragSource | null>(null)
  const [dropTarget, setDropTarget] = useState<{ section: number; index: number } | null>(null)
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

  function removeImage(sectionIndex: number, url: string) {
    setSections(prev =>
      prev.map((s, i) => (i === sectionIndex ? { ...s, images: s.images.filter(u => u !== url) } : s))
    )
  }

  // Move an image from one (section,index) to another. Used by drag-and-drop.
  function moveImage(from: DragSource, to: { section: number; index: number }) {
    setSections(prev => {
      const next = prev.map(s => ({ ...s, images: [...s.images] }))
      const moved = next[from.section]?.images[from.index]
      if (moved === undefined) return prev
      next[from.section].images.splice(from.index, 1)
      let targetIndex = to.index
      if (from.section === to.section && from.index < to.index) targetIndex -= 1
      const clamped = Math.max(0, Math.min(targetIndex, next[to.section].images.length))
      next[to.section].images.splice(clamped, 0, moved)
      return next
    })
  }

  function handleDropOn(section: number, index: number) {
    if (drag) moveImage(drag, { section, index })
    setDrag(null)
    setDropTarget(null)
  }

  async function uploadToSection(sectionIndex: number, files: FileList | null) {
    if (!files?.length) return
    setUploadingSection(sectionIndex)
    setError(null)
    const supabase = createClient()
    const urls: string[] = []
    let lastError = ''
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('site').upload(path, file, { upsert: false })
      if (!upErr) {
        const { data } = supabase.storage.from('site').getPublicUrl(path)
        urls.push(data.publicUrl)
      } else {
        lastError = upErr.message
      }
    }
    if (urls.length) {
      setSections(prev =>
        prev.map((s, i) => (i === sectionIndex ? { ...s, images: [...s.images, ...urls] } : s))
      )
    }
    if (lastError) setError(`Some images failed to upload: ${lastError}`)
    setUploadingSection(null)
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
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {sections.map((section, si) => (
          <section
            key={si}
            className="bg-white border border-gray-100 rounded p-6 space-y-4"
            onDragOver={e => {
              if (drag) e.preventDefault()
            }}
            onDrop={e => {
              e.preventDefault()
              handleDropOn(si, section.images.length)
            }}
          >
            <div className="flex items-center gap-2">
              <input
                value={section.title}
                onChange={e => updateSection(si, { title: e.target.value })}
                className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm font-medium tracking-wide focus:outline-none focus:border-black"
                placeholder="Section title (e.g. F/W 26)"
              />
              <button
                type="button"
                onClick={() => moveSection(si, -1)}
                disabled={si === 0}
                className="p-2 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400"
                title="Move section left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => moveSection(si, 1)}
                disabled={si === sections.length - 1}
                className="p-2 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400"
                title="Move section right"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => removeSection(si)}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Delete section"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Upload dropzone */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-gray-400 transition-colors py-6 gap-1.5">
              {uploadingSection === si ? (
                <Loader2 size={20} className="animate-spin text-gray-400" />
              ) : (
                <>
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-500 tracking-wide">Click to upload images</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => uploadToSection(si, e.target.files)}
                disabled={uploadingSection === si}
              />
            </label>

            {/* Image grid (draggable) */}
            {section.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {section.images.map((url, i) => {
                  const isTarget = dropTarget?.section === si && dropTarget?.index === i
                  return (
                    <div
                      key={url}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', url)
                        setDrag({ section: si, index: i })
                      }}
                      onDragEnd={() => {
                        setDrag(null)
                        setDropTarget(null)
                      }}
                      onDragOver={e => {
                        if (drag) {
                          e.preventDefault()
                          e.stopPropagation()
                          setDropTarget({ section: si, index: i })
                        }
                      }}
                      onDrop={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDropOn(si, i)
                      }}
                      className={`relative group aspect-square bg-gray-50 rounded overflow-hidden cursor-grab active:cursor-grabbing ring-2 transition-shadow ${
                        isTarget ? 'ring-black' : 'ring-transparent'
                      } ${drag?.section === si && drag?.index === i ? 'opacity-40' : ''}`}
                    >
                      <Image src={url} alt="" fill className="object-cover pointer-events-none" sizes="160px" />
                      <button
                        type="button"
                        onClick={() => removeImage(si, url)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <p className="text-xs text-gray-400">
              {section.images.length} image{section.images.length === 1 ? '' : 's'} — drag to reorder or move to another section
            </p>
          </section>
        ))}
      </div>

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
