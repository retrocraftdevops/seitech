import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Award, TrendingUp } from 'lucide-react';
import { consultancyServices, serviceCategories as staticCategories } from '@/config/services';
import { ServiceCard } from '@/components/features/consultancy';
import { Button } from '@/components/ui/Button';
import type { CmsService, CmsServiceCategory } from '@/types';

export const metadata: Metadata = {
  title: 'Consultancy Services | SEI Tech - Health & Safety Solutions',
  description:
    'Expert health and safety consultancy services including fire risk assessments, ISO certifications, workplace audits, and compliance support. Protect your business with professional guidance.',
  keywords:
    'health and safety consultancy, fire risk assessment, ISO 45001, ISO 14001, ISO 9001, workplace audit, risk assessment, legionella testing, DSE assessment',
  openGraph: {
    title: 'Professional Health & Safety Consultancy Services | SEI Tech',
    description:
      'Expert consultancy services to ensure your business meets health and safety regulations. From fire risk assessments to ISO certifications.',
    type: 'website',
  },
};

// Fetch services from API
async function getServices(): Promise<{ services: CmsService[]; categories: CmsServiceCategory[] }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const [servicesRes, categoriesRes] = await Promise.all([
      fetch(`${baseUrl}/api/cms/services`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/cms/services/categories`, { cache: 'no-store' }),
    ]);

    const servicesData = await servicesRes.json();
    const categoriesData = await categoriesRes.json();

    if (servicesData.success && categoriesData.success) {
      return {
        services: servicesData.data?.services || [],
        categories: categoriesData.data || [],
      };
    }
  } catch (error) {
    console.warn('Failed to fetch services from API:', error);
  }
  return { services: [], categories: [] };
}

// Group services by category
function groupServicesByCategory(services: CmsService[], categories: CmsServiceCategory[]) {
  return categories.map(category => ({
    id: category.slug,
    name: category.name,
    description: category.description,
    services: services.filter(s => s.categorySlug === category.slug),
  })).filter(cat => cat.services.length > 0);
}

export default async function ServicesPage() {
  const { services: apiServices, categories: apiCategories } = await getServices();

  // Use API data or fall back to static config
  const serviceCategories = apiServices.length > 0
    ? groupServicesByCategory(apiServices, apiCategories)
    : staticCategories;
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-28">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-display">
              Professional Health & Safety
              <span className="block mt-2 bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                Consultancy Services
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Expert guidance and support to help your business achieve compliance, reduce risks,
              and create a safer workplace for everyone.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-soft mb-2">
                  <Shield className="w-6 h-6 text-secondary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">500+</p>
                <p className="text-sm text-gray-600">Clients Served</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-soft mb-2">
                  <Award className="w-6 h-6 text-secondary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">15+</p>
                <p className="text-sm text-gray-600">Years Experience</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-soft mb-2">
                  <TrendingUp className="w-6 h-6 text-secondary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-sm text-gray-600">Satisfaction Rate</p>
              </div>
            </div>

            <Link href="/free-consultation">
              <Button size="lg" variant="secondary" className="shadow-glow-lg">
                Book Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services by Category */}
      {serviceCategories.map((category, categoryIndex) => (
        <section
          key={category.id}
          className={categoryIndex % 2 === 0 ? 'bg-white py-16 md:py-24' : 'bg-gray-50 py-16 md:py-24'}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Category Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
                  {category.name}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Service Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* All Services Overview */}
      <section className="bg-gradient-to-br from-secondary-50 to-primary-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-display">
              Need Something Specific?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find exactly what you're looking for? We offer bespoke consultancy solutions
              tailored to your unique requirements.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/free-consultation">
                <Button size="lg" variant="secondary">
                  Request Custom Quote
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Accredited Experts</h3>
                <p className="text-gray-600">
                  Our consultants hold industry-recognized qualifications and certifications.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nationwide Coverage</h3>
                <p className="text-gray-600">
                  We provide services across the UK, supporting businesses of all sizes.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ongoing Support</h3>
                <p className="text-gray-600">
                  Receive continuous guidance and updates to maintain compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
