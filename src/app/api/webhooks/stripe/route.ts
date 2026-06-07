import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const supabase = await createClient()
      const items = JSON.parse(session.metadata?.items ?? '[]')
      const shipping = (session as unknown as Record<string, unknown>).shipping_details as {
        name?: string
        address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string }
      } | null

      await supabase.from('orders').insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email ?? '',
        customer_name: session.customer_details?.name ?? '',
        items,
        subtotal: (session.amount_subtotal ?? 0) / 100,
        total: (session.amount_total ?? 0) / 100,
        status: 'paid',
        shipping_address: shipping?.address
          ? {
              name: shipping.name ?? '',
              line1: shipping.address.line1 ?? '',
              line2: shipping.address.line2 ?? '',
              city: shipping.address.city ?? '',
              state: shipping.address.state ?? '',
              postal_code: shipping.address.postal_code ?? '',
              country: shipping.address.country ?? '',
            }
          : null,
      })
    } catch (err) {
      console.error('Failed to save order:', err)
    }
  }

  return NextResponse.json({ received: true })
}
