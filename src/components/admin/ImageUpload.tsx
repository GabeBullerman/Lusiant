'use client'

import { createClient } from '@/lib/supabase/client'
import { X, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  bucket?: string
}

export function ImageUpload({ value, onChange, bucket = 'products' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError(null)

    const supabase = createClient()
    const urls: string[] = []
    let failed = 0
    let lastError = ''

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        urls.push(data.publicUrl)
      } else {
        failed++
        lastError = error.message
      }
    }

    if (urls.length) onChange([...value, ...urls])
    if (failed) setError(`${failed} image${failed === 1 ? '' : 's'} failed to upload: ${lastError}`)
    setUploading(false)
  }, [value, onChange, bucket])

  function removeImage(url: string) {
    onChange(value.filter(u => u !== url))
  }

  function reorder(from: number, to: number) {
    const next = [...value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {/* Upload area */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-gray-400 transition-colors py-8 gap-2">
        {uploading ? (
          <Loader2 size={24} className="animate-spin text-gray-400" />
        ) : (
          <>
            <Upload size={24} className="text-gray-400" />
            <span className="text-xs text-gray-500 tracking-wide">Click to upload images</span>
            <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB each</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square bg-gray-50 rounded overflow-hidden">
              <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-black text-white text-[9px] px-1 tracking-wide">MAIN</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => reorder(i, i - 1)}
                    className="bg-white rounded-full p-1 text-xs"
                    title="Move left"
                  >←</button>
                )}
                {i < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => reorder(i, i + 1)}
                    className="bg-white rounded-full p-1 text-xs"
                    title="Move right"
                  >→</button>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
