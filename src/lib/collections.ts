import { createClient } from '@/lib/supabase/server'

/**
 * Returns the distinct list of collections (product `category` values) that
 * have at least one active product. Used to build the Shop nav dropdown,
 * the shop filter chips, and the admin collection selector.
 */
export async function getCollections(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('category').eq('is_active', true)
    const set = new Set<string>()
    for (const row of data ?? []) {
      const c = (row.category ?? '').trim()
      if (c && c.toLowerCase() !== 'uncategorized') set.add(c)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

/** All collections including those whose products are inactive — for the admin selector. */
export async function getAllCollections(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('category')
    const set = new Set<string>()
    for (const row of data ?? []) {
      const c = (row.category ?? '').trim()
      if (c && c.toLowerCase() !== 'uncategorized') set.add(c)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}
