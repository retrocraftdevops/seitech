'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, BookOpen, Award, ArrowRight, Mail, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface OrderData {
  orderId: number;
  orderReference: string;
  total: number;
  currency?: string;
  enrollments: Array<{
    id: number;
    courseName: string;
    courseSlug: string;
    status: string;
  }>;
}

export default function ConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Try to get order from sessionStorage
    const storedOrder = sessionStorage.getItem('lastOrder');
    if (storedOrder) {
      try {
        setOrder(JSON.parse(storedOrder));
        // Clear after reading
        sessionStorage.removeItem('lastOrder');
      } catch (e) {
        console.error('Error parsing order data:', e);
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardContent className="py-12 px-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your enrollment has been confirmed. You're ready to start learning!
            </p>

            {/* Order Reference */}
            {order && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8 inline-block">
                <p className="text-sm text-gray-600">Order Reference</p>
                <p className="text-xl font-bold text-gray-900">{order.orderReference}</p>
                {order.total > 0 && (
                  <p className="text-lg text-primary-600 font-semibold mt-1">
                    Total: {formatCurrency(order.total)}
                  </p>
                )}
              </div>
            )}

            {/* Enrolled Courses */}
            {order?.enrollments && order.enrollments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" />
                  Your Enrollments
                </h2>
                <div className="space-y-3">
                  {order.enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.courseName}</p>
                        <Badge variant="success" size="sm" className="mt-1">
                          {enrollment.status === 'active' ? 'Ready to Start' : enrollment.status}
                        </Badge>
                      </div>
                      <Link href={`/courses/${enrollment.courseSlug}`}>
                        <Button size="sm" variant="outline">
                          View Course
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-4">
                What happens next?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Check your email
                    </p>
                    <p className="text-sm text-gray-600">
                      We've sent a confirmation email with your order details and login information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Access your courses
                    </p>
                    <p className="text-sm text-gray-600">
                      Your courses are now available in your learning dashboard. Start learning anytime!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Earn your certificate
                    </p>
                    <p className="text-sm text-gray-600">
                      Complete the course to receive your accredited certificate.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/my-courses">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Go to My Courses
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="lg"
                >
                  Browse More Courses
                </Button>
              </Link>
            </div>

            {/* Support Note */}
            <p className="text-sm text-gray-500 mt-8">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:support@seitechinternational.org.uk"
                className="text-primary-600 hover:underline"
              >
                support@seitechinternational.org.uk
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
