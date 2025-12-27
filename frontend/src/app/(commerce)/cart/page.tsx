'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Clock, Award, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/lib/stores';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, clearCart, getTotalPrice, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h1>
              <p className="text-gray-600 mb-8">
                Browse our courses and add something to your cart.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {itemCount} {itemCount === 1 ? 'course' : 'courses'} in your cart
            </p>
          </div>
          <Button variant="ghost" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.imageUrl || '/images/course-placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/courses/${item.slug}`}
                            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <Badge
                            className="mt-2"
                            variant={
                              item.deliveryMethod === 'e-learning'
                                ? 'info'
                                : item.deliveryMethod === 'virtual'
                                ? 'purple'
                                : 'success'
                            }
                          >
                            {item.deliveryMethod.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            12 months access
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Certificate included
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.courseId)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 pb-4 border-b">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 truncate pr-4">
                        {item.name}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="py-4 border-b">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Totals */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-medium">-£0.00</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout">
                  <Button
                    className="w-full"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Security Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <div className="text-center mt-6">
              <Link
                href="/courses"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Continue Shopping &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
