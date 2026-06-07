import { createClient } from '@/lib/supabase/server'
import { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

async function getOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Order[]) ?? []
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold tracking-wide mb-8">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center py-20 text-sm text-gray-400">No orders yet</p>
      ) : (
        <div className="bg-white border border-gray-100 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Items</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Shipping</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer_name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-xs text-gray-600">
                          {item.product_name} × {item.quantity} ({item.size})
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {order.shipping_address ? (
                      <div className="text-xs text-gray-500 leading-relaxed">
                        <p>{order.shipping_address.line1}</p>
                        <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
