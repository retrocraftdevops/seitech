import { NextRequest, NextResponse } from 'next/server';

interface OrderItem {
  courseId: number;
  name: string;
  price: number;
  slug?: string;
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

    // Call Odoo API
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to create order' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
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
