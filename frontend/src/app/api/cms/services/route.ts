import { NextRequest, NextResponse } from 'next/server';
import type { CmsService } from '@/types';

export const dynamic = 'force-dynamic';

// Default services for fallback
const defaultServices: CmsService[] = [
  {
    id: 1,
    name: 'Fire Risk Assessment',
    slug: 'fire-risk-assessment',
    shortDescription: 'Comprehensive fire risk assessments to ensure compliance and protect your premises.',
    fullDescription: '',
    iconName: 'Flame',
    image: null,
    categoryId: 1,
    categoryName: 'Risk Assessment',
    categorySlug: 'risk-assessment',
    features: ['Full premises inspection', 'Fire hazard identification', 'Escape route assessment', 'Documentation review'],
    benefits: ['Legal compliance', 'Insurance requirements met', 'Staff safety improved'],
    pricingType: 'quote',
    priceFrom: 250,
    priceTo: 0,
    priceCurrency: 'GBP',
    isFeatured: true,
    metaTitle: 'Fire Risk Assessment Services',
    metaDescription: 'Professional fire risk assessment services for businesses across the UK.',
  },
  {
    id: 2,
    name: 'Health & Safety Audit',
    slug: 'health-safety-audit',
    shortDescription: 'Thorough workplace audits to identify hazards and ensure regulatory compliance.',
    fullDescription: '',
    iconName: 'Shield',
    image: null,
    categoryId: 1,
    categoryName: 'Risk Assessment',
    categorySlug: 'risk-assessment',
    features: ['Workplace inspection', 'Policy review', 'Compliance check', 'Recommendations report'],
    benefits: ['Identify risks', 'Improve safety culture', 'Reduce incidents'],
    pricingType: 'quote',
    priceFrom: 350,
    priceTo: 0,
    priceCurrency: 'GBP',
    isFeatured: true,
    metaTitle: 'Health & Safety Audit Services',
    metaDescription: 'Professional health and safety audit services for UK businesses.',
  },
];

export async function GET(request: NextRequest) {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const searchParams = request.nextUrl.searchParams;

    // Build query string from search params
    const queryParams = new URLSearchParams();
    if (searchParams.get('category_slug')) queryParams.set('category_slug', searchParams.get('category_slug')!);
    if (searchParams.get('category_id')) queryParams.set('category_id', searchParams.get('category_id')!);
    if (searchParams.get('featured')) queryParams.set('featured', searchParams.get('featured')!);
    if (searchParams.get('homepage')) queryParams.set('homepage', searchParams.get('homepage')!);
    if (searchParams.get('limit')) queryParams.set('limit', searchParams.get('limit')!);
    if (searchParams.get('offset')) queryParams.set('offset', searchParams.get('offset')!);

    const url = `${odooUrl}/api/cms/services${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
      data: {
        services: defaultServices,
        pagination: {
          total: defaultServices.length,
          limit: 50,
          offset: 0,
        },
      },
    });
  } catch (error) {
    console.warn('CMS services fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: {
        services: defaultServices,
        pagination: {
          total: defaultServices.length,
          limit: 50,
          offset: 0,
        },
      },
    });
  }
}
