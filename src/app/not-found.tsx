import Link from 'next/link'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
      <span className="font-bold tracking-[0.3em] text-lg mb-10">LS&NT</span>
      <p className="text-6xl md:text-7xl font-medium tracking-[0.2em]">404</p>
      <p className="mt-4 text-xs tracking-widest uppercase text-gray-400">
        This page couldn’t be found
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="border border-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
        >
          Home
        </Link>
        <Link
          href="/shop"
          className="border border-gray-200 px-8 py-3 text-xs tracking-widest uppercase hover:border-black transition-colors"
        >
          Shop
        </Link>
      </div>
    </main>
  )
}
