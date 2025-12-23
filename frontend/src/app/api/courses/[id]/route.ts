import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';
    const courseId = params.id;

    const response = await fetch(`${odooUrl}/api/courses/${courseId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course',
        data: null,
      },
      { status: 500 }
    );
  }
}
