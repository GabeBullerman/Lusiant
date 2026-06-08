import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getStoreMode } from '@/lib/site-content'
import { CartItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    // Hard gate: never create a real payment session while orders are disabled.
    const { orders_enabled } = await getStoreMode()
    if (!orders_enabled) {
      return NextResponse.json({ error: 'Orders are currently disabled' }, { status: 403 })
    }

    const { items }: { items: CartItem[] } = await req.json()
    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const stripe = getStripe()

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.product.name} — Size ${item.size}`,
          images: item.product.images.slice(0, 1),
          metadata: {
            product_id: item.product.id,
            size: item.size,
          },
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }))

    // Embedded checkout: returns a client_secret that mounts on our own site
    // (ui_mode: 'embedded') — the customer never leaves the site for Stripe.
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            size: i.size,
            price: i.product.price,
            quantity: i.quantity,
            image: i.product.images[0] ?? '',
          }))
        ),
      },
    })

    return NextResponse.json({ client_secret: session.client_secret })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
