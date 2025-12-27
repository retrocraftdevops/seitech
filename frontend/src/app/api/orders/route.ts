import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface OrderItem {
  courseId: number;
  name: string;
  price: number;
  slug?: string;
  imageUrl?: string;
}

interface CustomerData {
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

interface CreateOrderRequest {
  customer: CustomerData;
  items: OrderItem[];
}

interface OrderResponse {
  success: boolean;
  data?: {
    orderId: number;
    orderReference: string;
    total: number;
    currency: string;
    status: string;
    enrollments: Array<{
      id: number;
      courseName: string;
      courseSlug: string;
      status: string;
    }>;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<OrderResponse>> {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.customer?.email) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in order' },
        { status: 400 }
      );
    }

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    // Try Odoo API if configured
    if (odooUrl) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Include session cookie if user is logged in
        if (sessionToken) {
          headers['Cookie'] = `session_id=${sessionToken}`;
        }

        const response = await fetch(`${odooUrl}/api/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            customer: {
              email: body.customer.email,
              firstName: body.customer.firstName,
              lastName: body.customer.lastName,
              companyName: body.customer.companyName || '',
            },
            items: body.items.map((item) => ({
              courseId: item.courseId,
              price: item.price,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return NextResponse.json({
              success: true,
              data: data.data,
            });
          }
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode - simulate order creation
    const total = body.items.reduce((sum, item) => sum + item.price, 0);
    const orderId = Date.now();
    const orderReference = `SEITECH-${orderId.toString().slice(-8)}`;

    const demoEnrollments = body.items.map((item, index) => ({
      id: orderId + index + 1,
      courseName: item.name,
      courseSlug: item.slug || `course-${item.courseId}`,
      status: 'enrolled',
    }));

    // If user is logged in, store enrollments in cookies for demo mode
    const userInfo = cookieStore.get('user_info')?.value;
    if (userInfo) {
      const user = JSON.parse(userInfo);
      const demoEnrollmentsStr = cookieStore.get('demo_enrollments')?.value;
      const allEnrollments = demoEnrollmentsStr ? JSON.parse(demoEnrollmentsStr) : {};
      const userEnrollments = allEnrollments[user.email] || [];

      // Add new enrollments
      for (const item of body.items) {
        // Check if not already enrolled
        if (!userEnrollments.some((e: any) => e.courseId === item.courseId)) {
          userEnrollments.push({
            id: orderId + body.items.indexOf(item) + 1,
            courseId: item.courseId,
            courseName: item.name,
            courseSlug: item.slug || `course-${item.courseId}`,
            courseImage: item.imageUrl || '',
            state: 'active',
            progress: 0,
            enrollmentDate: new Date().toISOString(),
          });
        }
      }

      allEnrollments[user.email] = userEnrollments;
      cookieStore.set('demo_enrollments', JSON.stringify(allEnrollments), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    const demoResponse = {
      orderId,
      orderReference,
      total,
      currency: 'GBP',
      status: 'confirmed',
      enrollments: demoEnrollments,
    };

    return NextResponse.json({
      success: true,
      data: demoResponse,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';

    const response = await fetch(
      `${odooUrl}/api/orders/by-email/${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
