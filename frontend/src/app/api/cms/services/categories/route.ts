import { NextResponse } from 'next/server';
import type { CmsServiceCategory } from '@/types';

export const dynamic = 'force-dynamic';

// Default categories for fallback
const defaultCategories: CmsServiceCategory[] = [
  {
    id: 1,
    name: 'Risk Assessment',
    slug: 'risk-assessment',
    description: 'Comprehensive risk assessment services for workplace safety',
    icon: 'AlertTriangle',
    serviceCount: 6,
  },
  {
    id: 2,
    name: 'Management Systems',
    slug: 'management-systems',
    description: 'ISO certification and management system consultancy',
    icon: 'Settings',
    serviceCount: 3,
  },
  {
    id: 3,
    name: 'Compliance & Documentation',
    slug: 'compliance-documentation',
    description: 'Policy writing and compliance documentation services',
    icon: 'FileText',
    serviceCount: 3,
  },
];

export async function GET() {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const url = `${odooUrl}/api/cms/service-categories`;

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

    // Return defaults if Odoo unavailable
    return NextResponse.json({
      success: true,
      data: defaultCategories,
    });
  } catch (error) {
    console.warn('CMS service categories fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: defaultCategories,
    });
  }
}
