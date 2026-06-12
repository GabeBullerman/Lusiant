import { createClient } from '@/lib/supabase/server'
import { Order } from '@/lib/types'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  let order: Order | null = null
  if (session_id) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', session_id)
        .single()
      order = data as Order | null
    } catch {}
  }

  const shortId = order ? order.id.slice(-8).toUpperCase() : null
  const shippingCost = order ? order.total - order.subtotal : 0

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <CheckCircle size={48} strokeWidth={1.5} className="text-green-500 mb-6 mx-auto" />
        <h1 className="text-lg font-medium tracking-wide mb-2">Order Confirmed</h1>
        {shortId && (
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Order #{shortId}</p>
        )}
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          {order
            ? `Thank you, ${order.customer_name || 'for your order'}. A confirmation will be sent to ${order.customer_email}.`
            : "Thank you for your order. You'll receive a confirmation email shortly."}
        </p>
      </div>

      {order && (
        <>
          {/* Items */}
          <div className="border border-gray-100 rounded p-5 mb-3">
            <h2 className="text-xs tracking-widest font-medium uppercase mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Size {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm shrink-0 ml-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border border-gray-100 rounded p-5 mb-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{shippingCost <= 0.01 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="border border-gray-100 rounded p-5 mb-8 text-sm">
              <h2 className="text-xs tracking-widest font-medium uppercase mb-3">Ships To</h2>
              <p className="text-gray-600">{order.shipping_address.name}</p>
              <p className="text-gray-600">
                {order.shipping_address.line1}
                {order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}
              </p>
              <p className="text-gray-600">
                {order.shipping_address.city}, {order.shipping_address.state}{' '}
                {order.shipping_address.postal_code}
              </p>
            </div>
          )}
        </>
      )}

      <div className="text-center">
        <Link
          href="/shop"
          className="inline-block border border-black text-sm tracking-widest px-8 py-3 hover:bg-black hover:text-white transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  )
}
