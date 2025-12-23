import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const url = `${odooUrl}/api/cms/services/${slug}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
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

    // Service not found
    return NextResponse.json({
      success: false,
      message: 'Service not found',
      data: null,
    }, { status: 404 });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch service',
      data: null,
    }, { status: 500 });
  }
}
