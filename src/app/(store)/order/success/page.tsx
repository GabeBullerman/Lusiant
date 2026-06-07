import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <CheckCircle size={48} strokeWidth={1.5} className="text-green-500 mb-6" />
      <h1 className="text-lg font-medium tracking-wide mb-3">Order Confirmed</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        Thank you for your order. You'll receive a confirmation email shortly.
      </p>
      <Link
        href="/shop"
        className="border border-black text-sm tracking-widest px-8 py-3 hover:bg-black hover:text-white transition-colors"
      >
        CONTINUE SHOPPING
      </Link>
    </div>
  )
}
