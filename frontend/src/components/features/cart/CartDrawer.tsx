'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, getItemCount, getTotalPrice } = useCartStore();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Your Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Browse our courses and add some to your cart.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="relative w-20 h-14 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-600">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/courses/${item.slug}`}
                      onClick={closeCart}
                      className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 text-sm"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 capitalize mt-1">
                      {item.deliveryMethod?.replace('-', ' ') || 'Course'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-bold text-gray-900">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => removeItem(item.courseId)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button
                className="w-full"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Proceed to Checkout
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={closeCart}
            >
              Continue Browsing
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
