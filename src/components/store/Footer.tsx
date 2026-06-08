import Link from 'next/link'
import { Newsletter } from './Newsletter'
import { PaymentIcons } from './PaymentIcons'
import { POLICY_LINKS } from '@/lib/policy-content'

export function Footer() {
  return (
    <footer className="border-t border-gray-100">
      {/* Join the club */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-sm tracking-widest font-medium uppercase mb-2">Join the Club</h2>
        <p className="text-[11px] tracking-widest uppercase text-gray-500 mb-2">
          Get early access · Insider information · Special offers
        </p>
        <p className="text-[10px] text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
          By submitting, you agree to receive marketing emails from Lusiant. Consent isn’t required for purchase.
          Message rates may apply. Unsubscribe anytime.
        </p>
        <Newsletter />
      </section>

      {/* Policy links */}
      <nav className="px-6 pb-6">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] tracking-widest uppercase text-gray-500">
          {POLICY_LINKS.map(({ slug, label }) => (
            <li key={slug}>
              <Link href={`/policies/${slug}`} className="hover:text-black transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Payment methods */}
      <div className="px-6 pb-6">
        <PaymentIcons />
      </div>

      {/* Bottom bar */}
      <div className="px-6 pb-10 flex flex-col items-center gap-3">
        <a
          href="https://instagram.com/lusiant.sp"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] tracking-widest uppercase text-gray-500 hover:text-black transition-colors"
        >
          @lusiant.sp
        </a>
        <span className="text-[11px] tracking-widest uppercase text-gray-400">
          © {new Date().getFullYear()} Lusiant. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
