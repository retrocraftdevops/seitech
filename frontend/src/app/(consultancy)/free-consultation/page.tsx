import { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  Shield,
  Users,
  Award,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Free Consultation',
  description:
    'Book a free consultation with our health and safety experts. Get tailored advice on training and compliance solutions for your organisation.',
};

const benefits = [
  {
    icon: Shield,
    title: 'Expert Guidance',
    description: 'Speak with qualified health & safety professionals',
  },
  {
    icon: Users,
    title: 'Tailored Solutions',
    description: 'Get recommendations specific to your industry',
  },
  {
    icon: Award,
    title: 'No Obligation',
    description: 'Free advice with no pressure to commit',
  },
  {
    icon: Calendar,
    title: 'Quick Response',
    description: 'We respond within 24 hours',
  },
];

const services = [
  'Training needs assessment',
  'Compliance gap analysis',
  'Fire risk assessment requirements',
  'ISO certification guidance',
  'Health & safety audits',
  'Bespoke training programmes',
];

export default function FreeConsultationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-sm font-semibold text-primary-400 uppercase tracking-wider mb-3">
                Free Consultation
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Get Expert Advice for Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                  Safety Needs
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Book a free, no-obligation consultation with our health and safety
                experts. We'll assess your requirements and provide tailored
                recommendations for training and compliance solutions.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{benefit.title}</p>
                      <p className="text-sm text-gray-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <Card className="shadow-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Request a Callback
                </h2>
                <p className="text-gray-600 mb-6">
                  Fill in your details and we'll get back to you within 24 hours.
                </p>
                <ConsultationForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* What We Can Help With */}
      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Services List */}
            <div>
              <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
                How We Can Help
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What We'll Discuss
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                During your consultation, our experts can provide guidance on:
              </p>
              <ul className="space-y-4">
                {services.map((service) => (
                  <li key={service} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Prefer to Call?
                  </h3>
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-4 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-7 h-7 text-primary-600" />
                    </div>
                    {siteConfig.contact.phone}
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Send an Email
                  </h3>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="flex items-center gap-4 text-lg text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-7 h-7 text-primary-600" />
                    </div>
                    {siteConfig.contact.email}
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Business Hours
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-7 h-7 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <strong>Monday - Friday:</strong>{' '}
                        {siteConfig.businessHours.weekdays}
                      </p>
                      <p className="text-gray-700">
                        <strong>Saturday:</strong>{' '}
                        {siteConfig.businessHours.saturday}
                      </p>
                      <p className="text-gray-700">
                        <strong>Sunday:</strong> {siteConfig.businessHours.sunday}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Our Location</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-7 h-7 text-gray-600" />
                    </div>
                    <address className="not-italic text-gray-700">
                      {siteConfig.contact.address.street}
                      <br />
                      {siteConfig.contact.address.city},{' '}
                      {siteConfig.contact.address.county}
                      <br />
                      {siteConfig.contact.address.postcode}
                    </address>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-primary-600 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">
                Ready to Browse Our Courses?
              </h2>
              <p className="text-primary-100">
                Explore our full range of accredited training courses.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors"
            >
              View All Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
