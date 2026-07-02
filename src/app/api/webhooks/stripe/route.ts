import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !webhookSecret) {
    console.error('Webhook missing signature or secret')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const supabase = await createClient()
      const items = JSON.parse(session.metadata?.items ?? '[]') as Array<{
        product_id: string
        product_name: string
        size: string
        price: number
        quantity: number
        image: string
      }>

      const shippingCents = parseInt(session.metadata?.shipping_amount ?? '0')
      const itemsSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
      const total = (session.amount_total ?? 0) / 100

      const shipping = (session as unknown as Record<string, unknown>).shipping_details as {
        name?: string
        address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string }
      } | null

      const { error: insertError } = await supabase.from('orders').insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email ?? '',
        customer_name: session.customer_details?.name ?? '',
        items,
        subtotal: itemsSubtotal,
        total,
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

      if (insertError) {
        // 23505 = unique_violation on stripe_session_id: Stripe re-delivered an
        // event we already processed. Acknowledge without decrementing again.
        if (insertError.code === '23505') {
          return NextResponse.json({ received: true })
        }
        // A real insert failure — return non-2xx so Stripe retries instead of
        // dropping the order, and don't touch inventory.
        console.error('Failed to save order:', insertError)
        return NextResponse.json({ error: 'Order insert failed' }, { status: 500 })
      }

      // Order was newly created — decrement inventory exactly once.
      await decrementInventory(supabase, items)
    } catch (err) {
      console.error('Webhook handler error:', err)
      return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

async function decrementInventory(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  items: Array<{ product_id: string; size: string; quantity: number }>
) {
  for (const item of items) {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('size_inventory')
        .eq('id', item.product_id)
        .single()

      if (!product) continue

      const inv = (product.size_inventory ?? {}) as Record<string, number>
      if (Object.keys(inv).length === 0) continue

      const updated = {
        ...inv,
        [item.size]: Math.max(0, (inv[item.size] ?? 0) - item.quantity),
      }

      await supabase
        .from('products')
        .update({ size_inventory: updated, updated_at: new Date().toISOString() })
        .eq('id', item.product_id)
    } catch (err) {
      console.error(`Failed to decrement inventory for product ${item.product_id}:`, err)
    }
  }
}
