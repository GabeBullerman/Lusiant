import { createClient } from '@/lib/supabase/server'
import { Product } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { DeleteProductButton } from './DeleteProductButton'

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Product[]) ?? []
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-wide">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm tracking-widest hover:bg-gray-900 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm tracking-wide">No products yet.</p>
          <Link href="/admin/products/new" className="text-black text-sm underline mt-2 inline-block">Add your first product →</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide w-16">Image</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium tracking-wide">Featured</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="w-10 h-12 bg-gray-100 relative overflow-hidden rounded">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt="" fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    ${product.price.toFixed(2)}
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-400 ml-2 line-through">${product.compare_at_price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{product.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.is_active ? 'Active' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.is_featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Featured</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/admin/products/${product.id}`} className="text-xs text-gray-500 hover:text-black transition-colors">
                        Edit
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
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
