import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CmsTeamMember } from '@/types';

export const dynamic = 'force-dynamic';

// Default team members for when Odoo is unavailable
const defaultTeamMembers: CmsTeamMember[] = [
  {
    id: 1,
    name: 'David Mitchell',
    slug: 'david-mitchell',
    image: null,
    jobTitle: 'Managing Director',
    department: 'leadership',
    shortBio: 'David founded SEI Tech with a vision to make quality health and safety training accessible to all businesses.',
    fullBio: '',
    qualifications: 'NEBOSH Diploma, CMIOSH, MBA',
    certifications: '',
    specializations: '',
    email: '',
    linkedinUrl: '',
    twitterUrl: '',
    isInstructor: false,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    slug: 'sarah-johnson',
    image: null,
    jobTitle: 'Lead Training Consultant',
    department: 'training',
    shortBio: 'Sarah is an experienced IOSH and NEBOSH trainer with over 15 years in health and safety education.',
    fullBio: '',
    qualifications: 'NEBOSH Diploma, PTLLS, IOSH Certified Trainer',
    certifications: '',
    specializations: '',
    email: '',
    linkedinUrl: '',
    twitterUrl: '',
    isInstructor: true,
    isFeatured: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const searchParams = request.nextUrl.searchParams;

    // Build query string from search params
    const queryParams = new URLSearchParams();
    if (searchParams.get('department')) queryParams.set('department', searchParams.get('department')!);
    if (searchParams.get('featured')) queryParams.set('featured', searchParams.get('featured')!);
    if (searchParams.get('instructors')) queryParams.set('instructors', searchParams.get('instructors')!);

    const url = `${odooUrl}/api/cms/team${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
        } as ApiResponse<CmsTeamMember[]>);
      }
    }

    // Return defaults if Odoo unavailable
    return NextResponse.json({
      success: true,
      data: defaultTeamMembers,
    } as ApiResponse<CmsTeamMember[]>);
  } catch (error) {
    console.warn('CMS team fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: defaultTeamMembers,
    } as ApiResponse<CmsTeamMember[]>);
  }
}
