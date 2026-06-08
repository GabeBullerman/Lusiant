'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  return (
    <button
      onClick={signOut}
      className="text-xs tracking-widest uppercase text-gray-500 hover:text-black transition-colors"
    >
      Sign out
    </button>
  )
}
