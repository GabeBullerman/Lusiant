import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'LUSIANT',
    template: '%s — LUSIANT',
  },
  description: 'Porcelain Inspired Denim',
  openGraph: {
    title: 'LUSIANT',
    description: 'Porcelain Inspired Denim',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
