import { createClient } from '@/lib/supabase/server'
import { normalizeLookbook } from '@/lib/types'
import { LookbookForm } from './LookbookForm'

async function getLookbook() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'lookbook')
    .single()
  return normalizeLookbook(data?.value)
}

export default async function AdminLookbookPage() {
  const sections = await getLookbook()

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-semibold tracking-wide mb-2">Lookbook</h1>
      <p className="text-sm text-gray-500 mb-8">
        Organize your lookbook into sections. Each section has a title and its own set of images.
        Drag images between sections to move them.
      </p>
      <LookbookForm initialSections={sections} />
    </div>
  )
}
