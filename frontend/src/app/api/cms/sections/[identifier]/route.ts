import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CmsSection } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/cms/sections/${identifier}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return NextResponse.json({
          success: true,
          data: data.data,
        } as ApiResponse<CmsSection>);
      }
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'Section not found',
      },
      { status: 404 }
    );
  } catch (error) {
    console.warn('CMS section fetch failed:', error);
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
