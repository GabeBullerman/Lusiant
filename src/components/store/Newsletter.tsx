'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('subscribers')
        .insert({ email: email.trim(), phone: phone.trim() || null })
      // Ignore duplicate-email errors — treat as success.
      if (error && !/duplicate|unique/i.test(error.message)) {
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p className="text-center text-sm tracking-wide text-gray-600">
        You’re in. Welcome to the club. ✓
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-black"
      />
      <div className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone number (optional)"
          className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-2.5 text-xs tracking-widest uppercase border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Enter'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-600 text-center">Something went wrong — please try again.</p>
      )}
    </form>
  )
}
