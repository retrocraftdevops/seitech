export interface ConsultancyService {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  iconName: string;

  features: string[];
  benefits: string[];
  process: ServiceProcess[];

  priceFrom?: number;
  pricingType: 'fixed' | 'quote' | 'hourly';

  relatedServices: number[];
  faqs: ServiceFAQ[];

  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
}

export interface ServiceProcess {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: ConsultancyService[];
}

export interface ConsultationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  serviceInterested: string[];
  message: string;
  preferredContact: 'email' | 'phone';
  preferredTime?: string;
}

export type ServiceSlug =
  | 'fire-risk-assessment'
  | 'health-safety-audit'
  | 'risk-assessment'
  | 'face-fit-testing'
  | 'site-inspections'
  | 'dse-assessments'
  | 'legionella-assessment'
  | 'workplace-audits'
  | 'iso-45001'
  | 'iso-14001'
  | 'iso-9001'
  | 'policy-writing';
