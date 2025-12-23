import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CmsPartner } from '@/types';

export const dynamic = 'force-dynamic';

// Default partners for when Odoo is unavailable
const defaultPartners: CmsPartner[] = [
  {
    id: 1,
    name: 'IOSH',
    logo: null,
    logoDark: null,
    websiteUrl: 'https://www.iosh.com',
    description: 'Institution of Occupational Safety and Health - the world\'s largest health and safety membership organization.',
    partnerType: 'accreditation',
    accreditationNumber: '',
    accreditationExpiry: null,
    certificateUrl: '',
    isFeatured: true,
  },
  {
    id: 2,
    name: 'NEBOSH',
    logo: null,
    logoDark: null,
    websiteUrl: 'https://www.nebosh.org.uk',
    description: 'National Examination Board in Occupational Safety and Health - a leading global organization providing health and safety qualifications.',
    partnerType: 'accreditation',
    accreditationNumber: '',
    accreditationExpiry: null,
    certificateUrl: '',
    isFeatured: true,
  },
  {
    id: 3,
    name: 'Qualsafe Awards',
    logo: null,
    logoDark: null,
    websiteUrl: 'https://www.qualsafeawards.org',
    description: 'Qualsafe Awards is a leading Awarding Organisation for First Aid and Health & Safety qualifications.',
    partnerType: 'accreditation',
    accreditationNumber: '',
    accreditationExpiry: null,
    certificateUrl: '',
    isFeatured: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const searchParams = request.nextUrl.searchParams;

    // Build query string from search params
    const queryParams = new URLSearchParams();
    if (searchParams.get('type')) queryParams.set('type', searchParams.get('type')!);
    if (searchParams.get('featured')) queryParams.set('featured', searchParams.get('featured')!);

    const url = `${odooUrl}/api/cms/partners${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
        } as ApiResponse<CmsPartner[]>);
      }
    }

    // Return defaults if Odoo unavailable
    return NextResponse.json({
      success: true,
      data: defaultPartners,
    } as ApiResponse<CmsPartner[]>);
  } catch (error) {
    console.warn('CMS partners fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: defaultPartners,
    } as ApiResponse<CmsPartner[]>);
  }
}
