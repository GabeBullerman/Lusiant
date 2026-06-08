'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccountRegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // If email confirmation is required, there's no active session yet.
    if (data.session) {
      router.push('/account')
      router.refresh()
    } else {
      setNeedsConfirm(true)
      setLoading(false)
    }
  }

  if (needsConfirm) {
    return (
      <div className="max-w-sm mx-auto px-6 py-24 text-center">
        <h1 className="text-xs tracking-widest font-medium uppercase mb-4">Check your email</h1>
        <p className="text-sm text-gray-500">
          We sent a confirmation link to <span className="text-black">{email}</span>. Confirm it to finish creating your account.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-center text-xs tracking-widest font-medium uppercase mb-8">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded">{error}</div>
        )}
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
          className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
        <input
          type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)"
          className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
        <button
          type="submit" disabled={loading}
          className="w-full bg-black text-white py-3 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'CREATING…' : 'CREATE ACCOUNT'}
        </button>
      </form>
      <p className="text-center text-xs text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/account/login" className="text-black underline">Sign in</Link>
      </p>
    </div>
  )
}
