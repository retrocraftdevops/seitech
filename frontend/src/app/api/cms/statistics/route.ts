import { NextRequest, NextResponse } from 'next/server';
import type { CmsStatistic } from '@/types';

export const dynamic = 'force-dynamic';

// Default statistics for fallback
const defaultStatistics: CmsStatistic[] = [
  {
    id: 1,
    name: 'Professionals Trained',
    value: '5,000+',
    numericValue: 5000,
    suffix: '+',
    description: 'Certified professionals across the UK',
    icon: 'Users',
    statType: 'counter',
    displayLocation: 'homepage',
  },
  {
    id: 2,
    name: 'Years Experience',
    value: '15+',
    numericValue: 15,
    suffix: '+ years',
    description: 'In health and safety training',
    icon: 'Calendar',
    statType: 'counter',
    displayLocation: 'homepage',
  },
  {
    id: 3,
    name: 'Pass Rate',
    value: '98%',
    numericValue: 98,
    suffix: '%',
    description: 'Industry-leading success rate',
    icon: 'TrendingUp',
    statType: 'percentage',
    displayLocation: 'homepage',
  },
  {
    id: 4,
    name: 'Accreditations',
    value: '12+',
    numericValue: 12,
    suffix: '+',
    description: 'Including IOSH, NEBOSH, Qualsafe',
    icon: 'Award',
    statType: 'counter',
    displayLocation: 'homepage',
  },
];

export async function GET(request: NextRequest) {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const searchParams = request.nextUrl.searchParams;

    // Build query string from search params
    const queryParams = new URLSearchParams();
    if (searchParams.get('location')) queryParams.set('location', searchParams.get('location')!);
    if (searchParams.get('type')) queryParams.set('type', searchParams.get('type')!);

    const url = `${odooUrl}/api/cms/statistics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
    const location = searchParams.get('location');
    const filteredStats = location
      ? defaultStatistics.filter(s => s.displayLocation === location)
      : defaultStatistics;

    return NextResponse.json({
      success: true,
      data: filteredStats,
    });
  } catch (error) {
    console.warn('CMS statistics fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: defaultStatistics,
    });
  }
}
