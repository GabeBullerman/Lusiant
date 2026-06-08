export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category: string
  sizes: string[]
  images: string[]
  is_active: boolean
  is_featured: boolean
  stock_quantity: number
  stripe_price_id: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  stripe_session_id: string
  customer_email: string
  customer_name: string | null
  items: OrderItem[]
  subtotal: number
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: ShippingAddress | null
  created_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  size: string
  price: number
  quantity: number
  image: string
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface SiteSetting {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface HeroSetting {
  title: string
  subtitle: string
  image_url: string
  button_text: string
  button_href: string
}

export interface AnnouncementSetting {
  text: string
  enabled: boolean
}

export interface LookbookSection {
  title: string
  images: string[]
}

// Normalizes the `lookbook` site_setting value, supporting both the new
// sectioned format and the legacy flat `[{ url }]` / `string[]` formats.
export function normalizeLookbook(value: unknown): LookbookSection[] {
  if (!Array.isArray(value)) return []
  if (value.length === 0) return []

  // New format: array of { title, images }
  if (value.every(v => v && typeof v === 'object' && 'images' in v)) {
    return (value as LookbookSection[]).map(s => ({
      title: typeof s.title === 'string' ? s.title : '',
      images: Array.isArray(s.images) ? s.images.filter(u => typeof u === 'string') : [],
    }))
  }

  // Legacy flat format: [{ url }] or ["url", ...] -> single untitled section
  const images = (value as unknown[])
    .map(v => (typeof v === 'string' ? v : v && typeof v === 'object' && 'url' in v ? (v as { url: unknown }).url : null))
    .filter((u): u is string => typeof u === 'string')
  return images.length ? [{ title: '', images }] : []
}
