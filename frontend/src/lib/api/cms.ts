import type {
  SiteSettings,
  CmsPage,
  CmsSection,
  CmsTestimonial,
  CmsFaq,
  CmsFaqCategory,
  CmsTeamMember,
  CmsPartner,
  CmsNavItem,
  CmsHomepageData,
  CmsTestimonialsResponse,
  CmsFaqsResponse,
} from '@/types';

// Server-side API base URL
function getApiBaseUrl() {
  // Use internal API routes during SSR/SSG
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
  }
  return '';
}

// Generic fetch helper for server-side rendering
async function serverFetch<T>(
  endpoint: string,
  options?: { revalidate?: number | false; tags?: string[] }
): Promise<{ success: boolean; data: T | null; message?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      next: {
        revalidate: options?.revalidate ?? 300,
        tags: options?.tags,
      },
    });

    if (!response.ok) {
      return { success: false, data: null, message: `HTTP ${response.status}` };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Server fetch error:', error);
    return { success: false, data: null, message: 'Failed to fetch data' };
  }
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const result = await serverFetch<SiteSettings>('/api/cms/settings', {
    tags: ['settings'],
  });
  return result.data;
}

// Navigation
export async function getNavigation(type: 'header' | 'footer'): Promise<CmsNavItem[]> {
  const result = await serverFetch<CmsNavItem[]>(`/api/cms/navigation/${type}`, {
    tags: ['navigation'],
  });
  return result.data || [];
}

// Pages
export async function getPages(): Promise<CmsPage[]> {
  const result = await serverFetch<CmsPage[]>('/api/cms/pages', {
    tags: ['pages'],
  });
  return result.data || [];
}

export async function getPage(slug: string): Promise<CmsPage | null> {
  const result = await serverFetch<CmsPage>(`/api/cms/pages/${slug}`, {
    tags: ['pages', `page-${slug}`],
  });
  return result.data;
}

// Sections
export async function getSection(identifier: string): Promise<CmsSection | null> {
  const result = await serverFetch<CmsSection>(`/api/cms/sections/${identifier}`, {
    tags: ['sections', `section-${identifier}`],
  });
  return result.data;
}

// Testimonials
interface TestimonialsParams {
  serviceType?: 'training' | 'consultancy' | 'elearning' | 'general';
  featured?: boolean;
  courseId?: number;
  limit?: number;
  offset?: number;
}

export async function getTestimonials(params: TestimonialsParams = {}): Promise<CmsTestimonialsResponse> {
  const searchParams = new URLSearchParams();
  if (params.serviceType) searchParams.set('service_type', params.serviceType);
  if (params.featured !== undefined) searchParams.set('featured', String(params.featured));
  if (params.courseId) searchParams.set('course_id', String(params.courseId));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  const result = await serverFetch<CmsTestimonialsResponse>(
    `/api/cms/testimonials${query ? '?' + query : ''}`,
    { tags: ['testimonials'] }
  );

  return result.data || { testimonials: [], pagination: { total: 0, limit: 10, offset: 0 } };
}

// FAQs
interface FaqsParams {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getFaqs(params: FaqsParams = {}): Promise<CmsFaqsResponse> {
  const searchParams = new URLSearchParams();
  if (params.categorySlug) searchParams.set('category_slug', params.categorySlug);
  if (params.featured !== undefined) searchParams.set('featured', String(params.featured));
  if (params.search) searchParams.set('search', params.search);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  const result = await serverFetch<CmsFaqsResponse>(
    `/api/cms/faqs${query ? '?' + query : ''}`,
    { tags: ['faqs'] }
  );

  return result.data || { faqs: [], pagination: { total: 0, limit: 10, offset: 0 } };
}

export async function getFaqCategories(): Promise<CmsFaqCategory[]> {
  const result = await serverFetch<CmsFaqCategory[]>('/api/cms/faqs/categories', {
    tags: ['faq-categories'],
  });
  return result.data || [];
}

// Team
interface TeamParams {
  department?: string;
  featured?: boolean;
  instructorsOnly?: boolean;
}

export async function getTeam(params: TeamParams = {}): Promise<CmsTeamMember[]> {
  const searchParams = new URLSearchParams();
  if (params.department) searchParams.set('department', params.department);
  if (params.featured !== undefined) searchParams.set('featured', String(params.featured));
  if (params.instructorsOnly) searchParams.set('instructors', 'true');

  const query = searchParams.toString();
  const result = await serverFetch<CmsTeamMember[]>(
    `/api/cms/team${query ? '?' + query : ''}`,
    { tags: ['team'] }
  );

  return result.data || [];
}

// Partners
interface PartnersParams {
  type?: 'accreditation' | 'certification' | 'client' | 'partner' | 'sponsor' | 'association';
  featured?: boolean;
}

export async function getPartners(params: PartnersParams = {}): Promise<CmsPartner[]> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set('type', params.type);
  if (params.featured !== undefined) searchParams.set('featured', String(params.featured));

  const query = searchParams.toString();
  const result = await serverFetch<CmsPartner[]>(
    `/api/cms/partners${query ? '?' + query : ''}`,
    { tags: ['partners'] }
  );

  return result.data || [];
}

// Homepage (combined data)
export async function getHomepageData(): Promise<CmsHomepageData | null> {
  const result = await serverFetch<CmsHomepageData>('/api/cms/homepage', {
    tags: ['homepage'],
  });
  return result.data;
}
