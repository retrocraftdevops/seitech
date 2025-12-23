'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  ClipboardCheck,
  FileSearch,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Service {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  features: string[];
  slug: string;
}

const consultancyServices: Service[] = [
  {
    id: '1',
    icon: Shield,
    title: 'Health & Safety Audits',
    description:
      'Comprehensive workplace audits to identify hazards, assess compliance, and improve safety culture.',
    features: [
      'Site inspections',
      'Compliance reviews',
      'Detailed reporting',
      'Action plans',
    ],
    slug: 'health-safety-audits',
  },
  {
    id: '2',
    icon: FileSearch,
    title: 'Risk Assessments',
    description:
      'Professional risk assessment services to help you identify, evaluate, and control workplace risks.',
    features: [
      'Hazard identification',
      'Risk evaluation',
      'Control measures',
      'Documentation',
    ],
    slug: 'risk-assessments',
  },
  {
    id: '3',
    icon: ClipboardCheck,
    title: 'Policy Development',
    description:
      'Create and implement effective health and safety policies tailored to your organization.',
    features: [
      'Custom policies',
      'Legal compliance',
      'Implementation support',
      'Regular updates',
    ],
    slug: 'policy-development',
  },
  {
    id: '4',
    icon: AlertTriangle,
    title: 'Accident Investigation',
    description:
      'Expert accident and incident investigation services to prevent future occurrences.',
    features: [
      'Root cause analysis',
      'Witness interviews',
      'Corrective actions',
      'Prevention strategies',
    ],
    slug: 'accident-investigation',
  },
  {
    id: '5',
    icon: Users,
    title: 'Safety Management Systems',
    description:
      'Develop and implement comprehensive safety management systems to improve organizational performance.',
    features: [
      'ISO 45001 implementation',
      'System design',
      'Documentation',
      'Continuous improvement',
    ],
    slug: 'safety-management-systems',
  },
  {
    id: '6',
    icon: TrendingUp,
    title: 'Compliance Support',
    description:
      'Ongoing support to ensure your organization meets all relevant health and safety regulations.',
    features: [
      'Regulatory updates',
      'Compliance monitoring',
      'Expert guidance',
      'Regular reviews',
    ],
    slug: 'compliance-support',
  },
];

export function ConsultancyServicesSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Professional{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Consultancy Services
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert health, safety, and environmental consultancy to help your
              organization achieve compliance and excellence
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {consultancyServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/services/${service.slug}`}>
                  <Card hover className="h-full group cursor-pointer">
                    <CardContent>
                      {/* Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4">{service.description}</p>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                        <span>Learn More</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} asChild>
            <Link href="/services">View All Services</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
