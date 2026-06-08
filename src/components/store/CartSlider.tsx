'use client'

import { useCart } from './CartContext'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function CartSlider() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCart()
  const router = useRouter()

  function handleCheckout() {
    closeCart()
    router.push('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="text-sm font-medium tracking-widest uppercase">Cart ({items.length})</span>
          <button onClick={closeCart}><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
            <ShoppingBag size={48} strokeWidth={1} />
            <p className="text-sm tracking-wider">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 relative flex-shrink-0">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium tracking-wide truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                    <p className="text-sm mt-1">${item.product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-1"><Minus size={14} /></button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-1"><Plus size={14} /></button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.product.id, item.size)} className="text-gray-400 hover:text-black self-start pt-1">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-6 py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="tracking-wider">SUBTOTAL</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 text-sm tracking-widest font-medium hover:bg-gray-900 transition-colors"
              >
                CHECKOUT
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
