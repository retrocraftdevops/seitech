import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CmsFaq, CmsFaqCategory } from '@/types';

export const dynamic = 'force-dynamic';

// Default FAQs for when Odoo is unavailable
const defaultFaqs: CmsFaq[] = [
  {
    id: 1,
    question: 'What qualifications do I need to take the IOSH Managing Safely course?',
    answer: '<p>There are no formal entry requirements for the IOSH Managing Safely course. It\'s designed for managers and supervisors at all levels who need to understand workplace health and safety responsibilities. A basic understanding of English is required as the course materials and assessments are in English.</p>',
    shortAnswer: 'No formal qualifications required. The course is open to all managers and supervisors.',
    categoryId: 1,
    categoryName: 'Courses & Training',
    categorySlug: 'courses-training',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
  {
    id: 2,
    question: 'How long is the NEBOSH General Certificate valid for?',
    answer: '<p>The NEBOSH National General Certificate in Occupational Health and Safety has no expiry date. Once achieved, the qualification is valid for life. However, many employers may require refresher training or CPD to ensure knowledge remains current.</p>',
    shortAnswer: 'The NEBOSH General Certificate is valid for life with no expiry date.',
    categoryId: 2,
    categoryName: 'Certificates',
    categorySlug: 'certificates',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
  {
    id: 3,
    question: 'Can I pay for courses in instalments?',
    answer: '<p>Yes, we offer flexible payment options for many of our courses. For courses over £200, you can spread the cost with our interest-free payment plans. Contact our team to discuss payment options suitable for your needs.</p>',
    shortAnswer: 'Yes, interest-free payment plans are available for courses over £200.',
    categoryId: 3,
    categoryName: 'Booking & Payment',
    categorySlug: 'booking-payment',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
];

const defaultCategories: CmsFaqCategory[] = [
  { id: 1, name: 'Courses & Training', slug: 'courses-training', description: '', icon: 'book-open', faqCount: 1, faqs: [] },
  { id: 2, name: 'Certificates', slug: 'certificates', description: '', icon: 'award', faqCount: 1, faqs: [] },
  { id: 3, name: 'Booking & Payment', slug: 'booking-payment', description: '', icon: 'credit-card', faqCount: 1, faqs: [] },
  { id: 4, name: 'General Questions', slug: 'general', description: '', icon: 'help-circle', faqCount: 0, faqs: [] },
];

export async function GET(request: NextRequest) {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const searchParams = request.nextUrl.searchParams;

    // Build query string from search params
    const queryParams = new URLSearchParams();
    if (searchParams.get('category_slug')) queryParams.set('category_slug', searchParams.get('category_slug')!);
    if (searchParams.get('featured')) queryParams.set('featured', searchParams.get('featured')!);
    if (searchParams.get('search')) queryParams.set('search', searchParams.get('search')!);
    if (searchParams.get('limit')) queryParams.set('limit', searchParams.get('limit')!);
    if (searchParams.get('offset')) queryParams.set('offset', searchParams.get('offset')!);

    const url = `${odooUrl}/api/cms/faqs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
        faqs: defaultFaqs,
        pagination: {
          total: defaultFaqs.length,
          limit: 10,
          offset: 0,
        },
      },
    });
  } catch (error) {
    console.warn('CMS FAQs fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: {
        faqs: defaultFaqs,
        pagination: {
          total: defaultFaqs.length,
          limit: 10,
          offset: 0,
        },
      },
    });
  }
}
