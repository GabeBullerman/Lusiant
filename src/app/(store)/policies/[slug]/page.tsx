import { POLICIES } from '@/lib/policy-content'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return Object.keys(POLICIES).map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const policy = POLICIES[slug]
  return { title: policy ? `${policy.title} — Lusiant` : 'Lusiant' }
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const policy = POLICIES[slug]
  if (!policy) notFound()

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-10">{policy.title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        {policy.paragraphs.map((p, i) =>
          p.endsWith(':') ? (
            <h2 key={i} className="text-xs font-medium tracking-widest uppercase text-black pt-4">
              {p.replace(/:$/, '')}
            </h2>
          ) : (
            <p key={i}>{p}</p>
          )
        )}
      </div>
    </div>
  )
}
