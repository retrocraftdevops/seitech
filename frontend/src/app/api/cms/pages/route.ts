import { NextResponse } from 'next/server';
import type { ApiResponse, CmsPage } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/cms/pages`, {
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
        } as ApiResponse<CmsPage[]>);
      }
    }

    return NextResponse.json({
      success: false,
      data: [],
      message: 'Failed to fetch pages',
    });
  } catch (error) {
    console.warn('CMS pages fetch failed:', error);
    return NextResponse.json({
      success: false,
      data: [],
      message: 'CMS service unavailable',
    });
  }
}
