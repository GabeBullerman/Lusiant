'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccountLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/account')
      router.refresh()
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-center text-xs tracking-widest font-medium uppercase mb-8">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded">{error}</div>
        )}
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
          className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
        <input
          type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
          className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
        <button
          type="submit" disabled={loading}
          className="w-full bg-black text-white py-3 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>
      <p className="text-center text-xs text-gray-500 mt-6">
        New here?{' '}
        <Link href="/account/register" className="text-black underline">Create an account</Link>
      </p>
    </div>
  )
}
