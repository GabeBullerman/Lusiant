import { ProductForm } from '@/components/admin/ProductForm'
import { getAllCollections } from '@/lib/collections'

export default async function NewProductPage() {
  const collections = await getAllCollections()
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold tracking-wide mb-8">Add Product</h1>
      <ProductForm collections={collections} />
    </div>
  )
}
