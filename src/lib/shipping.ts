import type { CartItem, ShippingSetting } from './types'

export const DEFAULT_SHIPPING: ShippingSetting = {
  free_threshold: 150,
  standard_rate: 9.99,
  oversize_surcharge: 5.00,
}

interface ShipItem {
  price: number
  quantity: number
  shipping_class?: string | null
}

export function calcShippingFromItems(items: ShipItem[], settings: ShippingSetting): number {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  if (subtotal >= settings.free_threshold) return 0
  const oversurcharge = items.reduce(
    (s, i) => i.shipping_class === 'oversize' ? s + settings.oversize_surcharge * i.quantity : s,
    0
  )
  return settings.standard_rate + oversurcharge
}

export function calcShipping(items: CartItem[], settings: ShippingSetting): number {
  return calcShippingFromItems(
    items.map(i => ({ price: i.product.price, quantity: i.quantity, shipping_class: i.product.shipping_class })),
    settings
  )
}
