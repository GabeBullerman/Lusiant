import { createClient } from '@/lib/supabase/server'
import { Order } from '@/lib/types'
import { SignOutButton } from './AccountActions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'My Account' }

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/account/login')

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', user.email!)
    .order('created_at', { ascending: false })
  const orders = (data as Order[]) ?? []

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-xs tracking-widest font-medium uppercase">My Account</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="text-xs tracking-widest font-medium uppercase mb-4">Order History</h2>
      {orders.length === 0 ? (
        <div className="border border-gray-100 rounded py-16 text-center">
          <p className="text-sm text-gray-400 mb-4">You haven’t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-block border border-black px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-100 rounded p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <p key={i} className="text-sm text-gray-600">
                    {item.product_name} × {item.quantity} <span className="text-gray-400">({item.size})</span>
                  </p>
                ))}
              </div>
              <p className="text-sm font-medium">Total: ${order.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
