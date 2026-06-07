import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'

async function getStats() {
  try {
    const supabase = await createClient()
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('id, is_active', { count: 'exact' }),
      supabase.from('orders').select('total, status', { count: 'exact' }),
    ])

    const products = productsRes.data ?? []
    const orders = ordersRes.data ?? []

    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.is_active).length,
      totalOrders: orders.length,
      paidOrders: orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').length,
      revenue: orders
        .filter(o => o.status !== 'cancelled' && o.status !== 'pending')
        .reduce((sum, o) => sum + (o.total ?? 0), 0),
    }
  } catch {
    return { totalProducts: 0, activeProducts: 0, totalOrders: 0, paidOrders: 0, revenue: 0 }
  }
}

async function getRecentOrders() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('id, customer_email, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    return data ?? []
  } catch {
    return []
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()])

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, sub: `${stats.activeProducts} active`, icon: Package },
    { label: 'Total Orders', value: stats.totalOrders, sub: `${stats.paidOrders} paid`, icon: ShoppingBag },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, sub: 'All time', icon: DollarSign },
    { label: 'Conversion', value: stats.totalOrders > 0 ? `${Math.round((stats.paidOrders / stats.totalOrders) * 100)}%` : '—', sub: 'Paid / total orders', icon: TrendingUp },
  ]

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-xl font-semibold tracking-wide mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white rounded border border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 tracking-wide">{label}</span>
              <Icon size={16} className="text-gray-300" />
            </div>
            <span className="text-2xl font-semibold">{value}</span>
            <span className="text-xs text-gray-400">{sub}</span>
          </div>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <div className="bg-white rounded border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium tracking-wide">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order: Record<string, unknown>) => (
              <div key={order.id as string} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{(order.customer_name as string) || (order.customer_email as string)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at as string).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">${(order.total as number).toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status as string] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status as string}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
