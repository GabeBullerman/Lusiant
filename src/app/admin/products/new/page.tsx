import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold tracking-wide mb-8">Add Product</h1>
      <ProductForm />
    </div>
  )
}
