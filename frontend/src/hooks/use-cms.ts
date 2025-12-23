'use client';

import { useState, useEffect, useCallback } from 'react';
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
  CmsService,
  CmsServiceCategory,
  CmsServicesResponse,
  CmsStatistic,
} from '@/types';

// Base fetch helper
async function fetchApi<T>(url: string): Promise<{ success: boolean; data: T | null; message?: string }> {
  try {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API fetch error:', error);
    return { success: false, data: null, message: 'Failed to fetch data' };
  }
}

// Hook for site settings
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const result = await fetchApi<SiteSettings>('/api/cms/settings');
      if (result.success && result.data) {
        setSettings(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load settings');
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  return { settings, loading, error };
}

// Hook for navigation
export function useNavigation(type: 'header' | 'footer') {
  const [items, setItems] = useState<CmsNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNavigation() {
      setLoading(true);
      const result = await fetchApi<CmsNavItem[]>(`/api/cms/navigation/${type}`);
      if (result.success && result.data) {
        setItems(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load navigation');
      }
      setLoading(false);
    }
    fetchNavigation();
  }, [type]);

  return { items, loading, error };
}

// Hook for a single page by slug
export function usePage(slug: string) {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const result = await fetchApi<CmsPage>(`/api/cms/pages/${slug}`);
      if (result.success && result.data) {
        setPage(result.data);
        setError(null);
      } else {
        setError(result.message || 'Page not found');
      }
      setLoading(false);
    }
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  return { page, loading, error };
}

// Hook for a single section by identifier
export function useSection(identifier: string) {
  const [section, setSection] = useState<CmsSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSection() {
      setLoading(true);
      const result = await fetchApi<CmsSection>(`/api/cms/sections/${identifier}`);
      if (result.success && result.data) {
        setSection(result.data);
        setError(null);
      } else {
        setError(result.message || 'Section not found');
      }
      setLoading(false);
    }
    if (identifier) {
      fetchSection();
    }
  }, [identifier]);

  return { section, loading, error };
}

// Hook for testimonials
interface UseTestimonialsOptions {
  serviceType?: 'training' | 'consultancy' | 'elearning' | 'general';
  featured?: boolean;
  courseId?: number;
  limit?: number;
  offset?: number;
}

export function useTestimonials(options: UseTestimonialsOptions = {}) {
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (options.serviceType) params.set('service_type', options.serviceType);
    if (options.featured !== undefined) params.set('featured', String(options.featured));
    if (options.courseId) params.set('course_id', String(options.courseId));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));

    const url = `/api/cms/testimonials${params.toString() ? '?' + params.toString() : ''}`;
    const result = await fetchApi<CmsTestimonialsResponse>(url);

    if (result.success && result.data) {
      setTestimonials(result.data.testimonials);
      setPagination(result.data.pagination);
      setError(null);
    } else {
      setError(result.message || 'Failed to load testimonials');
    }
    setLoading(false);
  }, [options.serviceType, options.featured, options.courseId, options.limit, options.offset]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return { testimonials, pagination, loading, error, refetch: fetchTestimonials };
}

// Hook for FAQs
interface UseFaqsOptions {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export function useFaqs(options: UseFaqsOptions = {}) {
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (options.categorySlug) params.set('category_slug', options.categorySlug);
    if (options.featured !== undefined) params.set('featured', String(options.featured));
    if (options.search) params.set('search', options.search);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));

    const url = `/api/cms/faqs${params.toString() ? '?' + params.toString() : ''}`;
    const result = await fetchApi<CmsFaqsResponse>(url);

    if (result.success && result.data) {
      setFaqs(result.data.faqs);
      setPagination(result.data.pagination);
      setError(null);
    } else {
      setError(result.message || 'Failed to load FAQs');
    }
    setLoading(false);
  }, [options.categorySlug, options.featured, options.search, options.limit, options.offset]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return { faqs, pagination, loading, error, refetch: fetchFaqs };
}

