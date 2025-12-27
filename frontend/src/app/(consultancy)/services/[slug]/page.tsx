import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { consultancyServices } from '@/config/services';
import {
  ServiceHero,
  ServiceFeatures,
  ServiceProcess,
  ServiceFAQ,
  ServiceCard,
} from '@/components/features/consultancy';
import { Button } from '@/components/ui/Button';
import type { ServiceSlug, ServiceProcess as ServiceProcessType, ServiceFAQ as ServiceFAQType, CmsService } from '@/types';

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fetch service from API
async function getService(slug: string): Promise<CmsService | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      return null; // Skip fetch during build if no URL configured
    }
    const response = await fetch(`${baseUrl}/api/cms/services/${slug}`, {
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.warn('Failed to fetch service from API:', error);
  }
  return null;
}

// Fetch all services for related services
async function getAllServices(): Promise<CmsService[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      return []; // Return empty during build if no URL configured
    }
    const response = await fetch(`${baseUrl}/api/cms/services`, {
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success && result.data?.services) {
      return result.data.services;
    }
  } catch (error) {
    console.warn('Failed to fetch services from API:', error);
  }
  return [];
}

// Generate static params for all services
export async function generateStaticParams() {
  const apiServices = await getAllServices();
  if (apiServices.length > 0) {
    return apiServices.map((service) => ({
      slug: service.slug,
    }));
  }
  // Fallback to static config
  return consultancyServices.map((service) => ({
    slug: service.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const apiService = await getService(resolvedParams.slug);
  const service = apiService || consultancyServices.find((s) => s.slug === resolvedParams.slug);

  if (!service) {
    return {
      title: 'Service Not Found | SEI Tech',
    };
  }

  return {
    title: `${service.name} | SEI Tech Consultancy Services`,
    description: service.shortDescription,
    keywords: `${service.name}, health and safety, consultancy, compliance, ${resolvedParams.slug}`,
    openGraph: {
      title: `${service.name} | Professional Health & Safety Consultancy`,
      description: service.shortDescription,
      type: 'website',
    },
  };
}

// Mock process data (in a real app, this would come from the service config)
const getServiceProcess = (slug: string): ServiceProcessType[] => {
  const processMap: Record<string, ServiceProcessType[]> = {
    'fire-risk-assessment': [
      {
        step: 1,
        title: 'Initial Consultation',
        description: 'Discuss your premises and specific requirements with our expert consultants.',
        icon: 'Phone',
      },
      {
        step: 2,
        title: 'Site Survey',
        description: 'Comprehensive walkthrough of your premises to identify fire hazards and risks.',
        icon: 'Search',
      },
      {
        step: 3,
        title: 'Risk Analysis',
        description: 'Detailed evaluation of fire safety measures and emergency procedures.',
        icon: 'BarChart',
      },
      {
        step: 4,
        title: 'Report Delivery',
        description: 'Receive a comprehensive written report with prioritized recommendations.',
        icon: 'FileText',
      },
    ],
    'health-safety-audit': [
      {
        step: 1,
        title: 'Planning',
        description: 'Define scope and objectives of the audit with your team.',
        icon: 'Calendar',
      },
      {
        step: 2,
        title: 'Documentation Review',
        description: 'Examine policies, procedures, and health & safety records.',
        icon: 'FileSearch',
      },
      {
        step: 3,
        title: 'Site Inspection',
        description: 'Physical inspection of workplace conditions and practices.',
        icon: 'Eye',
      },
      {
        step: 4,
        title: 'Gap Analysis',
        description: 'Identify compliance gaps and areas for improvement with action plan.',
        icon: 'ClipboardCheck',
      },
    ],
  };

  // Default process for services without specific process
  const defaultProcess: ServiceProcessType[] = [
    {
      step: 1,
      title: 'Consultation',
      description: 'Discuss your requirements and objectives with our team.',
      icon: 'MessageSquare',
    },
    {
      step: 2,
      title: 'Assessment',
      description: 'Conduct thorough evaluation and analysis of your needs.',
      icon: 'Search',
    },
    {
      step: 3,
      title: 'Implementation',
      description: 'Execute the service with precision and professionalism.',
      icon: 'Settings',
    },
    {
      step: 4,
      title: 'Follow-up',
      description: 'Provide ongoing support and ensure complete satisfaction.',
      icon: 'CheckCircle',
    },
  ];

  return processMap[slug] || defaultProcess;
};

// Mock FAQ data (in a real app, this would come from the service config)
const getServiceFAQs = (slug: string, serviceName: string): ServiceFAQType[] => {
  return [
    {
      question: `How long does a ${serviceName} take?`,
      answer: `The duration depends on the size and complexity of your premises or organization. Typically, the process takes between 1-3 days, including the site visit and report preparation. We'll provide a more accurate timeline during the initial consultation.`,
    },
    {
      question: 'What information do I need to provide?',
      answer: `We'll need basic information about your organization, including premises layout, number of employees, and any existing health and safety documentation. Our team will guide you through the specific requirements during the booking process.`,
    },
    {
      question: 'Will this service ensure compliance with regulations?',
      answer: `Yes, our consultancy services are designed to help you achieve and maintain compliance with all relevant UK health and safety regulations. We provide detailed recommendations and ongoing support to ensure you meet legal requirements.`,
    },
    {
      question: 'What happens after the assessment?',
      answer: `You'll receive a comprehensive written report detailing our findings, risk ratings, and prioritized recommendations. We also offer follow-up support to help you implement the recommendations and maintain compliance.`,
    },
    {
      question: 'Do you offer ongoing support?',
      answer: `Absolutely. We provide ongoing consultancy support to help you maintain compliance, conduct regular reviews, and adapt to changing regulations. We can discuss a tailored support package during your consultation.`,
    },
  ];
};

export default async function ServicePage({ params }: ServicePageProps) {
  const resolvedParams = await params;
  const apiService = await getService(resolvedParams.slug);
  const apiServices = await getAllServices();

  // Use API service or fall back to static config
  const service = apiService || consultancyServices.find((s) => s.slug === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  // Get related services (excluding current service)
  const allServices = apiServices.length > 0 ? apiServices : consultancyServices;
  const relatedServices = allServices
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  const processSteps = getServiceProcess(resolvedParams.slug);
  const faqs = getServiceFAQs(resolvedParams.slug, service.name || '');

  // Use API features/benefits if available
  const features = apiService?.features || (service as any).features || [];
  const benefits = apiService?.benefits || (service as any).benefits || [];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <ServiceHero
        name={service.name || ''}
        shortDescription={service.shortDescription || ''}
        iconName={service.iconName}
        pricingType={service.pricingType || 'quote'}
        priceFrom={service.priceFrom}
      />

      {/* Features & Benefits */}
      {features.length > 0 && (
        <ServiceFeatures features={features} benefits={benefits} />
      )}

      {/* Process Steps */}
      <ServiceProcess process={processSteps} />

      {/* FAQ Section */}
      <ServiceFAQ faqs={faqs} />

      {/* CTA Section */}
      <section id="contact" className="bg-gradient-to-br from-secondary-600 to-primary-600 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Book a free consultation to discuss your {service.name?.toLowerCase()} requirements
              with our expert team.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/free-consultation">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:+441234567890">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </Button>
              </a>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-90">
              <a
                href="tel:+441234567890"
                className="flex items-center gap-2 hover:opacity-100 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                <span>+44 (0) 123 456 7890</span>
              </a>
              <a
                href="mailto:info@seitech.co.uk"
                className="flex items-center gap-2 hover:opacity-100 transition-opacity"
              >
                <Mail className="w-4 h-4" />
                <span>info@seitech.co.uk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
                  Related Services
                </h2>
                <p className="text-lg text-gray-600">
                  Explore other services that might complement your requirements.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {relatedServices.map((relatedService) => (
                  <ServiceCard key={relatedService.id} service={relatedService} variant="compact" />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/services">
                  <Button variant="outline" size="lg">
                    View All Services
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
