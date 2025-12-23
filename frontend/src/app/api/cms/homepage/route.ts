import { NextResponse } from 'next/server';
import type { ApiResponse, CmsHomepageData } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/cms/homepage`, {
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
        } as ApiResponse<CmsHomepageData>);
      }
    }

    // Return null for homepage data - components should handle missing data
    return NextResponse.json({
      success: false,
      data: null,
      message: 'Homepage data unavailable',
    });
  } catch (error) {
    console.warn('CMS homepage fetch failed:', error);
    return NextResponse.json({
      success: false,
      data: null,
      message: 'CMS service unavailable',
    });
  }
}