// Hook for FAQ categories
export function useFaqCategories() {
  const [categories, setCategories] = useState<CmsFaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const result = await fetchApi<CmsFaqCategory[]>('/api/cms/faqs/categories');
      if (result.success && result.data) {
        setCategories(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load FAQ categories');
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// Hook for team members
interface UseTeamOptions {
  department?: string;
  featured?: boolean;
  instructorsOnly?: boolean;
}

export function useTeam(options: UseTeamOptions = {}) {
  const [members, setMembers] = useState<CmsTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      setLoading(true);
      const params = new URLSearchParams();
      if (options.department) params.set('department', options.department);
      if (options.featured !== undefined) params.set('featured', String(options.featured));
      if (options.instructorsOnly) params.set('instructors', 'true');

      const url = `/api/cms/team${params.toString() ? '?' + params.toString() : ''}`;
      const result = await fetchApi<CmsTeamMember[]>(url);

      if (result.success && result.data) {
        setMembers(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load team');
      }
      setLoading(false);
    }
    fetchTeam();
  }, [options.department, options.featured, options.instructorsOnly]);

  return { members, loading, error };
}

// Hook for partners/accreditations
interface UsePartnersOptions {
  type?: 'accreditation' | 'certification' | 'client' | 'partner' | 'sponsor' | 'association';
  featured?: boolean;
}

export function usePartners(options: UsePartnersOptions = {}) {
  const [partners, setPartners] = useState<CmsPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      const params = new URLSearchParams();
      if (options.type) params.set('type', options.type);
      if (options.featured !== undefined) params.set('featured', String(options.featured));

      const url = `/api/cms/partners${params.toString() ? '?' + params.toString() : ''}`;
      const result = await fetchApi<CmsPartner[]>(url);

      if (result.success && result.data) {
        setPartners(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load partners');
      }
      setLoading(false);
    }
    fetchPartners();
  }, [options.type, options.featured]);

  return { partners, loading, error };
}

// Hook for homepage data (combined)
export function useHomepage() {
  const [data, setData] = useState<CmsHomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomepage() {
      setLoading(true);
      const result = await fetchApi<CmsHomepageData>('/api/cms/homepage');
      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load homepage data');
      }
      setLoading(false);
    }
    fetchHomepage();
  }, []);

  return { data, loading, error };
}

// Hook for statistics
interface UseStatisticsOptions {
  location?: 'hero' | 'about' | 'footer' | 'homepage' | 'accreditations';
  type?: 'counter' | 'percentage' | 'text';
}

export function useStatistics(options: UseStatisticsOptions = {}) {
  const [statistics, setStatistics] = useState<CmsStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatistics() {
      setLoading(true);
      const params = new URLSearchParams();
      if (options.location) params.set('location', options.location);
      if (options.type) params.set('type', options.type);

      const url = `/api/cms/statistics${params.toString() ? '?' + params.toString() : ''}`;
      const result = await fetchApi<CmsStatistic[]>(url);

      if (result.success && result.data) {
        setStatistics(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load statistics');
      }
      setLoading(false);
    }
    fetchStatistics();
  }, [options.location, options.type]);

  return { statistics, loading, error };
}

// Hook for consultancy services
interface UseServicesOptions {
  categorySlug?: string;
  featured?: boolean;
  homepage?: boolean;
  limit?: number;
  offset?: number;
}

export function useServices(options: UseServicesOptions = {}) {
  const [services, setServices] = useState<CmsService[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (options.categorySlug) params.set('category_slug', options.categorySlug);
    if (options.featured !== undefined) params.set('featured', String(options.featured));
    if (options.homepage !== undefined) params.set('homepage', String(options.homepage));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));

    const url = `/api/cms/services${params.toString() ? '?' + params.toString() : ''}`;
    const result = await fetchApi<CmsServicesResponse>(url);

    if (result.success && result.data) {
      setServices(result.data.services);
      setPagination(result.data.pagination);
      setError(null);
    } else {
      setError(result.message || 'Failed to load services');
    }
    setLoading(false);
  }, [options.categorySlug, options.featured, options.homepage, options.limit, options.offset]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, pagination, loading, error, refetch: fetchServices };
}

// Hook for service categories
export function useServiceCategories() {
  const [categories, setCategories] = useState<CmsServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const result = await fetchApi<CmsServiceCategory[]>('/api/cms/services/categories');
      if (result.success && result.data) {
        setCategories(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load service categories');
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// Hook for a single service by slug
export function useService(slug: string) {
  const [service, setService] = useState<CmsService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchService() {
      if (!slug) return;
      setLoading(true);
      const result = await fetchApi<CmsService>(`/api/cms/services/${slug}`);
      if (result.success && result.data) {
        setService(result.data);
        setError(null);
      } else {
        setError(result.message || 'Service not found');
      }
      setLoading(false);
    }
    fetchService();
  }, [slug]);

  return { service, loading, error };
}
