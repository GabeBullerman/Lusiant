import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getStoreMode, getShippingSettings } from '@/lib/site-content'
import { createClient } from '@/lib/supabase/server'
import { calcShippingFromItems } from '@/lib/shipping'
import { CartItem } from '@/lib/types'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const { orders_enabled } = await getStoreMode()
    if (!orders_enabled) {
      return NextResponse.json({ error: 'Orders are currently disabled' }, { status: 403 })
    }

    const { items }: { items: CartItem[] } = await req.json()
    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock against current DB inventory
    const supabase = await createClient()
    const productIds = [...new Set(items.map(i => i.product.id))]
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, is_active, size_inventory, shipping_class, price')
      .in('id', productIds)

    const productMap = Object.fromEntries((dbProducts ?? []).map(p => [p.id, p]))

    for (const item of items) {
      const p = productMap[item.product.id]
      if (!p?.is_active) {
        return NextResponse.json(
          { error: `"${item.product.name}" is no longer available` },
          { status: 400 }
        )
      }
      const inv = p.size_inventory as Record<string, number> | null
      if (inv && Object.keys(inv).length > 0) {
        const available = inv[item.size] ?? 0
        if (item.quantity > available) {
          return NextResponse.json(
            { error: `"${item.product.name}" (${item.size}) only has ${available} left in stock` },
            { status: 400 }
          )
        }
      }
    }

    // Calculate shipping using DB-verified shipping_class
    const shippingSettings = await getShippingSettings()
    const shipItems = items.map(item => ({
      price: item.product.price,
      quantity: item.quantity,
      shipping_class: productMap[item.product.id]?.shipping_class ?? 'standard',
    }))
    const shippingAmount = calcShippingFromItems(shipItems, shippingSettings)

    const stripe = getStripe()

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
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
        unit_amount: Math.round(productMap[item.product.id].price * 100),
      },
      quantity: item.quantity,
    }))

    // Add shipping as a line item if not free (embedded checkout doesn't support shipping_options)
    if (shippingAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shippingAmount * 100),
        },
        quantity: 1,
      })
    }

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
        shipping_amount: String(Math.round(shippingAmount * 100)),
      },
    })

    return NextResponse.json({ client_secret: session.client_secret })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
