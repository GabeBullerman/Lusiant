'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

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
    if (data.session) {
      router.push('/account')
      router.refresh()
    } else {
      setNeedsConfirm(true)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?popup=1`,
        skipBrowserRedirect: true,
      },
    })
    if (!data.url) return

    const w = 500, h = 620
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    window.open(data.url, 'google-oauth', `width=${w},height=${h},left=${left},top=${top}`)

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
        window.removeEventListener('message', onMessage)
        router.push('/account')
        router.refresh()
      }
    }
    window.addEventListener('message', onMessage)
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

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded py-2.5 text-sm hover:border-black transition-colors mb-5"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">or</span>
        </div>
      </div>

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
