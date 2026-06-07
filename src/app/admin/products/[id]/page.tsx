import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import { Product } from '@/lib/types'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).single()

  if (!data) notFound()

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold tracking-wide mb-8">Edit Product</h1>
      <ProductForm product={data as Product} />
    </div>
  )
}
