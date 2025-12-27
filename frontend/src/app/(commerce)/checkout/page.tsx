'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useCartStore, useAuthStore } from '@/lib/stores';
import { formatCurrency } from '@/lib/utils';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  companyName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvc: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface OrderResult {
  orderId: number;
  orderReference: string;
  total: number;
  enrollments: Array<{
    id: number;
    courseName: string;
    courseSlug: string;
    status: string;
  }>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getItemCount, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  if (itemCount === 0) {
    router.push('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            companyName: data.companyName || '',
          },
          items: items.map((item) => ({
            courseId: item.courseId,
            name: item.name,
            price: item.price,
            slug: item.slug,
            imageUrl: item.imageUrl,
          })),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Store order info for confirmation page
      const orderData: OrderResult = result.data;
      sessionStorage.setItem('lastOrder', JSON.stringify(orderData));

      // Clear cart
      clearCart();

      // Redirect to confirmation
      router.push('/checkout/confirmation');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Account Section */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Your Details
                  </h2>

                  {!isAuthenticated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-700">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold underline">
                          Log in
                        </Link>{' '}
                        for faster checkout.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      {...register('email')}
                      error={errors.email?.message}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        placeholder="John"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                      />
                      <Input
                        label="Last Name"
                        placeholder="Smith"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                      />
                    </div>

                    <Input
                      label="Company Name (Optional)"
                      placeholder="Your Company Ltd"
                      {...register('companyName')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                  </div>

                  {/* Payment form - simulated for demo */}
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600 mb-4">
                        Card payment powered by Stripe
                      </p>
                      <Input
                        label="Card Number"
                        placeholder="4242 4242 4242 4242"
                        disabled={isProcessing}
                        {...register('cardNumber')}
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <Input
                          label="Expiry Date"
                          placeholder="MM/YY"
                          disabled={isProcessing}
                          {...register('expiryDate')}
                        />
                        <Input
                          label="CVC"
                          placeholder="123"
                          disabled={isProcessing}
                          {...register('cvc')}
                        />
                      </div>
                    </div>

                    {/* Demo Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-700">
                        <strong>Demo Mode:</strong> Payment is simulated. No actual charges will be made.
                      </p>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Complete Purchase - ${formatCurrency(totalPrice)}`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By completing this purchase, you agree to our{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 pb-4 border-b">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-12 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-600">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* What's Included */}
                <div className="pt-4 border-t space-y-3">
                  <p className="text-sm font-medium text-gray-700">Included with your purchase:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>12 months access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Certificate on completion</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Lifetime certificate validity</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center justify-center gap-4 text-gray-400">
                    <Shield className="w-8 h-8" />
                    <Lock className="w-8 h-8" />
                    <CreditCard className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
