'use client'

import { useCart } from '@/components/store/CartContext'
import { calcShipping } from '@/lib/shipping'
import { ShippingSetting } from '@/lib/types'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback } from 'react'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function DisabledForm() {
  const field =
    'w-full border border-gray-200 rounded px-3 py-2.5 text-sm bg-gray-50 text-gray-400'
  return (
    <div className="space-y-6 opacity-70 select-none" aria-disabled>
      <fieldset disabled className="space-y-6">
        <div>
          <h2 className="text-xs tracking-widest font-medium uppercase mb-3">Contact</h2>
          <input className={field} placeholder="Email" />
        </div>
        <div>
          <h2 className="text-xs tracking-widest font-medium uppercase mb-3">Delivery</h2>
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="First name" />
            <input className={field} placeholder="Last name" />
            <input className={`${field} col-span-2`} placeholder="Address" />
            <input className={field} placeholder="City" />
            <input className={field} placeholder="State" />
            <input className={field} placeholder="ZIP code" />
            <input className={field} placeholder="Country" />
          </div>
        </div>
        <div>
          <h2 className="text-xs tracking-widest font-medium uppercase mb-3">Payment</h2>
          <div className="grid grid-cols-2 gap-3">
            <input className={`${field} col-span-2`} placeholder="Card number" />
            <input className={field} placeholder="MM / YY" />
            <input className={field} placeholder="CVC" />
          </div>
        </div>
        <button
          className="w-full bg-black text-white py-4 text-sm tracking-widest font-medium opacity-50 cursor-not-allowed"
          disabled
        >
          PAY NOW
        </button>
      </fieldset>
    </div>
  )
}

interface Props {
  ordersEnabled: boolean
  shippingSettings: ShippingSetting
}

export function CheckoutClient({ ordersEnabled, shippingSettings }: Props) {
  const { items, totalPrice } = useCart()
  const shippingAmount = calcShipping(items, shippingSettings)
  const orderTotal = totalPrice + shippingAmount

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Checkout failed')
    return data.client_secret as string
  }, [items])

  if (items.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-24 text-center">
        <p className="text-sm tracking-widest uppercase text-gray-400 mb-6">Your cart is empty</p>
        <Link
          href="/shop"
          className="inline-block border border-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-xs tracking-widest font-medium uppercase mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left: form / embedded checkout */}
        <div>
          {!ordersEnabled && (
            <div className="mb-6 border border-gray-300 bg-gray-50 rounded p-4 flex gap-3">
              <Lock size={16} className="mt-0.5 shrink-0 text-gray-500" />
              <p className="text-xs leading-relaxed text-gray-600">
                <span className="font-medium text-black">This is a demonstration storefront.</span>{' '}
                Checkout is disabled — no orders are accepted and no payment will be processed.
              </p>
            </div>
          )}

          {ordersEnabled && stripePromise ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <DisabledForm />
          )}
        </div>

        {/* Right: order summary */}
        <div className="lg:border-l lg:border-gray-100 lg:pl-20">
          <h2 className="text-xs tracking-widest font-medium uppercase mb-6">Order Summary</h2>
          <div className="space-y-5">
            {items.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                <div className="w-16 h-20 bg-gray-50 relative shrink-0">
                  {item.product.images[0] && (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium tracking-wide truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Size: {item.size} · Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-6 pt-6 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span className="tracking-wider">Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span className="tracking-wider">Shipping</span>
              <span>
                {shippingAmount === 0
                  ? <span className="text-green-600">Free</span>
                  : `$${shippingAmount.toFixed(2)}`}
              </span>
            </div>
            {shippingAmount === 0 && totalPrice < shippingSettings.free_threshold && (
              <p className="text-xs text-green-600">
                Free shipping applied
              </p>
            )}
            {shippingAmount > 0 && (
              <p className="text-xs text-gray-400">
                Free shipping on orders over ${shippingSettings.free_threshold.toFixed(0)}
              </p>
            )}
            <div className="flex justify-between font-medium pt-2 text-base border-t border-gray-100 mt-2">
              <span className="tracking-wider">Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
