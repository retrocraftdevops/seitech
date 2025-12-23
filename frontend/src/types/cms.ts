// CMS Types for SEI Tech Frontend

// Site Settings
export interface SiteSettings {
  siteName: string;
  logo: string | null;
  logoDark: string | null;
  favicon: string | null;
  tagline: string;
  contact: {
    companyName: string;
    email: string;
    phone: string;
    phoneSecondary: string;
    whatsapp: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      postcode: string;
      country: string;
    };
    googleMapsUrl: string;
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  businessHours: string;
  timezone: string;
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultOgImage: string | null;
    googleAnalyticsId: string;
    googleTagManagerId: string;
  };
  legal: {
    companyNumber: string;
    vatNumber: string;
    privacyPolicyUrl: string;
    termsUrl: string;
    cookiePolicyUrl: string;
  };
  features: {
    enableLiveChat: boolean;
    enableNewsletter: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  footer: {
    text: string;
    copyright: string;
  };
}

// Page and Sections
export interface CmsPage {
  id: number;
  name: string;
  slug: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string | null;
  sections: CmsSection[];
}

export interface CmsSection {
  id: number;
  identifier: string;
  type: SectionType;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  image: string | null;
  imageAlt: string;
  backgroundImage: string | null;
  videoUrl: string;
  backgroundColor: string;
  textColor: string;
  layout: SectionLayout;
  ctaText: string;
  ctaUrl: string;
  ctaStyle: 'primary' | 'secondary' | 'outline';
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  cssClass: string;
  items: CmsSectionItem[];
  sequence: number;
  // Related content (populated based on section type)
  testimonials?: CmsTestimonial[];
  faqs?: CmsFaq[];
  teamMembers?: CmsTeamMember[];
  partners?: CmsPartner[];
}

export type SectionType =
  | 'hero'
  | 'features'
  | 'services'
  | 'cta'
  | 'stats'
  | 'testimonials'
  | 'faq'
  | 'team'
  | 'partners'
  | 'pricing'
  | 'contact'
  | 'content'
  | 'gallery'
  | 'video'
  | 'custom';

export type SectionLayout =
  | 'default'
  | 'centered'
  | 'left'
  | 'right'
  | 'full-width'
  | 'grid';

export interface CmsSectionItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  icon: string;
  iconColor: string;
  image: string | null;
  imageAlt: string;
  url: string;
  urlText: string;
  openNewTab: boolean;
  statValue: string;
  statSuffix: string;
  statPrefix: string;
  cssClass: string;
  sequence: number;
}

// Testimonials
export interface CmsTestimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar: string | null;
  content: string;
  rating: number;
  courseId: number | null;
  courseName: string | null;
  serviceType: 'training' | 'consultancy' | 'elearning' | 'general';
  isFeatured: boolean;
  source: 'google' | 'trustpilot' | 'linkedin' | 'direct' | 'survey';
  sourceUrl: string;
  date: string | null;
}

// FAQs
export interface CmsFaqCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  faqCount: number;
  faqs: CmsFaq[];
}

export interface CmsFaq {
  id: number;
  question: string;
  answer: string;
  shortAnswer: string;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  isFeatured: boolean;
  viewCount: number;
  helpfulCount: number;
}

// Team Members
export interface CmsTeamMember {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  jobTitle: string;
  department: string;
  shortBio: string;
  fullBio: string;
  qualifications: string;
  certifications: string;
  specializations: string;
  email: string;
  linkedinUrl: string;
  twitterUrl: string;
  isInstructor: boolean;
  isFeatured: boolean;
}

// Partners/Accreditations
export interface CmsPartner {
  id: number;
  name: string;
  logo: string | null;
  logoDark: string | null;
  websiteUrl: string;
  description: string;
  partnerType: 'accreditation' | 'certification' | 'client' | 'partner' | 'sponsor' | 'association';
  accreditationNumber: string;
  accreditationExpiry: string | null;
  certificateUrl: string;
  isFeatured: boolean;
}

// Navigation
export interface CmsNavItem {
  id: number;
  name: string;
  url: string;
  icon: string;
  description: string;
  openNewTab: boolean;
  isHighlighted: boolean;
  children: CmsNavItem[];
}

// API Responses
export interface CmsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CmsHomepageData {
  page: CmsPage | null;
  testimonials: CmsTestimonial[];
  partners: CmsPartner[];
  team: CmsTeamMember[];
  faqs: CmsFaq[];
  statistics: CmsStatistic[];
  services: CmsService[];
  settings: SiteSettings;
}

export interface CmsTestimonialsResponse {
  testimonials: CmsTestimonial[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CmsFaqsResponse {
  faqs: CmsFaq[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// CMS Services (Consultancy)
export interface CmsServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  serviceCount: number;
}

export interface CmsService {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  image: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  features: string[];
  benefits: string[];
  pricingType: 'free' | 'fixed' | 'quote' | 'hourly' | 'package';
  priceFrom: number;
  priceTo: number;
  priceCurrency: string;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
}

export interface CmsServicesResponse {
  services: CmsService[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// CMS Statistics
export interface CmsStatistic {
  id: number;
  name: string;
  value: string;
  numericValue: number;
  suffix: string;
  description: string;
  icon: string;
  statType: 'counter' | 'percentage' | 'text';
  displayLocation: 'hero' | 'about' | 'footer' | 'homepage' | 'accreditations';
}
