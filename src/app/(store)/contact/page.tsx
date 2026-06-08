'use client'

import { useState } from 'react'

// TODO: update to the brand's real support inbox if different.
const CONTACT_EMAIL = 'hello@lusiant.co'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = `Website inquiry${name ? ` from ${name}` : ''}`
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-3 text-center">Contact Us</h1>
      <p className="text-center text-sm text-gray-500 mb-10">
        Questions about an order, sizing, or anything else? Send us a note and we&apos;ll get back to you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 tracking-wide uppercase">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 tracking-wide uppercase">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 tracking-wide uppercase">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={6}
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
            placeholder="How can we help?"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white px-8 py-3 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors"
        >
          SEND MESSAGE
        </button>
      </form>

      <div className="mt-10 text-center text-xs tracking-widest uppercase text-gray-500 space-y-2">
        <p>
          Or email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-black hover:opacity-60 transition-opacity">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>
          <a
            href="https://instagram.com/lusiant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-60 transition-opacity"
          >
            @lusiant on Instagram
          </a>
        </p>
      </div>
    </div>
  )
}
