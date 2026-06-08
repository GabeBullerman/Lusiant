import { createClient } from '@/lib/supabase/server'
import type { Policy } from '@/lib/policy-content'

export interface StoreMode {
  /** When false, checkout is a visual-only demo: the form is disabled and no
   *  orders/payments are processed. Defaults to false (safe). */
  orders_enabled: boolean
}

export async function getStoreMode(): Promise<StoreMode> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'store_mode')
      .single()
    const v = data?.value as { orders_enabled?: unknown } | undefined
    return { orders_enabled: v?.orders_enabled === true }
  } catch {
    return { orders_enabled: false }
  }
}

/** Community gallery images (homepage), managed in Admin → Community. */
export async function getCommunity(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'community')
      .single()
    const v = data?.value
    if (Array.isArray(v)) return v.filter((u): u is string => typeof u === 'string')
    if (v && typeof v === 'object' && Array.isArray((v as { images?: unknown }).images)) {
      return ((v as { images: unknown[] }).images).filter((u): u is string => typeof u === 'string')
    }
    return []
  } catch {
    return []
  }
}

/**
 * Optional per-policy override stored in the DB (site_settings key
 * `policy_<slug>` as { title, paragraphs }). Lets the exact legal text live
 * outside the codebase and be edited without a deploy. Returns null if unset.
 */
export async function getPolicyOverride(slug: string): Promise<Policy | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', `policy_${slug}`)
      .single()
    const v = data?.value as { title?: unknown; paragraphs?: unknown } | undefined
    if (v && typeof v.title === 'string' && Array.isArray(v.paragraphs)) {
      return { title: v.title, paragraphs: v.paragraphs.filter((p): p is string => typeof p === 'string') }
    }
    return null
  } catch {
    return null
  }
}
