import { NextResponse } from 'next/server';
import type { ApiResponse, SiteSettings } from '@/types';

export const dynamic = 'force-dynamic';

// Default settings for when Odoo is unavailable
const defaultSettings: SiteSettings = {
  siteName: 'SEI Tech International',
  logo: null,
  logoDark: null,
  favicon: null,
  tagline: 'Professional Health & Safety Training',
  contact: {
    companyName: 'SEI Tech International Ltd',
    email: 'info@seitech.co.uk',
    phone: '+44 (0) 123 456 7890',
    phoneSecondary: '',
    whatsapp: '',
    address: {
      line1: '123 Training House',
      line2: '',
      city: 'London',
      postcode: 'EC1A 1BB',
      country: 'United Kingdom',
    },
    googleMapsUrl: '',
  },
  social: {
    facebook: 'https://facebook.com/seitechuk',
    twitter: 'https://twitter.com/seitechuk',
    linkedin: 'https://linkedin.com/company/seitech-international',
    instagram: '',
    youtube: '',
    tiktok: '',
  },
  businessHours: '{}',
  timezone: 'Europe/London',
  seo: {
    defaultMetaTitle: 'SEI Tech International | Health & Safety Training',
    defaultMetaDescription: 'Professional health and safety training courses. IOSH, NEBOSH, and Qualsafe accredited.',
    defaultOgImage: null,
    googleAnalyticsId: '',
    googleTagManagerId: '',
  },
  legal: {
    companyNumber: '',
    vatNumber: '',
    privacyPolicyUrl: '/privacy',
    termsUrl: '/terms',
    cookiePolicyUrl: '/cookies',
  },
  features: {
    enableLiveChat: false,
    enableNewsletter: true,
    maintenanceMode: false,
    maintenanceMessage: '',
  },
  footer: {
    text: '',
    copyright: `© ${new Date().getFullYear()} SEI Tech International. All rights reserved.`,
  },
};

export async function GET() {
  try {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/cms/settings`, {
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
        } as ApiResponse<SiteSettings>);
      }
    }

    // Return default settings if Odoo is unavailable
    return NextResponse.json({
      success: true,
      data: defaultSettings,
    } as ApiResponse<SiteSettings>);
  } catch (error) {
    console.warn('CMS settings fetch failed, using defaults:', error);
    return NextResponse.json({
      success: true,
      data: defaultSettings,
    } as ApiResponse<SiteSettings>);
  }
}
