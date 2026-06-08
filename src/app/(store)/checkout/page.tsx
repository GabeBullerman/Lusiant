import { getStoreMode } from '@/lib/site-content'
import { CheckoutClient } from './CheckoutClient'

export const metadata = { title: 'Checkout — Lusiant' }

export default async function CheckoutPage() {
  const { orders_enabled } = await getStoreMode()
  return <CheckoutClient ordersEnabled={orders_enabled} />
}
