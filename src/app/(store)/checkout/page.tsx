import { getStoreMode, getShippingSettings } from '@/lib/site-content'
import { CheckoutClient } from './CheckoutClient'

export const metadata = { title: 'Checkout — Lusiant' }

export default async function CheckoutPage() {
  const [{ orders_enabled }, shippingSettings] = await Promise.all([
    getStoreMode(),
    getShippingSettings(),
  ])
  return <CheckoutClient ordersEnabled={orders_enabled} shippingSettings={shippingSettings} />
}
