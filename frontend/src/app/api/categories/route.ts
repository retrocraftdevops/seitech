import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories',
        data: null,
      },
      { status: 500 }
    );
  }
}
