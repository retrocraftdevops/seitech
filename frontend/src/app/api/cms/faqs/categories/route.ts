import { NextResponse } from 'next/server';
import type { ApiResponse, CmsFaqCategory } from '@/types';

export const dynamic = 'force-dynamic';

// Default FAQ categories for when Odoo is unavailable
const defaultCategories: CmsFaqCategory[] = [
  { id: 1, name: 'General Questions', slug: 'general', description: '', icon: 'help-circle', faqCount: 0, faqs: [] },
  { id: 2, name: 'Courses & Training', slug: 'courses-training', description: '', icon: 'book-open', faqCount: 0, faqs: [] },
  { id: 3, name: 'Booking & Payment', slug: 'booking-payment', description: '', icon: 'credit-card', faqCount: 0, faqs: [] },
  { id: 4, name: 'Certificates', slug: 'certificates', description: '', icon: 'award', faqCount: 0, faqs: [] },
];

export async function GET() {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/cms/faq-categories`, {
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
        } as ApiResponse<CmsFaqCategory[]>);
      }
    }

    // Return defaults if Odoo unavailable
    return NextResponse.json({
      success: true,
      data: defaultCategories,
    } as ApiResponse<CmsFaqCategory[]>);
  } catch (error) {
    console.warn('CMS FAQ categories fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: defaultCategories,
    } as ApiResponse<CmsFaqCategory[]>);
  }
}
