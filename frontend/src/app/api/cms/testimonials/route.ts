import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CmsTestimonial } from '@/types';

export const dynamic = 'force-dynamic';

// Default testimonials for when Odoo is unavailable
const defaultTestimonials: CmsTestimonial[] = [
  {
    id: 1,
    name: 'Sarah Thompson',
    title: 'Health & Safety Manager',
    company: 'ABC Construction Ltd',
    avatar: null,
    content: 'The IOSH Managing Safely course was excellent. The trainer was knowledgeable and made complex topics easy to understand. Highly recommend SEI Tech for anyone looking to improve their safety skills.',
    rating: 5,
    courseId: null,
    courseName: null,
    serviceType: 'training',
    isFeatured: true,
    source: 'google',
    sourceUrl: '',
    date: null,
  },
  {
    id: 2,
    name: 'James Wilson',
    title: 'Operations Director',
    company: 'Wilson Manufacturing',
    avatar: null,
    content: "We've used SEI Tech for all our in-house training needs. Their flexible approach and professional trainers have made a real difference to our safety culture.",
    rating: 5,
    courseId: null,
    courseName: null,
    serviceType: 'training',
    isFeatured: true,
    source: 'linkedin',
    sourceUrl: '',
    date: null,
  },
  {
    id: 3,
    name: 'Emma Roberts',
    title: 'HR Director',
    company: 'Metro Hotels Group',
    avatar: null,
    content: 'The e-learning platform is fantastic. Our staff can complete training at their own pace, and the certificates are issued immediately. Great value for money.',
    rating: 5,
    courseId: null,
    courseName: null,
    serviceType: 'elearning',
    isFeatured: true,
    source: 'trustpilot',
    sourceUrl: '',
    date: null,
  },
];

export async function GET(request: NextRequest) {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const searchParams = request.nextUrl.searchParams;

    // Build query string from search params
    const queryParams = new URLSearchParams();
    if (searchParams.get('service_type')) queryParams.set('service_type', searchParams.get('service_type')!);
    if (searchParams.get('featured')) queryParams.set('featured', searchParams.get('featured')!);
    if (searchParams.get('course_id')) queryParams.set('course_id', searchParams.get('course_id')!);
    if (searchParams.get('limit')) queryParams.set('limit', searchParams.get('limit')!);
    if (searchParams.get('offset')) queryParams.set('offset', searchParams.get('offset')!);

    const url = `${odooUrl}/api/cms/testimonials${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
        testimonials: defaultTestimonials,
        pagination: {
          total: defaultTestimonials.length,
          limit: 10,
          offset: 0,
        },
      },
    });
  } catch (error) {
    console.warn('CMS testimonials fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: {
        testimonials: defaultTestimonials,
        pagination: {
          total: defaultTestimonials.length,
          limit: 10,
          offset: 0,
        },
      },
    });
  }
}
