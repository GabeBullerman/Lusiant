import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { CartItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
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

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
