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
