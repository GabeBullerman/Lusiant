'use client'

import { useEffect } from 'react'

export default function PopupClose() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: 'SUPABASE_AUTH_SUCCESS' }, window.location.origin)
      window.close()
    } else {
      // Opened directly (not as a popup) — just go to account
      window.location.href = '/account'
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen text-sm text-gray-400 tracking-widest uppercase">
      Signing in…
    </div>
  )
}
