import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CmsPage } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/cms/pages/${slug}`, {
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
        } as ApiResponse<CmsPage>);
      }
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'Page not found',
      },
      { status: 404 }
    );
  } catch (error) {
    console.warn('CMS page fetch failed:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'CMS service unavailable',
      },
      { status: 503 }
    );
  }
}
